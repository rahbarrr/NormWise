/**
 * NormWise Related Standards Service
 * Delegates to standardRelationshipService (Phase 12) for unified relationship handling.
 */
import { getRelatedStandards as getRelStandards } from "./standardRelationshipService.js";

export async function getRelatedStandards(standardId) {
  const result = await getRelStandards(standardId, { direction: "ALL" });
  return (result.relatedStandards || []).map((rel) => ({
    relationshipId: rel.relationshipId,
    relationshipType: rel.relationshipType,
    direction: rel.direction,
    standardId: rel.standard.id,
    standardNumber: rel.standard.standardNumber,
    title: rel.standard.title,
    status: rel.standard.status,
    notes: rel.notes,
    evidenceAvailable: rel.evidenceAvailable,
    evidence: rel.evidence,
  }));
}
