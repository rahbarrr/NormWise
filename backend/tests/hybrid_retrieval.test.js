/**
 * Phase 15 Test Suite: Hybrid Retrieval & Semantic Recommendation Engine
 * Adheres strictly to Section 32 of Phase 15 specification.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import {
  normalizeRequirement,
  detectLanguage,
  harmonizeTerminology,
} from "../src/services/requirement/normalizationService.js";
import { matchStructuredStandards } from "../src/services/structuredMatchService.js";
import { searchSimilarStandards } from "../src/services/vectorSearchService.js";
import {
  generateRequirementEmbedding,
  computeContentHash,
  getStandardSearchableText,
} from "../src/services/embeddingService.js";
import { retrieveCandidates } from "../src/services/retrieval/retrievalService.js";
import {
  scoreCandidate,
  rankCandidates,
  generateMatchBreakdownExplanation,
} from "../src/services/standardRankingService.js";
import { recommend } from "../src/services/recommendation/recommendationService.js";

describe("Phase 15 Hybrid Retrieval & Semantic Recommendation Engine", () => {
  // 1. Requirement Normalization
  it("1. should normalize requirement attributes without hallucination", () => {
    const input = "Stainless steel pressure cooker, 5 litre, for institutional kitchen use.";
    const norm = normalizeRequirement(input);

    assert.equal(norm.product?.toLowerCase(), "pressure cooker");
    assert.ok(norm.material?.toLowerCase().includes("stainless steel"));
    assert.equal(norm.capacity, "5 Litre");
    assert.ok(norm.application?.toLowerCase().includes("kitchen"));
    assert.equal(norm.language, "en");
    assert.equal(norm.rawText, input);
  });

  // 2. Structured Matching
  it("2. should perform deterministic structured matching and withhold product score if unknown", async () => {
    const knownProduct = { product: "Pressure Cooker", material: "stainless steel", application: "kitchen" };
    const matches = await matchStructuredStandards(knownProduct);

    assert.ok(matches.length > 0, "Should find candidates for known product");
    assert.ok(matches.some((m) => m.standardNumber.includes("IS 2347")));

    const unknownProduct = { product: null, material: "steel", application: null };
    const emptyMatches = await matchStructuredStandards(unknownProduct);
    assert.equal(emptyMatches.length, 0, "Must not award structured matches without identifiable product");
  });

  // 3. Lexical Search
  it("3. should perform lexical search retrieving standards by title, scope, and keywords", async () => {
    const candidates = await retrieveCandidates("pressure cooker", {
      product: "pressure cooker",
      normalizedTerms: ["pressure cooker"],
    });

    assert.ok(candidates.length > 0, "Lexical search must retrieve candidate standards");
    assert.ok(candidates.some((c) => c.standardNumber.includes("IS 2347")));
    const is2347 = candidates.find((c) => c.standardNumber.includes("IS 2347"));
    assert.ok(is2347.retrievedBy.includes("lexical") || is2347.retrievedBy.includes("structured"));
  });

  // 4. Vector Search
  it("4. should execute pgvector similarity search or return empty array gracefully", async () => {
    // When no vector embedding is provided, must not throw
    const results = await searchSimilarStandards(null, 5);
    assert.deepEqual(results, []);

    // A mock embedding vector of length 1536
    const mockVector = new Array(1536).fill(0.01);
    const vectorResults = await searchSimilarStandards(mockVector, 5);
    assert.ok(Array.isArray(vectorResults));
  });

  // 5. Candidate Merging
  it("5. should merge candidates from multiple retrieval strategies into a single pool", async () => {
    const requirementText = "Stainless steel pressure cooker 5L";
    const extracted = normalizeRequirement(requirementText);
    const pool = await retrieveCandidates(requirementText, extracted);

    assert.ok(pool.length > 0);
    // Verify each candidate has retrievedBy tracking
    for (const cand of pool) {
      assert.ok(Array.isArray(cand.retrievedBy), "Must include retrievedBy array");
      assert.ok(cand.retrievedBy.length >= 1, "Must be tagged with at least one retrieval method");
    }
  });

  // 6. Duplicate Candidate Removal
  it("6. should deduplicate candidates across structured, lexical, and vector retrieval", async () => {
    const requirementText = "LED street lighting luminaire outdoor";
    const extracted = normalizeRequirement(requirementText);
    const pool = await retrieveCandidates(requirementText, extracted);

    const standardIds = pool.map((c) => c.standardId);
    const uniqueIds = new Set(standardIds);
    assert.equal(standardIds.length, uniqueIds.size, "Candidate pool must contain no duplicate standard IDs");
  });

  // 7. Score Calculation
  it("7. should calculate hybrid match score using exact 30/25/15/10/20 weights", () => {
    const candidate = {
      standardId: "test-std-1",
      standardNumber: "IS 2347:2023",
      title: "Pressure cookers — Specification",
      scope: "Domestic and commercial pressure cookers made of stainless steel",
      category: "Cookware",
      status: "CURRENT",
    };
    const req = {
      product: "pressure cooker",
      application: "commercial kitchen",
      material: "stainless steel",
      technicalCharacteristics: ["safety valve"],
    };

    const scored = scoreCandidate(candidate, req, "pressure cooker stainless steel", 0.90);
    assert.ok(scored.score > 0 && scored.score <= 1.0);
    assert.ok(scored.scoreBreakdown, "Must store component scores separately");
    assert.equal(typeof scored.scoreBreakdown.productScore, "number");
    assert.equal(typeof scored.scoreBreakdown.applicationScore, "number");
    assert.equal(typeof scored.scoreBreakdown.materialScore, "number");
    assert.equal(typeof scored.scoreBreakdown.technicalScore, "number");
    assert.equal(typeof scored.scoreBreakdown.semanticScore, "number");

    // Verify formula
    const expected =
      scored.scoreBreakdown.productScore * 0.30 +
      scored.scoreBreakdown.applicationScore * 0.25 +
      scored.scoreBreakdown.materialScore * 0.15 +
      scored.scoreBreakdown.technicalScore * 0.10 +
      scored.scoreBreakdown.semanticScore * 0.20;
    assert.ok(Math.abs(scored.rawScore - expected) < 0.001, "Raw score must match exact formula weights");
  });

  // 8. Currentness Filtering
  it("8. should deprioritize SUPERSEDED and WITHDRAWN standards while keeping currentness distinct from match", () => {
    const currentCandidate = {
      standardId: "std-curr",
      standardNumber: "IS 2347:2023",
      title: "Pressure cookers",
      status: "CURRENT",
    };
    const supersededCandidate = {
      standardId: "std-sup",
      standardNumber: "IS 2347:1998",
      title: "Pressure cookers",
      status: "SUPERSEDED",
    };

    const req = { product: "pressure cooker" };
    const scoredCurr = scoreCandidate(currentCandidate, req, "pressure cooker");
    const scoredSup = scoreCandidate(supersededCandidate, req, "pressure cooker");

    assert.ok(
      scoredCurr.score > scoredSup.score,
      "Current standard must score higher than superseded standard due to currentness penalty"
    );
    assert.ok(scoredSup.warnings.some((w) => w.includes("SUPERSEDED")));
  });

  // 9. Alternative Generation
  it("9. should return alternative candidates without declaring them 'wrong'", async () => {
    const res = await recommend("Outdoor lighting luminaire for street and roadway");
    assert.ok(res.primaryRecommendation);
    assert.ok(Array.isArray(res.alternatives));
    if (res.alternatives.length > 0) {
      assert.notEqual(res.alternatives[0].standardNumber, res.primaryRecommendation.standardNumber);
      assert.ok(res.alternatives[0].matchScore <= res.primaryRecommendation.matchScore);
    }
  });

  // 10. Low-Score Handling
  it("10. should not force recommendation on weak matches, setting CLARIFICATION_REQUIRED", async () => {
    // Ambiguous or weakly matching requirement
    const res = await recommend("heavy industrial machinery auxiliary gearbox gear set");
    assert.ok(
      res.status === "CLARIFICATION_REQUIRED" ||
      res.status === "INSUFFICIENT_EVIDENCE" ||
      res.status === "NO_MATCH" ||
      res.confidence < 75
    );
  });

  // 11. Ambiguous Requirement
  it("11. should flag ambiguous broad requirements with CLARIFICATION_REQUIRED and generate questions", async () => {
    const input = "Need a standard for electrical equipment.";
    const norm = normalizeRequirement(input);
    assert.equal(norm.isAmbiguous, true);
    assert.ok(norm.clarifyingQuestions.length >= 2);

    const res = await recommend(input);
    assert.equal(res.status, "CLARIFICATION_REQUIRED");
    assert.ok(res.clarifyingQuestions.length > 0);
  });

  // 12. Missing Attributes
  it("12. should identify missing attributes and not hallucinate missing fields", () => {
    const input = "Procurement of 500 units for office.";
    const norm = normalizeRequirement(input);
    assert.equal(norm.product, null);
    assert.equal(norm.material, null);
    assert.equal(norm.capacity, null);
  });

  // 13. No-Match Case
  it("13. should handle bespoke out-of-scope queries cleanly with NO_MATCH or CLARIFICATION_REQUIRED", async () => {
    const res = await recommend("Handmade Venetian glass perfume bottle with antique gold filigree stopper");
    assert.ok(res.status === "NO_MATCH" || res.status === "CLARIFICATION_REQUIRED");
    if (res.status === "NO_MATCH") {
      assert.equal(res.primaryRecommendation, null);
      assert.equal(res.confidence, 0);
    }
  });

  // 14. Vector Unavailable Fallback
  it("14. should fall back to structured + lexical search when vector embedding is unavailable", async () => {
    // Temporarily unset EMBEDDING_API_KEY
    const origKey = process.env.EMBEDDING_API_KEY;
    delete process.env.EMBEDDING_API_KEY;

    try {
      const embedding = await generateRequirementEmbedding("pressure cooker");
      assert.equal(embedding, null, "Must return null when no embedding provider is configured");

      const res = await recommend("Stainless steel pressure cooker 5 litre");
      assert.ok(res.primaryRecommendation, "Must still produce recommendation using lexical + structured search");
      assert.equal(res.primaryRecommendation.standardNumber, "IS 2347:2023");
    } finally {
      if (origKey) process.env.EMBEDDING_API_KEY = origKey;
    }
  });

  // 15. Evidence Enrichment
  it("15. should enrich primary candidate with real database evidence without inventing clauses", async () => {
    const res = await recommend("Stainless steel pressure cooker for kitchen");
    assert.ok(res.evidence.length > 0, "Must enrich candidate with evidence");
    for (const ev of res.evidence) {
      assert.ok(ev.reference, "Evidence must have reference/clause");
      assert.ok(ev.content, "Evidence must have content");
    }
  });

  // 16. Related Standards Retrieval
  it("16. should integrate allied standards from Phase 12 as supporting relationships", async () => {
    const res = await recommend("Stainless steel pressure cooker 5 litre");
    assert.ok(Array.isArray(res.relatedStandards));
    assert.ok(res.relatedStandards.length > 0, "Should include related standards for IS 2347");
    // Verify relationships are labeled (e.g. NORMATIVE_REFERENCE or TEST_METHOD)
    const hasRelType = res.relatedStandards.some((r) => r.relationType || r.relationshipType);
    assert.ok(hasRelType, "Related standards must carry relationship type metadata");
  });

  // 17. Dataset Provenance
  it("17. should record dataset provenance, engine version, and retrieval method in recommendations", async () => {
    const res = await recommend("Stainless steel pressure cooker 5 litre");
    assert.ok(res.datasetProvenance);
    assert.equal(res.datasetProvenance.engineVersion, "hybrid-v1");
    assert.equal(res.datasetProvenance.retrievalMethod, "HYBRID");

    // Verify stored DB record has provenance
    const dbRec = await prisma.recommendation.findUnique({
      where: { id: res.recommendationId },
    });
    assert.equal(dbRec.engineVersion, "hybrid-v1");
    assert.equal(dbRec.retrievalMethod, "HYBRID");
  });

  // 18. Recommendation API
  it("18. should support debug retrieval mode via options.debug", async () => {
    const res = await recommend("Stainless steel pressure cooker", { debug: true });
    assert.ok(res.debug, "Debug mode must populate debug object");
    assert.ok(Array.isArray(res.debug.retrievedBy));
    assert.ok(typeof res.debug.candidateCount === "number");
    assert.ok(Array.isArray(res.debug.candidateSources));
  });

  // 19. Multilingual Input Preservation
  it("19. should preserve original query, detect language, and normalize searchable terms", () => {
    const hindiInput = "स्टेनलेस स्टील प्रेशर कुकर 5 लीटर";
    const norm = normalizeRequirement(hindiInput);

    assert.equal(norm.rawText, hindiInput, "Must preserve exact original query");
    assert.equal(norm.language, "hi", "Must detect Hindi language");
    assert.ok(norm.normalizedTerms.includes("pressure cooker"));
  });

  // 20. Existing Phase 1–14 Functionality
  it("20. should verify existing Phase 1-14 database integrity and models remain intact", async () => {
    const stdCount = await prisma.standard.count();
    assert.ok(stdCount > 0, "Standards table must remain populated");

    const relCount = await prisma.relatedStandard.count();
    assert.ok(relCount >= 0, "RelatedStandard table must exist");

    const ruleCount = await prisma.complianceRule.count();
    assert.ok(ruleCount > 0, "ComplianceRule table from Phase 13 must remain intact");

    const importJobCount = await prisma.dataImportJob.count();
    assert.ok(importJobCount >= 0, "DataImportJob table from Phase 14 must remain intact");
  });
});
