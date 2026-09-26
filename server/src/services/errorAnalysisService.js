/**
 * NormWise Error Analysis Service (Phase 17)
 *
 * Classifies evaluation and recommendation failures into actionable engineering categories.
 * Section 13 & 14 adherence:
 * - WRONG_PRODUCT
 * - WRONG_APPLICATION
 * - WRONG_MATERIAL
 * - MISSING_TECHNICAL_MATCH
 * - TRANSLATION_ERROR
 * - TERMINOLOGY_ERROR
 * - LEXICAL_MISS
 * - SEMANTIC_MISS
 * - CURRENTNESS_ERROR
 * - INSUFFICIENT_EVIDENCE
 * - AMBIGUOUS_REQUIREMENT
 * - DATASET_GAP
 * - OTHER
 */

export const ERROR_CATEGORIES = {
  // Phase 21 Standardized Error Taxonomy
  ATTRIBUTE_EXTRACTION_ERROR: "ATTRIBUTE_EXTRACTION_ERROR",
  LEXICAL_RETRIEVAL_ERROR: "LEXICAL_RETRIEVAL_ERROR",
  SEMANTIC_RETRIEVAL_ERROR: "SEMANTIC_RETRIEVAL_ERROR",
  CURRENTNESS_ERROR: "CURRENTNESS_ERROR",
  RELATIONSHIP_ERROR: "RELATIONSHIP_ERROR",
  COMPLIANCE_ERROR: "COMPLIANCE_ERROR",
  EVIDENCE_ERROR: "EVIDENCE_ERROR",
  AMBIGUOUS_HANDLING_ERROR: "AMBIGUOUS_HANDLING_ERROR",
  MULTILINGUAL_ERROR: "MULTILINGUAL_ERROR",
  NO_MATCH_HANDLING_ERROR: "NO_MATCH_HANDLING_ERROR",
  DATASET_GAP: "DATASET_GAP",
  SOURCE_GAP: "SOURCE_GAP",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",

  // Backward compatibility aliases
  AMBIGUOUS_REQUIREMENT: "AMBIGUOUS_HANDLING_ERROR",
  WRONG_PRODUCT: "ATTRIBUTE_EXTRACTION_ERROR",
  WRONG_APPLICATION: "ATTRIBUTE_EXTRACTION_ERROR",
  WRONG_MATERIAL: "ATTRIBUTE_EXTRACTION_ERROR",
  MISSING_TECHNICAL_MATCH: "ATTRIBUTE_EXTRACTION_ERROR",
  TRANSLATION_ERROR: "MULTILINGUAL_ERROR",
  TERMINOLOGY_ERROR: "MULTILINGUAL_ERROR",
  LEXICAL_MISS: "LEXICAL_RETRIEVAL_ERROR",
  SEMANTIC_MISS: "SEMANTIC_RETRIEVAL_ERROR",
  INSUFFICIENT_EVIDENCE: "EVIDENCE_ERROR",
  OTHER: "CONFIGURATION_ERROR",
};

/**
 * Classifies a failed recommendation evaluation case into an engineering error category.
 *
 * @param {Object} testCase - Evaluation case definition
 * @param {Object} rec - Actual recommendation engine output
 * @param {Array<Object>} candidates - Scored candidates retrieved
 * @param {Set<string>} dbStandardNumbers - Set of all standard numbers currently in the database
 * @returns {{ category: string, reason: string, diagnostic: Object }}
 */
