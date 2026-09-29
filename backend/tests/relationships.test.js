import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import {
  getRelatedStandards,
  getRelatedStandardsByType,
  getRelationshipGraph,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  validateRelationship,
} from "../src/services/standardRelationshipService.js";
import { recommend } from "../src/services/recommendation/recommendationService.js";

describe("Phase 12 Allied Standards & Knowledge Relationships Test Suite", () => {
  let stdA, stdB, stdC, stdD;
  let createdRelIds = [];

  before(async () => {
    // Lookup seeded standards or create test standards
    stdA = await prisma.standard.findUnique({ where: { standardNumber: "IS 2347:2023" } });
    stdB = await prisma.standard.findUnique({ where: { standardNumber: "IS 6911:2017" } });
    stdC = await prisma.standard.findUnique({ where: { standardNumber: "IS 7466:1994" } });
    stdD = await prisma.standard.findUnique({ where: { standardNumber: "IS 1239 (Part 2):1992" } }); // Withdrawn

    assert.ok(stdA, "IS 2347:2023 must exist");
    assert.ok(stdB, "IS 6911:2017 must exist");
  });

  after(async () => {
    if (createdRelIds.length > 0) {
      await prisma.relatedStandard.deleteMany({
        where: { id: { in: createdRelIds } },
      }).catch(() => null);
    }
  });

  // Test 1: Creating a valid relationship
  it("1. should create a valid relationship between two standards", async () => {
    const rel = await createRelationship({
      standardId: stdB.id,
      relatedStandardId: stdC.id,
      relationshipType: "EQUIVALENT",
      notes: "Demo test relationship — verify against authoritative BIS source.",
      status: "DEMO",
    });

    createdRelIds.push(rel.id);
    assert.ok(rel.id);
    assert.equal(rel.standardId, stdB.id);
    assert.equal(rel.relatedStandardId, stdC.id);
    assert.equal(rel.relationshipType, "EQUIVALENT");
    assert.equal(rel.status, "DEMO");
  });

  // Test 2: Preventing self-reference
  it("2. should reject self-referencing relationship", async () => {
    await assert.rejects(
      async () => {
        await createRelationship({
          standardId: stdA.id,
          relatedStandardId: stdA.id,
          relationshipType: "NORMATIVE_REFERENCE",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes("Self-referencing relationship is forbidden"));
        return true;
      }
    );
  });

  // Test 3: Preventing duplicate relationships
  it("3. should reject duplicate relationship of the same type", async () => {
    // IS 2347:2023 -> IS 6911:2017 with MATERIAL was seeded
    await assert.rejects(
      async () => {
        await createRelationship({
          standardId: stdA.id,
          relatedStandardId: stdB.id,
          relationshipType: "MATERIAL",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.ok(err.message.includes("already exists"));
        return true;
      }
    );
  });

  // Test 4: Getting related standards
  it("4. should retrieve related standards with metadata and currentness", async () => {
    const result = await getRelatedStandards(stdA.id, { direction: "OUTGOING" });

    assert.ok(result.total > 0);
    assert.equal(result.standard.standardNumber, "IS 2347:2023");
    assert.ok(Array.isArray(result.relatedStandards));

    const materialRel = result.relatedStandards.find((r) => r.relationshipType === "MATERIAL");
    assert.ok(materialRel, "Must include MATERIAL relationship");
    assert.ok(materialRel.standard.standardNumber);
    assert.ok(materialRel.standard.status);
    assert.equal(materialRel.direction, "OUTGOING");
    assert.ok(materialRel.notes.includes("Demo"));
  });

  // Test 5: Filtering by relationship type
  it("5. should filter connected standards by relationship type", async () => {
    const result = await getRelatedStandardsByType(stdA.id, "COMPONENT");

    assert.ok(result.relatedStandards.length > 0);
    assert.ok(result.relatedStandards.every((r) => r.relationshipType === "COMPONENT"));
  });

  // Test 6: Getting incoming relationships
  it("6. should retrieve incoming relationships where standard is the target", async () => {
    const result = await getRelatedStandards(stdA.id, { direction: "INCOMING" });

    assert.ok(result.relatedStandards.length > 0);
    assert.ok(result.relatedStandards.every((r) => r.direction === "INCOMING"));
  });

  // Test 7: Graph depth = 1
  it("7. should generate relationship graph with depth 1", async () => {
    const graph = await getRelationshipGraph(stdA.id, { depth: 1 });

    assert.equal(graph.depth, 1);
    assert.equal(graph.rootStandardNumber, "IS 2347:2023");
    assert.ok(graph.nodes.length >= 2, "Graph must have root and connected nodes");
    assert.ok(graph.edges.length >= 1, "Graph must have edges");

    const rootNode = graph.nodes.find((n) => n.isRoot);
    assert.ok(rootNode);
    assert.equal(rootNode.standardNumber, "IS 2347:2023");
  });

  // Test 8: Graph depth = 2
  it("8. should traverse knowledge graph up to depth 2", async () => {
    const graph = await getRelationshipGraph(stdA.id, { depth: 2 });

    assert.equal(graph.depth, 2);
    assert.ok(graph.nodes.length >= graph.edges.length ? 1 : 0);
    assert.ok(graph.nodes.some((n) => n.level === 0));
    assert.ok(graph.nodes.some((n) => n.level === 1));
  });

  // Test 9: Graph depth > 3 is capped at 3
  it("9. should cap requested depth at 3 to prevent uncontrolled traversal", async () => {
    const graph = await getRelationshipGraph(stdA.id, { depth: 10 });

    assert.equal(graph.depth, 3, "Depth must be capped at 3");
    assert.equal(graph.maxDepthAllowed, 3);
  });

  // Test 10: Missing standard
  it("10. should return 404 for non-existent standard", async () => {
    await assert.rejects(
      async () => {
        await getRelatedStandards("non-existent-uuid-9999");
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.ok(err.message.includes("Standard not found"));
        return true;
      }
    );
  });

  // Test 11: Invalid relationship type
  it("11. should reject invalid relationship types with 400 error", async () => {
    await assert.rejects(
      async () => {
        await validateRelationship({
          standardId: stdA.id,
          relatedStandardId: stdB.id,
          relationshipType: "MAGIC_LINK",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes("Invalid relationship type"));
        return true;
      }
    );
  });

  // Test 12: Superseded/withdrawn related standard handling
  it("12. should identify currentness status of related standards including WITHDRAWN", async () => {
    // Create temporary link to withdrawn pipe standard
    const rel = await createRelationship({
      standardId: stdA.id,
      relatedStandardId: stdD.id,
      relationshipType: "APPLIES_TO",
      notes: "Demo test link to historical standard",
      status: "DEMO",
    });
    createdRelIds.push(rel.id);

    const related = await getRelatedStandards(stdA.id, { type: "APPLIES_TO" });
    const withdrawnRel = related.relatedStandards.find((r) => r.standard.standardNumber.includes("IS 1239"));

    assert.ok(withdrawnRel);
    assert.equal(withdrawnRel.standard.status, "WITHDRAWN");
  });

  // Test 13: Recommendation engine returns allied standards
  it("13. should include allied standards in recommendation result", async () => {
    const rec = await recommend("Stainless steel pressure cooker 5 litre institutional kitchen");

    assert.ok(rec.primaryRecommendation);
    assert.equal(rec.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.ok(Array.isArray(rec.relatedStandards), "Must return related standards array");
    assert.ok(rec.relatedStandards.length > 0, "Must have connected allied standards");
    assert.ok(rec.alliedStandards.length > 0, "Must have alliedStandards alias");

    const materialAllied = rec.relatedStandards.find((r) => r.relationshipType === "MATERIAL");
    assert.ok(materialAllied);
  });

  // Test 14: Empty relationship state
  it("14. should handle standards with no relationships gracefully without failing", async () => {
    // stdD (IS 1239:1992) has no outgoing relationships by default
    const result = await getRelatedStandards(stdD.id, { direction: "OUTGOING", type: "INSTALLATION" });

    assert.equal(result.total, 0);
    assert.equal(result.relatedStandards.length, 0);
    assert.ok(result.standard);
  });

  // Test 15: Relationship update and delete lifecycle
  it("15. should support update and deletion of relationships", async () => {
    // 1. Create
    const rel = await createRelationship({
      standardId: stdC.id,
      relatedStandardId: stdB.id,
      relationshipType: "COMPONENT",
      notes: "Lifecycle test note",
    });
    assert.ok(rel.id);

    // 2. Update
    const updated = await updateRelationship(rel.id, {
      notes: "Updated lifecycle test note",
      relationshipType: "MATERIAL",
    });
    assert.equal(updated.notes, "Updated lifecycle test note");
    assert.equal(updated.relationshipType, "MATERIAL");

    // 3. Delete
    const deleted = await deleteRelationship(rel.id);
    assert.equal(deleted.success, true);

    const check = await prisma.relatedStandard.findUnique({ where: { id: rel.id } });
    assert.equal(check, null);
  });
});
