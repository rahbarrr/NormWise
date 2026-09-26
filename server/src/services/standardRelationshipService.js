/**
 * NormWise Standard Relationship Service (Phase 12)
 * Manages allied and connected standards relationships in PostgreSQL,
 * graph traversal (capped at depth 3), validation, and currentness integration.
 */
import prisma from "../config/db.js";

export const RELATIONSHIP_PRIORITY_ORDER = [
  "NORMATIVE_REFERENCE",
  "TEST_METHOD",
  "SAFETY",
  "COMPONENT",
  "INSTALLATION",
  "MATERIAL",
  "MANDATORY_UNDER",
  "APPLIES_TO",
  "EQUIVALENT",
  "TERMINOLOGY",
  "AMENDED_BY",
  "SUPERSEDED_BY",
  "OTHER",
];

export const VALID_RELATIONSHIP_TYPES = [
  "NORMATIVE_REFERENCE",
  "TERMINOLOGY",
  "TEST_METHOD",
  "SAFETY",
  "INSTALLATION",
  "EQUIVALENT",
  "SUPERSEDED_BY",
  "AMENDED_BY",
  "MANDATORY_UNDER",
  "APPLIES_TO",
  "COMPONENT",
  "MATERIAL",
  "OTHER",
];

/**
 * Validate relationship inputs to prevent self-reference, invalid types, and duplicates
 */
