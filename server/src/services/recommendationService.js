/**
 * NormWise Recommendation Engine Pipeline
 * Orchestrates requirement extraction, hybrid candidate retrieval,
 * multi-criteria scoring, currentness validation, evidence collection,
 * and audit event logging.
 */
import prisma from "../config/db.js";
import { extractRequirements } from "./requirementService.js";
import { retrieveCandidates } from "./retrievalService.js";
import { scoreCandidates } from "./scoringService.js";
import { validateCurrentness } from "./currentnessService.js";
import { getRelatedStandards } from "./relatedStandardsService.js";
import { getCertificationDetails } from "./certificationService.js";
import { collectEvidenceForStandard } from "./evidenceService.js";
import { generateGroundedExplanation } from "./explanationService.js";
import { complianceRuleService } from "./complianceRuleService.js";
import {
  RECOMMENDATION_THRESHOLDS,
  RETRIEVAL_LIMITS,
} from "../config/recommendationConfig.js";

export async function recommend(requirementText, options = {}) {
  const startTime = Date.now();
  console.log(`[RecommendationEngine] Starting evaluation for requirement: "${requirementText.slice(0, 70)}..."`);

  // 1. Normalize requirement text
  const cleanText = (requirementText || "").trim();
  if (cleanText.length < RECOMMENDATION_THRESHOLDS.MIN_REQUIREMENT_LENGTH) {
    const error = new Error("Please provide a procurement requirement.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Extract structured attributes
  const extracted = await extractRequirements(cleanText);

  // 3-5. Retrieve & merge candidates (PostgreSQL FTS + pgvector semantic)
  const retrievedCandidates = await retrieveCandidates(cleanText, extracted);
  console.log(`[RecommendationEngine] Candidate retrieval completed. Found ${retrievedCandidates.length} candidate standard(s).`);

  // 6. Score and rank candidates
  const scoredCandidates = scoreCandidates(retrievedCandidates, extracted, cleanText);
  console.log(`[RecommendationEngine] Candidate scoring completed. Top candidate: ${scoredCandidates[0]?.standardNumber || "none"} (Score: ${scoredCandidates[0]?.score || 0})`);

  // Edge Case: No candidates found or extremely low score (< 0.25)
  if (scoredCandidates.length === 0 || scoredCandidates[0].score < 0.25) {
    const defaultUser = await getOrCreateDefaultUser(options.userId);

    const emptyRec = await prisma.recommendation.create({
      data: {
        userId: defaultUser.id,
        requirementText: cleanText,
        product: extracted.product || "Unclassified Requirement",
        material: extracted.material,
        capacity: extracted.capacity,
        application: extracted.application,
        technicalCharacteristics: extracted.technicalCharacteristics.join(", "),
        confidence: 0,
        status: "NOT_APPLICABLE",
      },
    });

    await prisma.auditEvent.create({
      data: {
        recommendationId: emptyRec.id,
        actorId: defaultUser.id,
        action: "RECOMMENDATION_CREATED",
        details: "Recommendation evaluation completed with status: NO_MATCH. No relevant Indian Standard found in demonstration catalog.",
      },
    });

    return {
      recommendationId: emptyRec.id,
      status: "NO_MATCH",
      confidence: 0,
      requirement: extracted,
      primaryRecommendation: null,
      alternatives: [],
      relatedStandards: [],
      certification: null,
      evidence: [],
      explanation: "No applicable Indian Standard was identified in the current catalog for this requirement.",
    };
  }

  const topCandidate = scoredCandidates[0];
  const secondCandidate = scoredCandidates[1] || null;

  // 7. Validate currentness of top candidate
  const currentness = await validateCurrentness(topCandidate.standardId);

  // 8. Retrieve related standards
  const relatedStandards = await getRelatedStandards(topCandidate.standardId);

  // 9. Retrieve certification rules
  const certification = getCertificationDetails(topCandidate.standardNumber);

  // 10. Collect evidence
  const evidence = await collectEvidenceForStandard(topCandidate.standardId);

  // 11. Determine Recommendation State
  let recommendationState = "RECOMMENDED";
  let statusReason = "Sufficient match and supporting evidence identified.";

  const hasCloseAlternative =
    secondCandidate &&
    secondCandidate.score >= RECOMMENDATION_THRESHOLDS.MIN_ACCEPTABLE_SCORE &&
    topCandidate.score - secondCandidate.score < RECOMMENDATION_THRESHOLDS.AMBIGUITY_SCORE_GAP;

  const isMissingKeyAttributes = !extracted.product;

  if (hasCloseAlternative || isMissingKeyAttributes) {
    recommendationState = "CLARIFICATION_REQUIRED";
    statusReason = hasCloseAlternative
      ? `Multiple candidate standards (${topCandidate.standardNumber} and ${secondCandidate.standardNumber}) exhibit close matching scores. Clarification of operating duty or rating will refine the determination.`
      : "Important requirement attributes (such as primary product type) were not clearly specified in the input text.";
  } else if (!currentness.canProceedAsPrimary) {
    recommendationState = "INSUFFICIENT_EVIDENCE";
    statusReason = currentness.notice;
  } else if (evidence.some((e) => e.status === "Pending Ingestion")) {
    recommendationState = "INSUFFICIENT_EVIDENCE";
    statusReason = "Primary candidate matched, but verification evidence is currently unavailable in demonstration repository.";
  } else if (topCandidate.score < RECOMMENDATION_THRESHOLDS.MIN_ACCEPTABLE_SCORE) {
    recommendationState = "CLARIFICATION_REQUIRED";
    statusReason = "Candidate match score is below acceptance threshold. Additional procurement attributes recommended.";
  }

  // 12. Grounded Explanation
  const explanation = generateGroundedExplanation({
    requirement: extracted,
    candidate: topCandidate,
    currentness,
    certification,
    relatedStandards,
    evidence,
  });

  // 12b. Compliance & QCO Rules Engine Evaluation (Phase 13)
  const compliance = await complianceRuleService.evaluateCompliance({
    attributes: {
      product: extracted.product || cleanText,
      material: extracted.material,
      capacity: extracted.capacity,
      application: extracted.application,
    },
    standardId: topCandidate.standardId,
    standardNumber: topCandidate.standardNumber,
    standardStatus: topCandidate.status,
  });

  // 13. Persist recommendation to PostgreSQL
  const defaultUser = await getOrCreateDefaultUser(options.userId);

  const confidenceScore = Math.round(topCandidate.score * 100);

  // Map recommendation engine state to DB enum
  const dbStatus =
    recommendationState === "RECOMMENDED"
      ? "PENDING_REVIEW"
      : recommendationState === "CLARIFICATION_REQUIRED"
      ? "CLARIFICATION_REQUESTED"
      : "UNDER_TECHNICAL_REVIEW";

  const savedRec = await prisma.recommendation.create({
    data: {
      userId: defaultUser.id,
      requirementText: cleanText,
      product: extracted.product || topCandidate.title,
      material: extracted.material,
      capacity: extracted.capacity,
      application: extracted.application,
      technicalCharacteristics: extracted.technicalCharacteristics.join(", "),
      confidence: confidenceScore,
      status: dbStatus,
      decisionNotes: statusReason,
    },
  });

  // 14. Save Candidate Standards into RecommendationStandard
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: savedRec.id,
      standardId: topCandidate.standardId,
      matchConfidence: confidenceScore,
      reason: topCandidate.reasons.join(" ") || "Primary specification match.",
      isPrimary: true,
    },
  });

  // Save top alternatives (up to 3)
  const alternatives = scoredCandidates
    .slice(1, 1 + RETRIEVAL_LIMITS.MAX_ALTERNATIVES_RETURNED)
    .filter((alt) => alt.score >= 0.40);

  for (const alt of alternatives) {
    await prisma.recommendationStandard.create({
      data: {
        recommendationId: savedRec.id,
        standardId: alt.standardId,
        matchConfidence: Math.round(alt.score * 100),
        reason: alt.reasons.join(" ") || "Alternative candidate standard.",
        isPrimary: false,
      },
    });
  }

  // Save Evidence links into DB
  for (const ev of evidence) {
    if (ev.type && ev.reference && ev.content) {
      await prisma.evidence.create({
        data: {
          recommendationId: savedRec.id,
          standardId: topCandidate.standardId,
          type: ev.type,
          reference: ev.reference,
          content: ev.content,
          source: ev.source || "Demonstration Catalog",
          status: ev.status || "Verified",
        },
      });
    }
  }

  // 15. Create Audit Event
  await prisma.auditEvent.create({
    data: {
      recommendationId: savedRec.id,
      actorId: defaultUser.id,
      action: "RECOMMENDATION_CREATED",
      details: `Recommendation generated using current NormWise demonstration dataset. Primary match: ${topCandidate.standardNumber} (${confidenceScore}% match, state: ${recommendationState}).`,
    },
  });

  // 16. Persist Compliance Evaluation & Audit Event (Phase 13)
  if (compliance) {
    await complianceRuleService.persistEvaluation(
      savedRec.id,
      compliance.primaryRuleId || null,
      compliance,
      compliance.evidenceId || null
    );
  }

  console.log(`[RecommendationEngine] Completed recommendation ${savedRec.id} in ${Date.now() - startTime}ms. State: ${recommendationState}`);

  // Return structured result to frontend/API
  return {
    recommendationId: savedRec.id,
    status: recommendationState,
    confidence: confidenceScore,
    statusReason,
    requirement: extracted,
    primaryRecommendation: {
      standardId: topCandidate.standardId,
      standardNumber: topCandidate.standardNumber,
      title: topCandidate.title,
      edition: topCandidate.edition,
      revision: topCandidate.revision,
      status: topCandidate.status,
      matchScore: topCandidate.score,
      reasons: topCandidate.reasons,
      warnings: topCandidate.warnings,
      currentness,
    },
    alternatives: alternatives.map((alt) => ({
      standardId: alt.standardId,
      standardNumber: alt.standardNumber,
      title: alt.title,
      status: alt.status,
      matchScore: alt.score,
      reasons: alt.reasons,
      warnings: alt.warnings,
    })),
    relatedStandards,
    alliedStandards: relatedStandards,
    certification,
    compliance,
    evidence,
    explanation,
  };
}

async function getOrCreateDefaultUser(userId) {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  return await prisma.user.upsert({
    where: { email: "officer@normwise.gov.in" },
    update: {},
    create: {
      name: "R. K. Sharma",
      email: "officer@normwise.gov.in",
      role: "PROCUREMENT_OFFICER",
    },
  });
}
