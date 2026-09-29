/**
 * NormWise Grounded Explanation Service
 * Generates explainable, evidence-backed procurement justifications.
 * 
 * CORE PRINCIPLE: The explanation must be strictly grounded in retrieved evidence,
 * candidate metadata, currentness verification, and certification rules.
 * Does NOT invent standards, clauses, or regulatory requirements.
 */

export function generateGroundedExplanation({
  requirement,
  candidate,
  currentness,
  certification,
  relatedStandards = [],
  evidence = [],
}) {
  const parts = [];

  // 1. Primary Recommendation Justification
  parts.push(
    `Indian Standard ${candidate.standardNumber} (${candidate.title}) was matched as the primary specification for this requirement.`
  );

  // 2. Specific matching attributes
  if (candidate.reasons && candidate.reasons.length > 0) {
    parts.push(`Key matching factors: ${candidate.reasons.join(" ")}`);
  }

  // 3. Currentness state
  if (currentness) {
    if (currentness.status === "CURRENT") {
      parts.push(
        `Currentness status: The standard is currently active (${candidate.edition || "Current Edition"}${
          currentness.activeAmendmentsCount > 0 ? ` with ${currentness.activeAmendmentsCount} active amendment(s)` : ""
        }).`
      );
    } else if (currentness.status === "SUPERSEDED") {
      parts.push(`Notice: This standard is superseded. ${currentness.notice}`);
    } else if (currentness.status === "WITHDRAWN") {
      parts.push(`Warning: Standard is withdrawn from catalog.`);
    }
  }

  // 4. Certification & QCO applicability
  if (certification && certification.mandateStatus) {
    parts.push(
      `Statutory compliance: ${certification.mandateStatus} (${certification.legalOrder || certification.scheme}). ${certification.requirementSummary}`
    );
  }

  // 5. Related Standards
  if (relatedStandards.length > 0) {
    const relatedSummary = relatedStandards
      .slice(0, 3)
      .map((r) => `${r.standardNumber} (${r.relationshipType})`)
      .join(", ");
    parts.push(`Normative references & allied standards identified: ${relatedSummary}.`);
  }

  return parts.join(" ");
}
