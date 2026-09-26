/**
 * NormWise Recommendation Engine Pipeline
 * Orchestrates requirement extraction, hybrid candidate retrieval,
 * multi-criteria scoring, currentness validation, evidence collection,
 * and audit event logging.
 */
import prisma from "../config/db.js";
import { normalizeRequirement } from "./requirementNormalizationService.js";
import { normalizeRequirementMultilingual } from "./multilingualNormalizationService.js";
import { extractRequirements } from "./requirementService.js";
import { retrieveCandidates } from "./retrievalService.js";
import { rankCandidates } from "./standardRankingService.js";
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
  if (cleanText.length > RECOMMENDATION_THRESHOLDS.MAX_REQUIREMENT_LENGTH) {
    const error = new Error(
      `Requirement text exceeds maximum allowed length of ${RECOMMENDATION_THRESHOLDS.MAX_REQUIREMENT_LENGTH} characters.`
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Multilingual Normalization & Structured Attribute Extraction (Phase 16)
  const multilingual = await normalizeRequirementMultilingual(cleanText, options.language);
  const cleanSearchText = multilingual.searchText || cleanText;
  const extracted = {
    ...multilingual.extractedAttributes,
    technicalCharacteristics: multilingual.extractedAttributes?.technicalCharacteristics || [],
  };

  // 3-5. Retrieve & merge candidates using search text (Structured + PostgreSQL FTS + pgvector)
  const retrievedCandidates = await retrieveCandidates(cleanSearchText, extracted);
  console.log(`[RecommendationEngine] Candidate retrieval completed. Found ${retrievedCandidates.length} candidate standard(s).`);

  // 6. Score and rank candidates using multi-factor ranking
  const scoredCandidates = rankCandidates(retrievedCandidates, extracted, cleanSearchText);
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
        standardsDatasetVersion: "2026.09",
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

  if (extracted.isAmbiguous || hasCloseAlternative || isMissingKeyAttributes) {
    recommendationState = "CLARIFICATION_REQUIRED";
    statusReason = extracted.ambiguityReason
      ? `Important requirement attributes: ${extracted.ambiguityReason} More information is needed.`
      : hasCloseAlternative
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

  // Trace dataset version & provenance
  const latestImport = await prisma.dataImportJob.findFirst({
    where: { status: { in: ["COMPLETED", "COMPLETED_WITH_ERRORS"] } },
    orderBy: { createdAt: "desc" },
  });
  const datasetVersion = topCandidate.datasetVersion || "2026.09";
  let importJobId = null;
  const candidateJobId = topCandidate.importJobId || latestImport?.id;
  if (candidateJobId) {
    const jobExists = await prisma.dataImportJob.findUnique({
      where: { id: candidateJobId },
      select: { id: true },
    });
    if (jobExists) {
      importJobId = candidateJobId;
    }
  }

  let savedRec;
  try {
    savedRec = await prisma.recommendation.create({
      data: {
        userId: defaultUser.id,
        requirementText: cleanText,
        originalText: cleanText,
        detectedLanguage: multilingual.detectedLanguage,
        originalLanguage: multilingual.originalLanguage,
        normalizedText: multilingual.normalizedText,
        translationText: multilingual.searchText !== cleanText ? multilingual.searchText : null,
        normalizationMethod: multilingual.normalizationMethod,
        translationMethod: multilingual.translationMethod,
        product: extracted.product || topCandidate.title,
        material: extracted.material,
        capacity: extracted.capacity,
        application: extracted.application,
        technicalCharacteristics: extracted.technicalCharacteristics ? extracted.technicalCharacteristics.join(", ") : "",
        confidence: confidenceScore,
        status: dbStatus,
        decisionNotes: statusReason,
        standardsDatasetVersion: datasetVersion,
        importJobId: importJobId,
        engineVersion: "hybrid-v1",
        retrievalMethod: "HYBRID",
        embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      },
    });
  } catch (err) {
    if (err.code === "P2003" && importJobId) {
      savedRec = await prisma.recommendation.create({
        data: {
          userId: defaultUser.id,
          requirementText: cleanText,
          originalText: cleanText,
          detectedLanguage: multilingual.detectedLanguage,
          originalLanguage: multilingual.originalLanguage,
          normalizedText: multilingual.normalizedText,
          translationText: multilingual.searchText !== cleanText ? multilingual.searchText : null,
          normalizationMethod: multilingual.normalizationMethod,
          translationMethod: multilingual.translationMethod,
          product: extracted.product || topCandidate.title,
          material: extracted.material,
          capacity: extracted.capacity,
          application: extracted.application,
          technicalCharacteristics: extracted.technicalCharacteristics ? extracted.technicalCharacteristics.join(", ") : "",
          confidence: confidenceScore,
          status: dbStatus,
          decisionNotes: statusReason,
          standardsDatasetVersion: datasetVersion,
          importJobId: null,
          engineVersion: "hybrid-v1",
          retrievalMethod: "HYBRID",
          embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
        },
      });
    } else {
      throw err;
    }
  }

  // 14. Save Candidate Standards into RecommendationStandard
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: savedRec.id,
      standardId: topCandidate.standardId,
      matchConfidence: confidenceScore,
      matchScore: topCandidate.score,
      productScore: topCandidate.scoreBreakdown?.productScore,
      applicationScore: topCandidate.scoreBreakdown?.applicationScore,
      materialScore: topCandidate.scoreBreakdown?.materialScore,
      technicalScore: topCandidate.scoreBreakdown?.technicalScore,
      semanticScore: topCandidate.scoreBreakdown?.semanticScore,
      retrievedBy: topCandidate.retrievedBy || ["lexical"],
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
        matchScore: alt.score,
        productScore: alt.scoreBreakdown?.productScore,
        applicationScore: alt.scoreBreakdown?.applicationScore,
        materialScore: alt.scoreBreakdown?.materialScore,
        technicalScore: alt.scoreBreakdown?.technicalScore,
        semanticScore: alt.scoreBreakdown?.semanticScore,
        retrievedBy: alt.retrievedBy || ["lexical"],
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
    state: recommendationState,
    confidence: confidenceScore,
    matchScore: topCandidate.score,
    scoreBreakdown: topCandidate.scoreBreakdown,
    statusReason,
    requirement: extracted,
    extractedAttributes: extracted,
    clarifyingQuestions: extracted.clarifyingQuestions || [],
    primaryRecommendation: {
      standardId: topCandidate.standardId,
      standardNumber: topCandidate.standardNumber,
      title: topCandidate.title,
      edition: topCandidate.edition,
      revision: topCandidate.revision,
      status: topCandidate.status,
      matchScore: topCandidate.score,
      scoreBreakdown: topCandidate.scoreBreakdown,
      retrievedBy: topCandidate.retrievedBy || ["lexical"],
      explanation: topCandidate.explanation,
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
      scoreBreakdown: alt.scoreBreakdown,
      retrievedBy: alt.retrievedBy || ["lexical"],
      reasons: alt.reasons,
      warnings: alt.warnings,
    })),
    relatedStandards,
    alliedStandards: relatedStandards,
    certification,
    compliance,
    evidence,
    explanation,
    originalText: cleanText,
    detectedLanguage: multilingual.detectedLanguage,
    originalLanguage: multilingual.originalLanguage,
    languageName: multilingual.languageName,
    normalizedText: multilingual.normalizedText,
    searchText: multilingual.searchText,
    protectedTerms: multilingual.protectedTerms,
    datasetProvenance: {
      standardsDatasetVersion: datasetVersion,
      importJobId: importJobId,
      engineVersion: "hybrid-v1",
      retrievalMethod: "HYBRID",
      originalLanguage: multilingual.originalLanguage,
      normalizationMethod: multilingual.normalizationMethod,
      translationMethod: multilingual.translationMethod,
    },
    provenance: {
      standardsDatasetVersion: datasetVersion,
      importJobId: importJobId,
      engineVersion: "hybrid-v1",
      retrievalMethod: "HYBRID",
      originalLanguage: multilingual.originalLanguage,
      normalizationMethod: multilingual.normalizationMethod,
      translationMethod: multilingual.translationMethod,
    },
    ...(options.debug ? {
      debug: {
        normalizedRequirement: multilingual.normalizedText || cleanSearchText,
        extractedAttributes: extracted,
        lexicalCandidates: retrievedCandidates
          .filter((c) => (c.retrievedBy || []).includes("lexical") || (c.retrievedBy || []).includes("fts"))
          .map((c) => ({ standardNumber: c.standardNumber, title: c.title })),
        vectorCandidates: retrievedCandidates
          .filter((c) => (c.retrievedBy || []).includes("vector") || (c.retrievedBy || []).includes("pgvector"))
          .map((c) => ({ standardNumber: c.standardNumber, title: c.title })),
        structuredCandidates: retrievedCandidates
          .filter((c) => (c.retrievedBy || []).includes("structured"))
          .map((c) => ({ standardNumber: c.standardNumber, title: c.title })),
        mergedCandidates: retrievedCandidates.map((c) => ({
          standardNumber: c.standardNumber,
          title: c.title,
          retrievedBy: c.retrievedBy,
        })),
        scoreComponents: topCandidate.scoreBreakdown || { totalScore: topCandidate.score },
        currentnessFiltering: {
          currentnessStatus: currentness.status,
          canProceedAsPrimary: currentness.canProceedAsPrimary,
          notice: currentness.notice,
        },
        relatedStandards: relatedStandards,
        complianceEvaluation: compliance,
        finalRanking: scoredCandidates.slice(0, 10).map((c, idx) => ({
          rank: idx + 1,
          standardNumber: c.standardNumber,
          score: c.score,
          status: c.status,
        })),
        explanationInputs: {
          requirement: extracted,
          candidate: {
            standardNumber: topCandidate.standardNumber,
            title: topCandidate.title,
            status: topCandidate.status,
          },
          currentness,
          certification,
          relatedStandardsCount: (relatedStandards || []).length,
          evidenceCount: (evidence || []).length,
        },
        retrievedBy: topCandidate.retrievedBy,
        candidateCount: retrievedCandidates.length,
        candidateSources: retrievedCandidates.map((c) => ({
          standardNumber: c.standardNumber,
          retrievedBy: c.retrievedBy,
        })),
      },
    } : {}),
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

export const recommendationService = { recommend };
export default recommendationService;