export function classifyFailure(testCase, rec, candidates = [], dbStandardNumbers = new Set()) {
  const expectedStandards = testCase.expectedStandardIds || [];
  const topCandidate = rec?.primaryRecommendation;
  const topStandardNumber = topCandidate?.standardNumber;

  // 1. DATASET_GAP: Expected standard is completely missing from current database catalog
  if (expectedStandards.length > 0) {
    const isAnyExpectedInDb = expectedStandards.some((exp) => {
      for (const dbNum of dbStandardNumbers) {
        if (dbNum.includes(exp) || exp.includes(dbNum)) return true;
      }
      return false;
    });

    if (!isAnyExpectedInDb) {
      return {
        category: ERROR_CATEGORIES.DATASET_GAP,
        reason: `Expected standard (${expectedStandards.join(", ")}) is not present in the current standards catalog database.`,
        diagnostic: {
          expectedStandards,
          catalogCoverage: "ABSENT",
          recommendationState: rec?.state || rec?.status,
        },
      };
    }
  }

  // 2. CLARIFICATION failure modes
  if (testCase.evaluationType === "CLARIFICATION") {
    if (rec?.state !== "CLARIFICATION_REQUIRED" && rec?.status !== "CLARIFICATION_REQUIRED") {
      return {
        category: ERROR_CATEGORIES.AMBIGUOUS_REQUIREMENT,
        reason: `Requirement is underspecified, but recommendation engine forced standard (${topStandardNumber || "None"}) instead of requesting clarification.`,
        diagnostic: {
          forcedStandard: topStandardNumber,
          confidence: rec?.confidence,
        },
      };
    }
  }

  // 3. NO_MATCH failure modes
  if (testCase.evaluationType === "NO_MATCH") {
    if (rec?.primaryRecommendation && rec?.confidence >= 50) {
      return {
        category: ERROR_CATEGORIES.WRONG_PRODUCT,
        reason: `Requirement describes an out-of-catalog or non-standard product, but engine produced match (${topStandardNumber}) with ${rec.confidence}% confidence.`,
        diagnostic: {
          topCandidate: topStandardNumber,
          confidence: rec.confidence,
        },
      };
    }
  }

  // 4. CURRENTNESS errors
  if (testCase.evaluationType === "CURRENTNESS" || testCase.notes?.includes("withdrawn") || testCase.notes?.includes("superseded")) {
    if (topCandidate?.status === "WITHDRAWN") {
      return {
        category: ERROR_CATEGORIES.CURRENTNESS_ERROR,
        reason: `Withdrawn standard (${topStandardNumber}) was cited as primary recommendation in violation of BIS currentness safety rules.`,
        diagnostic: { standardStatus: topCandidate.status },
      };
    }
    if (topCandidate?.status === "SUPERSEDED" && !rec?.warnings?.some((w) => w.includes("superseded"))) {
      return {
        category: ERROR_CATEGORIES.CURRENTNESS_ERROR,
        reason: `Superseded standard (${topStandardNumber}) was recommended without deprecation warning.`,
        diagnostic: { standardStatus: topCandidate.status },
      };
    }
  }

  // 5. INSUFFICIENT_EVIDENCE
  if (rec?.primaryRecommendation && (!rec.evidence || rec.evidence.length === 0)) {
    return {
      category: ERROR_CATEGORIES.INSUFFICIENT_EVIDENCE,
      reason: `Standard (${topStandardNumber}) recommended without linked clauses or evidence matrix.`,
      diagnostic: { evidenceCount: 0 },
    };
  }

  // 6. MULTILINGUAL / TRANSLATION / TERMINOLOGY errors
  if (testCase.language && testCase.language.toLowerCase() !== "en") {
    const rawNormalized = rec?.searchText || "";
    const expectedProd = testCase.expectedAttributes?.product?.toLowerCase();
    if (expectedProd && !rawNormalized.toLowerCase().includes(expectedProd)) {
      return {
        category: ERROR_CATEGORIES.TERMINOLOGY_ERROR,
        reason: `Indic language input (${testCase.language}) failed to normalize technical product term to '${expectedProd}'.`,
        diagnostic: {
          detectedLanguage: rec?.detectedLanguage,
          searchText: rec?.searchText,
          expectedProduct: expectedProd,
        },
      };
    }
  }

  // 7. Check retrieval methods of the expected candidate
  const expectedMatch = candidates.find((c) =>
    expectedStandards.some((exp) => c.standardNumber?.includes(exp) || exp.includes(c.standardNumber || ""))
  );

  if (!expectedMatch && candidates.length > 0) {
    // Expected was never retrieved at all
    return {
      category: ERROR_CATEGORIES.LEXICAL_MISS,
      reason: `Expected standard was not retrieved into the candidate pool by lexical, structured, or vector search.`,
      diagnostic: {
        candidateCount: candidates.length,
        retrievedTopCandidate: topStandardNumber,
      },
    };
  }

  if (expectedMatch) {
    const methods = expectedMatch.retrievedBy || [];
    if (!methods.includes("lexical") && methods.includes("vector")) {
      return {
        category: ERROR_CATEGORIES.LEXICAL_MISS,
        reason: `Expected standard retrieved via vector similarity but missed by PostgreSQL lexical FTS search.`,
        diagnostic: { retrievedBy: methods },
      };
    }
    if (!methods.includes("vector") && methods.includes("lexical")) {
      return {
        category: ERROR_CATEGORIES.SEMANTIC_MISS,
        reason: `Expected standard retrieved via lexical tokens but scored low in vector semantic similarity.`,
        diagnostic: { retrievedBy: methods },
      };
    }

    // 8. Attribute mismatch
    if (testCase.expectedAttributes?.product && topCandidate) {
      const topTitle = (topCandidate.title || "").toLowerCase();
      const expectedProd = testCase.expectedAttributes.product.toLowerCase();
      if (!topTitle.includes(expectedProd) && !topStandardNumber?.includes(expectedStandards[0])) {
        return {
          category: ERROR_CATEGORIES.WRONG_PRODUCT,
          reason: `Retrieved candidate title '${topCandidate.title}' does not match expected product '${testCase.expectedAttributes.product}'.`,
          diagnostic: { topTitle, expectedProduct: expectedProd },
        };
      }
    }
  }

  return {
    category: ERROR_CATEGORIES.OTHER,
    reason: `Recommendation did not rank expected standard as primary. Top rank: ${topStandardNumber || "None"}.`,
    diagnostic: {
      expectedStandards,
      topCandidate: topStandardNumber,
      matchScore: topCandidate?.matchScore || topCandidate?.score,
    },
  };
}

/**
 * Builds human-readable diagnostic report for a failed evaluation case (Section 14)
 */
export function explainFailure(testCase, rec, errorClassification) {
  const topCandidate = rec?.primaryRecommendation;
  const methods = topCandidate?.retrievedBy || ["lexical"];

  return {
    caseId: testCase.id,
    requirement: testCase.requirement,
    expected: testCase.expectedStandardIds?.join(", ") || "None (or Clarification)",
    retrieved: topCandidate?.standardNumber || "None",
    topResult: topCandidate ? `${topCandidate.standardNumber} - ${topCandidate.title}` : "None",
    whyItFailed: errorClassification.reason,
    retrievalMethods: {
      structured: methods.includes("structured") ? "Yes" : "No",
      lexical: methods.includes("lexical") ? "Yes" : "No",
      vector: methods.includes("vector") ? "Yes" : "No",
    },
    possibleCause: errorClassification.reason,
    errorCategory: errorClassification.category,
    diagnostic: errorClassification.diagnostic,
  };
}