export async function validateRelationship({ standardId, relatedStandardId, relationshipType, excludeId = null }) {
  if (!standardId || !relatedStandardId) {
    const error = new Error("Both standardId and relatedStandardId are required.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Prevent self-reference
  if (standardId === relatedStandardId) {
    const error = new Error("Self-referencing relationship is forbidden. A standard cannot relate to itself.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate relationship type
  if (!VALID_RELATIONSHIP_TYPES.includes(relationshipType)) {
    const error = new Error(`Invalid relationship type: "${relationshipType}". Allowed types: ${VALID_RELATIONSHIP_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Verify standards exist
  const [sourceStd, targetStd] = await Promise.all([
    prisma.standard.findUnique({ where: { id: standardId } }),
    prisma.standard.findUnique({ where: { id: relatedStandardId } }),
  ]);

  if (!sourceStd) {
    const error = new Error(`Source standard not found for ID: ${standardId}`);
    error.statusCode = 404;
    throw error;
  }

  if (!targetStd) {
    const error = new Error(`Target related standard not found for ID: ${relatedStandardId}`);
    error.statusCode = 404;
    throw error;
  }

  // 4. Prevent duplicate relationship
  const existing = await prisma.relatedStandard.findFirst({
    where: {
      standardId,
      relatedStandardId,
      relationshipType,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  if (existing) {
    const error = new Error(`Relationship "${relationshipType}" between standard ${sourceStd.standardNumber} and ${targetStd.standardNumber} already exists.`);
    error.statusCode = 409;
    throw error;
  }

  return { sourceStd, targetStd };
}

/**
 * Get connected standards for a given standardId
 * Supports direction ("OUTGOING" | "INCOMING" | "ALL") and type filtering
 */
export async function getRelatedStandards(standardId, options = {}) {
  const { direction = "ALL", type = null } = options;

  // Resolve standardId if standardNumber is passed
  let stdId = standardId;
  const standard = await prisma.standard.findFirst({
    where: {
      OR: [{ id: standardId }, { standardNumber: standardId }],
    },
  });

  if (!standard) {
    const error = new Error(`Standard not found for: ${standardId}`);
    error.statusCode = 404;
    throw error;
  }
  stdId = standard.id;

  const results = [];

  // 1. Outgoing relationships (Standard -> Connected)
  if (direction === "OUTGOING" || direction === "ALL") {
    const outgoing = await prisma.relatedStandard.findMany({
      where: {
        standardId: stdId,
        ...(type ? { relationshipType: type } : {}),
      },
      include: {
        relatedStandard: {
          include: {
            amendments: true,
          },
        },
        evidence: true,
      },
    });

    for (const rel of outgoing) {
      results.push({
        relationshipId: rel.id,
        direction: "OUTGOING",
        relationshipType: rel.relationshipType,
        notes: rel.notes || "Demo relationship — verify against authoritative BIS source.",
        status: rel.status,
        evidence: rel.evidence
          ? {
              id: rel.evidence.id,
              reference: rel.evidence.reference,
              content: rel.evidence.content,
              source: rel.evidence.source,
              status: rel.evidence.status,
            }
          : null,
        evidenceAvailable: Boolean(rel.evidenceId),
        standard: {
          id: rel.relatedStandard.id,
          standardNumber: rel.relatedStandard.standardNumber,
          title: rel.relatedStandard.title,
          status: rel.relatedStandard.status,
          isMandatory: rel.relatedStandard.isMandatory,
          amendmentCount: rel.relatedStandard.amendments?.length || 0,
        },
      });
    }
  }

  // 2. Incoming relationships (Other Standards -> Standard)
  if (direction === "INCOMING" || direction === "ALL") {
    const incoming = await prisma.relatedStandard.findMany({
      where: {
        relatedStandardId: stdId,
        ...(type ? { relationshipType: type } : {}),
      },
      include: {
        standard: {
          include: {
            amendments: true,
          },
        },
        evidence: true,
      },
    });

    for (const rel of incoming) {
      results.push({
        relationshipId: rel.id,
        direction: "INCOMING",
        relationshipType: rel.relationshipType,
        notes: rel.notes || "Demo relationship — verify against authoritative BIS source.",
        status: rel.status,
        evidence: rel.evidence
          ? {
              id: rel.evidence.id,
              reference: rel.evidence.reference,
              content: rel.evidence.content,
              source: rel.evidence.source,
              status: rel.evidence.status,
            }
          : null,
        evidenceAvailable: Boolean(rel.evidenceId),
        standard: {
          id: rel.standard.id,
          standardNumber: rel.standard.standardNumber,
          title: rel.standard.title,
          status: rel.standard.status,
          isMandatory: rel.standard.isMandatory,
          amendmentCount: rel.standard.amendments?.length || 0,
        },
      });
    }
  }

  // Deterministic sorting based on RELATIONSHIP_PRIORITY_ORDER
  results.sort((a, b) => {
    const idxA = RELATIONSHIP_PRIORITY_ORDER.indexOf(a.relationshipType);
    const idxB = RELATIONSHIP_PRIORITY_ORDER.indexOf(b.relationshipType);
    const rankA = idxA === -1 ? 99 : idxA;
    const rankB = idxB === -1 ? 99 : idxB;
    if (rankA !== rankB) return rankA - rankB;
    return a.standard.standardNumber.localeCompare(b.standard.standardNumber);
  });

  return {
    standard: {
      id: standard.id,
      standardNumber: standard.standardNumber,
      title: standard.title,
      status: standard.status,
    },
    total: results.length,
    relatedStandards: results,
    isDemoDataset: results.some((r) => r.status === "DEMO" || r.notes?.includes("Demo")),
  };
}

/**
 * Filter related standards strictly by relationship type
 */
export async function getRelatedStandardsByType(standardId, type) {
  return getRelatedStandards(standardId, { type });
}

/**
 * Create a new relationship
 */
export async function createRelationship(data) {
  const { standardId, relatedStandardId, relationshipType, evidenceId, notes, status = "DEMO" } = data;

  await validateRelationship({ standardId, relatedStandardId, relationshipType });

  const record = await prisma.relatedStandard.create({
    data: {
      standardId,
      relatedStandardId,
      relationshipType,
      evidenceId: evidenceId || null,
      notes: notes || "Demo relationship — verify against authoritative BIS source.",
      status,
    },
    include: {
      standard: true,
      relatedStandard: true,
      evidence: true,
    },
  });

  return record;
}

/**
 * Update an existing relationship
 */
export async function updateRelationship(relationshipId, data) {
  const existing = await prisma.relatedStandard.findUnique({
    where: { id: relationshipId },
  });

  if (!existing) {
    const error = new Error(`Relationship not found for ID: ${relationshipId}`);
    error.statusCode = 404;
    throw error;
  }

  const standardId = data.standardId || existing.standardId;
  const relatedStandardId = data.relatedStandardId || existing.relatedStandardId;
  const relationshipType = data.relationshipType || existing.relationshipType;

  await validateRelationship({
    standardId,
    relatedStandardId,
    relationshipType,
    excludeId: relationshipId,
  });

  const updated = await prisma.relatedStandard.update({
    where: { id: relationshipId },
    data: {
      standardId,
      relatedStandardId,
      relationshipType,
      evidenceId: data.evidenceId !== undefined ? data.evidenceId : existing.evidenceId,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      status: data.status !== undefined ? data.status : existing.status,
    },
    include: {
      standard: true,
      relatedStandard: true,
      evidence: true,
    },
  });

  return updated;
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(relationshipId) {
  const existing = await prisma.relatedStandard.findUnique({
    where: { id: relationshipId },
  });

  if (!existing) {
    const error = new Error(`Relationship not found for ID: ${relationshipId}`);
    error.statusCode = 404;
    throw error;
  }

  await prisma.relatedStandard.delete({
    where: { id: relationshipId },
  });

  return { success: true, message: `Relationship ${relationshipId} deleted.` };
}

/**
 * Knowledge Graph Traversal (Max depth capped at 3)
 * Returns { nodes: [], edges: [] }
 */
export async function getRelationshipGraph(standardId, options = {}) {
  // Cap traversal depth strictly between 1 and 3
  const requestedDepth = parseInt(options.depth, 10);
  const depth = Math.min(3, Math.max(1, isNaN(requestedDepth) ? 1 : requestedDepth));
  const typeFilter = options.type || null;

  // Resolve root standard
  const rootStandard = await prisma.standard.findFirst({
    where: {
      OR: [{ id: standardId }, { standardNumber: standardId }],
    },
    include: {
      amendments: true,
    },
  });

  if (!rootStandard) {
    const error = new Error(`Standard not found for ID or Number: ${standardId}`);
    error.statusCode = 404;
    throw error;
  }

  const visitedNodeIds = new Set([rootStandard.id]);
  const nodesMap = new Map();
  const edgesMap = new Map();

  // Add root node
  nodesMap.set(rootStandard.id, {
    id: rootStandard.id,
    standardNumber: rootStandard.standardNumber,
    title: rootStandard.title,
    status: rootStandard.status,
    isMandatory: rootStandard.isMandatory,
    amendmentCount: rootStandard.amendments?.length || 0,
    isRoot: true,
    level: 0,
  });

  let currentLevelIds = [rootStandard.id];

  for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
    if (currentLevelIds.length === 0) break;

    // Fetch outgoing & incoming relationships for current level standards
    const relationships = await prisma.relatedStandard.findMany({
      where: {
        OR: [
          { standardId: { in: currentLevelIds } },
          { relatedStandardId: { in: currentLevelIds } },
        ],
        ...(typeFilter ? { relationshipType: typeFilter } : {}),
      },
      include: {
        standard: { include: { amendments: true } },
        relatedStandard: { include: { amendments: true } },
        evidence: true,
      },
    });

    const nextLevelIds = [];

    for (const rel of relationships) {
      // Register Source Node
      if (!nodesMap.has(rel.standard.id)) {
        nodesMap.set(rel.standard.id, {
          id: rel.standard.id,
          standardNumber: rel.standard.standardNumber,
          title: rel.standard.title,
          status: rel.standard.status,
          isMandatory: rel.standard.isMandatory,
          amendmentCount: rel.standard.amendments?.length || 0,
          isRoot: false,
          level: currentDepth,
        });
      }

      // Register Target Node
      if (!nodesMap.has(rel.relatedStandard.id)) {
        nodesMap.set(rel.relatedStandard.id, {
          id: rel.relatedStandard.id,
          standardNumber: rel.relatedStandard.standardNumber,
          title: rel.relatedStandard.title,
          status: rel.relatedStandard.status,
          isMandatory: rel.relatedStandard.isMandatory,
          amendmentCount: rel.relatedStandard.amendments?.length || 0,
          isRoot: false,
          level: currentDepth,
        });
      }

      // Queue next level nodes if not yet visited
      if (!visitedNodeIds.has(rel.standard.id)) {
        visitedNodeIds.add(rel.standard.id);
        nextLevelIds.push(rel.standard.id);
      }
      if (!visitedNodeIds.has(rel.relatedStandard.id)) {
        visitedNodeIds.add(rel.relatedStandard.id);
        nextLevelIds.push(rel.relatedStandard.id);
      }

      // Register Edge
      const edgeKey = `${rel.id}`;
      if (!edgesMap.has(edgeKey)) {
        edgesMap.set(edgeKey, {
          id: rel.id,
          source: rel.standard.id,
          sourceStandardNumber: rel.standard.standardNumber,
          target: rel.relatedStandard.id,
          targetStandardNumber: rel.relatedStandard.standardNumber,
          relationshipType: rel.relationshipType,
          evidenceId: rel.evidenceId,
          evidenceAvailable: Boolean(rel.evidenceId),
          notes: rel.notes || "Demo relationship — verify against authoritative BIS source.",
          status: rel.status,
        });
      }
    }

    currentLevelIds = nextLevelIds;
  }

  return {
    rootStandardId: rootStandard.id,
    rootStandardNumber: rootStandard.standardNumber,
    depth,
    maxDepthAllowed: 3,
    filterApplied: typeFilter,
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesMap.values()),
    isDemoDataset: Array.from(edgesMap.values()).some((e) => e.status === "DEMO" || e.notes?.includes("Demo")),
  };
}
