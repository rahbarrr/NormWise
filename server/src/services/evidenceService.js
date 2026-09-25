/**
 * NormWise Evidence Collection Service
 * Retrieves verified demonstration evidence records associated with standards and recommendations
 * 
 * CRITICAL RULE: If exact source evidence is unavailable in the database,
 * return a clear notice: "Supporting evidence unavailable in current dataset."
 * Never fabricate BIS clauses or statutory orders.
 */
import prisma from "../config/db.js";

export async function collectEvidenceForStandard(standardId) {
  if (!standardId) return [];

  // Query evidence records linked to this standard
  const evidenceRecords = await prisma.evidence.findMany({
    where: { standardId },
    orderBy: { createdAt: "asc" },
  });

  if (evidenceRecords.length > 0) {
    return evidenceRecords.map((e) => ({
      id: e.id,
      type: e.type,
      reference: e.reference,
      content: e.content,
      source: e.source,
      status: e.status,
    }));
  }

  // Check if standard has basic scope information stored in repository
  const standard = await prisma.standard.findUnique({
    where: { id: standardId },
  });

  if (standard?.scope) {
    return [
      {
        id: `ev-scope-${standard.id}`,
        type: "SCOPE",
        reference: `${standard.standardNumber} — Catalog Scope (Demo)`,
        content: standard.scope,
        source: "NormWise Demonstration Repository",
        status: "Available",
      },
    ];
  }

  return [
    {
      id: `ev-unavail-${standardId}`,
      type: "REQUIREMENT",
      reference: "Evidence Status",
      content: "Supporting evidence unavailable in current dataset.",
      source: "NormWise System",
      status: "Pending Ingestion",
    },
  ];
}
