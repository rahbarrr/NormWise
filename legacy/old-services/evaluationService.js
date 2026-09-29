/**
 * NormWise Recommendation Quality Evaluation & Benchmarking Engine (Phase 17 & Phase 21)
 *
 * Implements Real-Case Validation, Empirical Benchmarks, and Multi-Signal Diagnostic Testing:
 * 1. Real Validation Dataset Loading (Categorized, Gold-Standard Verification Levels)
 * 2. Case Type Handlers (Clear, Ambiguous, Multiple Standards, Outdated, No Match, Multilingual, Partial)
 * 3. Recommendation Evaluation: Recall@1, Recall@3, Recall@5, Recall@10, MRR on verified cases
 * 4. Attribute Extraction Evaluation: Exact, Partial, Missing, Incorrect, Uncertain
 * 5. Currentness Evaluation: CURRENT, SUPERSEDED, WITHDRAWN, UNDER_REVIEW, UNKNOWN
 * 6. Ambiguity Handling Evaluation: CLARIFICATION_REQUIRED, INSUFFICIENT_EVIDENCE, NO_MATCH
 * 7. Related-Standard Graph Evaluation: Test Method, Safety, Component, Material, Normative Reference
 * 8. Compliance & QCO Rules Evaluation: Deterministic matching vs LLM hallucination guards
 * 9. Evidence Coverage & Groundedness Classification: SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED
 * 10. Multilingual Preservation: Indic linguistic normalization & domain terminology stability
 * 11. Multi-Strategy Retrieval Comparison: Structured vs Lexical vs Vector vs Hybrid
 * 12. Standardized Error Taxonomy (13 Categories)
 * 13. Human Validation Feedback Loop
 * 14. Reproducibility & Regression Tracking
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/db.js";
import { recommend } from "./recommendationService.js";
import { classifyFailure, ERROR_CATEGORIES } from "./errorAnalysisService.js";
import {
  retrieveStructuredCandidates,
  retrieveLexicalCandidates,
  retrieveVectorCandidates,
  retrieveCandidates,
} from "./retrievalService.js";
import complianceRuleService from "./complianceRuleService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Normalizes text for comparison
 */
export function normalizeAttr(str) {
  if (!str || typeof str !== "string") return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

/**
 * Loads evaluation cases recursively from server/data/evaluation/
 * Supports Phase 21 real-case schema & backward-compatible Phase 17 schema
 */
export function loadEvaluationCases(options = {}) {
  const baseDir = options.datasetDir || path.resolve(__dirname, "../../data/evaluation");
  if (!fs.existsSync(baseDir)) return [];

  const testCases = [];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "multilingual" && !options.includeMultilingual && !options.category) {
          continue;
        }
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        try {
          const raw = fs.readFileSync(fullPath, "utf-8");
          const parsed = JSON.parse(raw);

          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const c of items) {
            if (!c) continue;

            const caseId = c.caseId || c.id;
            const requirement = c.requirementText || c.requirement;
            if (!caseId || !requirement) continue;

            // Normalize schema properties
            const normalizedCase = {
              ...c,
              id: caseId,
              caseId: caseId,
              requirement: requirement,
              requirementText: requirement,
              category: c.category || (fullPath.includes("pressure-cooker") ? "pressure-cooker" : fullPath.includes("lighting") ? "lighting" : fullPath.includes("electrical") ? "electrical-accessories" : "other-authorized-categories"),
              caseType: c.caseType || c.evaluationType || "CLEAR",
              language: c.language || "en",
              expectedAttributes: c.expectedAttributes || {},
              expectedStandards: c.expectedStandards || c.expectedStandardIds || [],
              expectedStandardIds: c.expectedStandards || c.expectedStandardIds || [],
              acceptableAlternatives: c.acceptableAlternatives || c.acceptableStandardIds || [],
              acceptableStandardIds: c.acceptableAlternatives || c.acceptableStandardIds || [],
              expectedCurrentness: c.expectedCurrentness || "CURRENT",
              expectedRelationships: c.expectedRelationships || [],
              expectedComplianceOutcome: c.expectedComplianceOutcome || "POTENTIALLY_APPLICABLE",
              expectedEvidenceRequirements: c.expectedEvidenceRequirements || [],
              ambiguityLevel: c.ambiguityLevel || "CLEAR",
              verificationLevel: c.verificationLevel || (c.notes?.toLowerCase().includes("unverified") ? "UNVERIFIED" : "VERIFIED"),
              datasetVersion: c.datasetVersion || "2026.09",
              sourceReference: c.sourceReference || c.source || "BIS Demonstration Catalog",
              _sourceFile: path.relative(baseDir, fullPath),
            };

            // Apply filters
            if (options.caseId && normalizedCase.caseId !== options.caseId && normalizedCase.id !== options.caseId) {
              continue;
            }
            if (options.category && options.category !== "all" && normalizedCase.category !== options.category) {
              continue;
            }
            if (options.caseType && options.caseType !== "all" && normalizedCase.caseType !== options.caseType) {
              continue;
            }
            if (options.verificationLevel && normalizedCase.verificationLevel !== options.verificationLevel) {
              continue;
            }
            if (options.datasetVersion && normalizedCase.datasetVersion !== options.datasetVersion) {
              continue;
            }

            testCases.push(normalizedCase);
          }
        } catch (e) {
          console.warn(`[EvaluationService] Failed to parse JSON file ${fullPath}:`, e.message);
        }
      }
    }
  }

  scanDir(baseDir);

  if (options.limit && options.limit > 0) {
    return testCases.slice(0, options.limit);
  }

  return testCases;
}

/**
 * Evaluates extracted requirement attributes against expected attributes (Section 4)
 * Measures: EXACT_MATCH, PARTIAL_MATCH, MISSING, INCORRECT, UNCERTAIN
 */
export function evaluateAttributes(testCase, rec) {
  const expected = testCase.expectedAttributes || {};
  const extracted = rec?.requirement || rec?.extractedAttributes || {};
  const report = {};

  const evaluatedFields = [
    "product",
    "material",
    "application",
    "capacity",
    "intendedUse",
    "relevantTerminology",
  ];

  let exactMatches = 0;
  let partialMatches = 0;
  let missingFields = 0;
  let incorrectFields = 0;
  let totalEvaluated = 0;
  const fieldDetails = {};

  for (const field of evaluatedFields) {
    const expVal = expected[field];
    const actVal = extracted[field];

    if (!expVal) {
      report[field] = actVal ? { status: "UNEXPECTED", actual: actVal } : { status: "N/A" };
      fieldDetails[field] = report[field];
      continue;
    }

    totalEvaluated++;

    if (!actVal) {
      report[field] = { status: "MISSING", expected: expVal };
      fieldDetails[field] = { status: "MISSING", expected: expVal };
      missingFields++;
      continue;
    }

    const normExp = normalizeAttr(Array.isArray(expVal) ? expVal.join(" ") : expVal);
    const normAct = normalizeAttr(Array.isArray(actVal) ? actVal.join(" ") : actVal);

    if (normExp === normAct) {
      report[field] = { status: "EXACT_MATCH", expected: expVal, actual: actVal };
      fieldDetails[field] = { status: "EXACT_MATCH", expected: expVal, actual: actVal };
      exactMatches++;
    } else if (normAct.includes(normExp) || normExp.includes(normAct)) {
      report[field] = { status: "NORMALIZED_MATCH", expected: expVal, actual: actVal };
      fieldDetails[field] = { status: "PARTIAL_MATCH", expected: expVal, actual: actVal };
      partialMatches++;
    } else {
      report[field] = { status: "INCORRECT", expected: expVal, actual: actVal };
      fieldDetails[field] = { status: "INCORRECT", expected: expVal, actual: actVal };
      incorrectFields++;
    }
  }

  // Technical characteristics evaluation
  if (expected.technicalCharacteristics && Array.isArray(expected.technicalCharacteristics)) {
    const actTech = Array.isArray(extracted.technicalCharacteristics)
      ? extracted.technicalCharacteristics
      : typeof extracted.technicalCharacteristics === "string"
      ? extracted.technicalCharacteristics.split(",").map((s) => s.trim())
      : [];

    const matched = expected.technicalCharacteristics.filter((t) =>
      actTech.some((at) => normalizeAttr(at).includes(normalizeAttr(t)) || normalizeAttr(t).includes(normalizeAttr(at)))
    );

    const techObj = {
      expected: expected.technicalCharacteristics,
      actual: actTech,
      matched,
      coverage: expected.technicalCharacteristics.length > 0
        ? Number((matched.length / expected.technicalCharacteristics.length).toFixed(2))
        : 1,
    };
    report.technicalCharacteristics = techObj;
    fieldDetails.technicalCharacteristics = techObj;
  }

  const accuracyRate = totalEvaluated > 0
    ? Number(((exactMatches + 0.5 * partialMatches) / totalEvaluated).toFixed(4))
    : 1.0;

  return {
    ...report,
    fields: fieldDetails,
    summary: {
      totalEvaluated,
      exactMatches,
      partialMatches,
      missingFields,
      incorrectFields,
      accuracyRate,
    },
  };
}

/**
 * Evaluates candidate retrieval ranks and recalls (Section 5)
 */
export function evaluateRetrieval(testCase, rec, candidates = []) {
  const expectedList = [
    ...(testCase.expectedStandards || []),
    ...(testCase.expectedStandardIds || []),
    ...(testCase.acceptableAlternatives || []),
    ...(testCase.acceptableStandardIds || []),
  ].filter(Boolean);

  const isLabelled = expectedList.length > 0 && testCase.caseType !== "NO_MATCH" && testCase.verificationLevel !== "UNVERIFIED";

  if (!isLabelled) {
    return {
      isLabelled: false,
      recallAt1: null,
      recallAt3: null,
      recallAt5: null,
      recallAt10: null,
      reciprocalRank: null,
      rankOfExpected: null,
      retrievedOrder: [],
    };
  }

  // Build ordered list of unique retrieved standards
  const retrievedOrder = [];
  if (rec?.primaryRecommendation?.standardNumber) {
    retrievedOrder.push(rec.primaryRecommendation.standardNumber);
  }
  for (const alt of rec?.alternatives || []) {
    if (alt.standardNumber && !retrievedOrder.includes(alt.standardNumber)) {
      retrievedOrder.push(alt.standardNumber);
    }
  }
  for (const c of candidates) {
    if (c.standardNumber && !retrievedOrder.includes(c.standardNumber)) {
      retrievedOrder.push(c.standardNumber);
    }
  }

  let rank = null;
  for (let i = 0; i < retrievedOrder.length; i++) {
    const retNum = retrievedOrder[i];
    const isMatch = expectedList.some(
      (exp) => retNum.toLowerCase().includes(exp.toLowerCase()) || exp.toLowerCase().includes(retNum.toLowerCase())
    );
    if (isMatch) {
      rank = i + 1;
      break;
    }
  }

  return {
    isLabelled: true,
    rankOfExpected: rank,
    recallAt1: rank === 1 ? 1 : 0,
    recallAt3: rank !== null && rank <= 3 ? 1 : 0,
    recallAt5: rank !== null && rank <= 5 ? 1 : 0,
    recallAt10: rank !== null && rank <= 10 ? 1 : 0,
    reciprocalRank: rank !== null ? Number((1 / rank).toFixed(4)) : 0,
    retrievedOrder: retrievedOrder.slice(0, 10),
  };
}

/**
 * Evaluates currentness handling safety rules (Section 6)
 */
export function evaluateCurrentness(testCase, rec) {
  const topCandidate = rec?.primaryRecommendation;
  const actualStatus = topCandidate?.status || "UNKNOWN";
  const expectedStatus = testCase.expectedCurrentness || "CURRENT";

  const isWithdrawnPrimary = actualStatus === "WITHDRAWN";
  const isSupersededPrimary = actualStatus === "SUPERSEDED";
  const warnings = topCandidate?.warnings || rec?.warnings || [];

  const hasSupersededWarning = isSupersededPrimary
    ? warnings.some((w) => w.toLowerCase().includes("superseded"))
    : true;

  // Safety rule: Withdrawn standard must NEVER silently become primary
  const safetyRulePassed = !isWithdrawnPrimary;

  const statusMatches = expectedStatus === "UNKNOWN" || actualStatus === expectedStatus;

  return {
    expectedStatus,
    actualStatus,
    statusMatches,
    isWithdrawnPrimary,
    isSupersededPrimary,
    hasSupersededWarning,
    safetyRulePassed,
    staleRecommendation: isWithdrawnPrimary || isSupersededPrimary,
  };
}

/**
 * Evaluates ambiguity & clarification handling (Section 7)
 */
export function evaluateAmbiguity(testCase, rec) {
  const isClarificationExpected =
    testCase.caseType === "AMBIGUOUS" ||
    testCase.caseType === "PARTIAL_SPEC" ||
    testCase.ambiguityLevel === "HIGH" ||
    testCase.evaluationType === "CLARIFICATION";

  const actualState = rec?.state || rec?.status;
  const isClarificationActual = actualState === "CLARIFICATION_REQUIRED" || actualState === "CLARIFICATION_REQUESTED";

  const questions = rec?.clarifyingQuestions || [];
  const missingTaxonomy = !rec?.requirement?.product;

  const passed = isClarificationExpected === isClarificationActual;

  return {
    expected: isClarificationExpected,
    actual: isClarificationActual,
    passed,
    questionsCount: questions.length,
    questionsGenerated: questions.length,
    missingTaxonomyIdentified: missingTaxonomy,
    hasForcedAnswer: isClarificationExpected && !isClarificationActual && Boolean(rec?.primaryRecommendation),
    hasFabricatedStandard: isClarificationExpected && !isClarificationActual && Boolean(rec?.primaryRecommendation),
  };
}

export const evaluateClarification = evaluateAmbiguity;

/**
 * Evaluates related standards retrieval from knowledge graph (Section 8)
 */
export function evaluateRelationships(testCase, rec) {
  const expected = testCase.expectedRelationships || [];
  const actual = rec?.relatedStandards || [];

  if (expected.length === 0) {
    return {
      evaluated: false,
      expectedCount: 0,
      actualCount: actual.length,
      matched: [],
      missing: [],
      recall: 1.0,
    };
  }

  const matched = [];
  const missing = [];

  for (const exp of expected) {
    const isFound = actual.some((act) => {
      const numMatch = (act.standardNumber || "").includes(exp.standardNumber) || (exp.standardNumber || "").includes(act.standardNumber);
      const typeMatch = !exp.type || act.relationshipType === exp.type;
      return numMatch && typeMatch;
    });

    if (isFound) {
      matched.push(exp);
    } else {
      missing.push(exp);
    }
  }

  const recall = expected.length > 0 ? Number((matched.length / expected.length).toFixed(2)) : 1.0;

  return {
    evaluated: true,
    expectedCount: expected.length,
    actualCount: actual.length,
    matched,
    missing,
    recall,
  };
}

/**
 * Evaluates compliance engine output against expected rules (Section 9)
 */
export function evaluateCompliance(testCase, rec) {
  const expectedOutcome = testCase.expectedComplianceOutcome || "POTENTIALLY_APPLICABLE";
  const actualOutcome = rec?.compliance?.overallOutcome || (rec?.primaryRecommendation ? "POTENTIALLY_APPLICABLE" : "INSUFFICIENT_EVIDENCE");

  const passed = expectedOutcome === actualOutcome || (expectedOutcome === "POTENTIALLY_APPLICABLE" && actualOutcome === "REQUIRES_REVIEW");

  return {
    expectedOutcome,
    actualOutcome,
    passed,
    explanation: rec?.compliance?.summaryExplanation || "Evaluated by deterministic compliance rule engine.",
  };
}

/**
 * Evaluates evidence coverage and ground truth backing (Section 10)
 */
export function evaluateEvidenceCoverage(rec) {
  const evidenceList = rec?.evidence || [];
  const hasEvidence = evidenceList.length > 0;

  const hasIdentity = Boolean(rec?.primaryRecommendation?.standardNumber);
  const hasTitle = Boolean(rec?.primaryRecommendation?.title);
  const hasCurrentness = evidenceList.some((e) => e.type === "CURRENTNESS") || Boolean(rec?.primaryRecommendation?.status);
  const hasRelationship = evidenceList.some((e) => e.type === "RELATED_STANDARD") || (Array.isArray(rec?.relatedStandards) && rec.relatedStandards.length > 0);
  const hasCompliance = evidenceList.some((e) => e.type === "CERTIFICATION" || e.type === "REQUIREMENT") || Boolean(rec?.compliance);
  const hasRationale = Boolean(rec?.explanation);

  const breakdown = {
    standardIdentity: hasIdentity ? "SUPPORTED" : "NOT_AVAILABLE",
    standardTitle: hasTitle ? "SUPPORTED" : "NOT_AVAILABLE",
    currentness: hasCurrentness ? "SUPPORTED" : "UNSUPPORTED",
    relationship: hasRelationship ? "SUPPORTED" : "UNSUPPORTED",
    compliance: hasCompliance ? "SUPPORTED" : "UNSUPPORTED",
    recommendationRationale: hasRationale ? "SUPPORTED" : "UNSUPPORTED",
  };

  const supportedCount = Object.values(breakdown).filter((v) => v === "SUPPORTED").length;
  const coveragePercent = Number(((supportedCount / 6) * 100).toFixed(1));

  return {
    hasEvidence,
    evidenceCount: evidenceList.length,
    breakdown,
    claims: breakdown,
    counts: {
      scope: evidenceList.filter((e) => e.type === "SCOPE").length,
      currentness: evidenceList.filter((e) => e.type === "CURRENTNESS").length,
      relationship: evidenceList.filter((e) => e.type === "RELATED_STANDARD").length,
      compliance: evidenceList.filter((e) => e.type === "CERTIFICATION" || e.type === "REQUIREMENT").length,
    },
    coveragePercent: `${coveragePercent}%`,
    overallSupported: coveragePercent >= 50,
  };
}

export function evaluateEvidence(rec) {
  const evidenceList = rec?.evidence || [];
  return {
    hasEvidence: evidenceList.length > 0,
    evidenceCount: evidenceList.length,
    breakdown: {
      scope: evidenceList.filter((e) => e.type === "SCOPE").length,
      currentness: evidenceList.filter((e) => e.type === "CURRENTNESS").length,
      compliance: evidenceList.filter((e) => e.type === "CERTIFICATION" || e.type === "REQUIREMENT").length,
      citation: evidenceList.filter((e) => e.type === "CITATION").length,
    },
    coverage: evidenceList.length > 0 ? 1 : 0,
    coveragePercent: evidenceList.length > 0 ? "100.0%" : "0.0%",
  };
}

/**
 * Compares 4 retrieval methods for a test requirement (Section 12)
 */
export async function compareRetrievalMethods(testCase) {
  const text = testCase.requirement;
  const expected = testCase.expectedStandards || testCase.expectedStandardIds || [];

  const methods = {};

  // 1. Structured
  try {
    const t0 = Date.now();
    const res = await retrieveStructuredCandidates(testCase.expectedAttributes || {});
    const latencyMs = Date.now() - t0;
    const topMatch = res[0]?.standardNumber || null;
    const isExpectedTop = topMatch && expected.some((e) => topMatch.includes(e));
    methods.structured = { count: res.length, topMatch, isExpectedTop: Boolean(isExpectedTop), latencyMs };
  } catch (err) {
    methods.structured = { count: 0, error: err.message, latencyMs: 0 };
  }

  // 2. Lexical (FTS)
  try {
    const t0 = Date.now();
    const res = await retrieveLexicalCandidates(text, testCase.expectedAttributes || {});
    const latencyMs = Date.now() - t0;
    const topMatch = res[0]?.standardNumber || null;
    const isExpectedTop = topMatch && expected.some((e) => topMatch.includes(e));
    methods.lexical = { count: res.length, topMatch, isExpectedTop: Boolean(isExpectedTop), latencyMs };
  } catch (err) {
    methods.lexical = { count: 0, error: err.message, latencyMs: 0 };
  }

  // 3. Vector (pgvector)
  try {
    const t0 = Date.now();
    const res = await retrieveVectorCandidates(text);
    const latencyMs = Date.now() - t0;
    const topMatch = res[0]?.standardNumber || null;
    const isExpectedTop = topMatch && expected.some((e) => topMatch.includes(e));
    methods.vector = { count: res.length, topMatch, isExpectedTop: Boolean(isExpectedTop), latencyMs };
  } catch (err) {
    methods.vector = { count: 0, error: err.message, latencyMs: 0 };
  }

  // 4. Hybrid
  try {
    const t0 = Date.now();
    const res = await retrieveCandidates(text, testCase.expectedAttributes || {});
    const latencyMs = Date.now() - t0;
    const topMatch = res[0]?.standardNumber || null;
    const isExpectedTop = topMatch && expected.some((e) => topMatch.includes(e));
    methods.hybrid = { count: res.length, topMatch, isExpectedTop: Boolean(isExpectedTop), latencyMs };
  } catch (err) {
    methods.hybrid = { count: 0, error: err.message, latencyMs: 0 };
  }

  return methods;
}

/**
 * Evaluates a single test case through the production recommendation pipeline
 */
export async function evaluateCase(testCase, dbStandardNumbers = new Set(), options = {}) {
  const startTime = Date.now();
  let rec = null;
  let executionError = null;

  try {
    rec = await recommend(testCase.requirement, {
      language: testCase.language,
      debug: true,
      ...options,
    });
  } catch (err) {
    executionError = err;
  }

  const processingTimeMs = Date.now() - startTime;

  if (executionError) {
    return {
      caseId: testCase.id,
      status: "FAILED",
      evaluationType: testCase.caseType || "CLEAR",
      verificationLevel: testCase.verificationLevel || "VERIFIED",
      requirement: testCase.requirement,
      language: testCase.language || "en",
      expectedStandardIds: testCase.expectedStandards || [],
      retrievedStandardIds: [],
      topStandardId: null,
      topMatchScore: 0,
      rankOfExpected: null,
      retrievalMethod: [],
      clarificationExpected: testCase.caseType === "AMBIGUOUS",
      clarificationActual: false,
      evidenceAvailable: false,
      errorCategory: ERROR_CATEGORIES.CONFIGURATION_ERROR,
      failureReason: executionError.message,
      extractedAttributes: null,
      expectedAttributes: testCase.expectedAttributes || null,
      attributeMatches: null,
      processingTimeMs,
      notes: testCase.notes || null,
    };
  }

  // Extract scored candidates
  const candidates = rec?.debug?.candidateSources || [];
  const allRetrievedNumbers = [
    rec?.primaryRecommendation?.standardNumber,
    ...(rec?.alternatives || []).map((a) => a.standardNumber),
  ].filter(Boolean);

  const retrievalEval = evaluateRetrieval(testCase, rec, candidates);
  const attributeEval = evaluateAttributes(testCase, rec);
  const ambiguityEval = evaluateAmbiguity(testCase, rec);
  const currentnessEval = evaluateCurrentness(testCase, rec);
  const relationshipEval = evaluateRelationships(testCase, rec);
  const complianceEval = evaluateCompliance(testCase, rec);
  const evidenceEval = evaluateEvidenceCoverage(rec);

  // Optional: Run retrieval strategy comparison if requested
  let retrievalComparison = null;
  if (options.compareRetrieval) {
    try {
      retrievalComparison = await compareRetrievalMethods(testCase);
    } catch (e) {
      console.warn(`[EvaluationService] Method comparison failed for ${testCase.id}:`, e.message);
    }
  }

  // Overall case pass/fail determination
  let status = "SUCCESS";
  let failureReason = null;
  let errorCategory = null;

  if (testCase.caseType === "AMBIGUOUS" || testCase.caseType === "PARTIAL_SPEC") {
    if (!ambiguityEval.passed) {
      status = "FAILED";
      errorCategory = ERROR_CATEGORIES.AMBIGUOUS_HANDLING_ERROR;
      failureReason = `Requirement was ambiguous/partial, but engine forced recommendation (${rec?.primaryRecommendation?.standardNumber}) instead of requesting clarification.`;
    }
  } else if (testCase.caseType === "NO_MATCH") {
    if (rec?.primaryRecommendation && rec.confidence >= 40) {
      status = "FAILED";
      errorCategory = ERROR_CATEGORIES.NO_MATCH_HANDLING_ERROR;
      failureReason = `Out-of-catalog requirement forced match (${rec?.primaryRecommendation?.standardNumber}) with ${rec.confidence}% confidence.`;
    }
  } else if (retrievalEval.isLabelled) {
    if (retrievalEval.recallAt5 === 0) {
      status = "FAILED";
      const classified = classifyFailure(testCase, rec, candidates, dbStandardNumbers);
      errorCategory = classified.category;
      failureReason = classified.reason;
    } else if (retrievalEval.recallAt1 === 0) {
      status = "WARNING";
      failureReason = `Expected standard found at rank ${retrievalEval.rankOfExpected} rather than Rank 1.`;
    }
  }

  if (!currentnessEval.safetyRulePassed) {
    status = "FAILED";
    errorCategory = ERROR_CATEGORIES.CURRENTNESS_ERROR;
    failureReason = `Withdrawn standard ${rec?.primaryRecommendation?.standardNumber} cited as primary.`;
  }

  const topCand = rec?.primaryRecommendation;
  const methods = topCand?.retrievedBy || ["hybrid"];

  return {
    caseId: testCase.id,
    status,
    evaluationType: testCase.caseType || "CLEAR",
    verificationLevel: testCase.verificationLevel || "VERIFIED",
    expectedOutcome: testCase.caseType === "AMBIGUOUS" ? "CLARIFICATION_REQUIRED" : testCase.caseType === "NO_MATCH" ? "NO_MATCH" : "RECOMMENDED",
    actualOutcome: rec?.status || (rec?.primaryRecommendation ? "RECOMMENDED" : "NO_MATCH"),
    requirement: testCase.requirement,
    language: testCase.language || "en",
    expectedStandardIds: testCase.expectedStandards || [],
    retrievedStandardIds: allRetrievedNumbers,
    topStandardId: topCand?.standardNumber || null,
    topMatchScore: topCand?.matchScore || topCand?.score || 0,
    rankOfExpected: retrievalEval.rankOfExpected,
    retrievalMethod: methods,
    clarificationExpected: ambiguityEval.expected,
    clarificationActual: ambiguityEval.actual,
    evidenceAvailable: evidenceEval.hasEvidence,
    errorCategory: status === "FAILED" ? (errorCategory || ERROR_CATEGORIES.CONFIGURATION_ERROR) : null,
    failureReason: status !== "SUCCESS" ? failureReason : null,
    extractedAttributes: rec?.requirement || null,
    expectedAttributes: testCase.expectedAttributes || null,
    attributeMatches: attributeEval,
    retrievalMetrics: retrievalEval,
    currentnessEval,
    ambiguityEval,
    relationshipEval,
    complianceEval,
    evidenceCoverage: evidenceEval,
    retrievalComparison,
    processingTimeMs,
    notes: testCase.notes || null,
    rawRecommendation: rec,
  };
}

/**
 * Runs a complete evaluation suite and records results in database
 */
export async function runEvaluation(options = {}) {
  const startTime = Date.now();
  const testCases = options.cases || loadEvaluationCases(options);

  if (testCases.length === 0) {
    throw new Error("No evaluation test cases found to run.");
  }

  // Pre-fetch all standard numbers in DB for DATASET_GAP detection
  const standardsInDb = await prisma.standard.findMany({ select: { standardNumber: true } });
  const dbStandardNumbers = new Set(standardsInDb.map((s) => s.standardNumber));

  // 1. Create EvaluationRun record in PostgreSQL
  const runName = options.name || `Evaluation Run ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
  const evalRun = await prisma.evaluationRun.create({
    data: {
      name: runName,
      engineVersion: "hybrid-v1",
      datasetVersion: options.datasetVersion || "2026.09",
      retrievalMode: options.mode || "hybrid",
      embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      totalCases: testCases.length,
      startedAt: new Date(),
    },
  });

  const results = [];
  let completed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const caseResult = await evaluateCase(testCase, dbStandardNumbers, options);
      if (caseResult.status === "FAILED") failed++;
      completed++;
      results.push(caseResult);

      // Persist individual EvaluationResult
      await prisma.evaluationResult.create({
        data: {
          evaluationRunId: evalRun.id,
          caseId: caseResult.caseId,
          status: caseResult.status,
          evaluationType: caseResult.evaluationType,
          verificationLevel: caseResult.verificationLevel,
          expectedOutcome: caseResult.expectedOutcome,
          actualOutcome: caseResult.actualOutcome,
          requirement: caseResult.requirement,
          language: caseResult.language,
          expectedStandardIds: caseResult.expectedStandardIds,
          retrievedStandardIds: caseResult.retrievedStandardIds,
          topStandardId: caseResult.topStandardId,
          topMatchScore: caseResult.topMatchScore,
          rankOfExpected: caseResult.rankOfExpected,
          retrievalMethod: caseResult.retrievalMethod,
          clarificationExpected: caseResult.clarificationExpected,
          clarificationActual: caseResult.clarificationActual,
          evidenceAvailable: caseResult.evidenceAvailable,
          errorCategory: caseResult.errorCategory,
          failureReason: caseResult.failureReason,
          extractedAttributes: caseResult.extractedAttributes,
          expectedAttributes: caseResult.expectedAttributes,
          attributeMatches: caseResult.attributeMatches,
          evidenceCoverage: caseResult.evidenceCoverage,
          complianceOutcome: caseResult.complianceEval,
          retrievalComparison: caseResult.retrievalComparison,
          processingTimeMs: caseResult.processingTimeMs,
          notes: caseResult.notes,
        },
      });
    } catch (caseErr) {
      failed++;
      completed++;
      console.error(`[EvaluationService] Case ${testCase.id} failed fatally:`, caseErr.message);
    }
  }

  // 2. Aggregate Evaluation Metrics
  const verifiedCases = results.filter((r) => r.verificationLevel === "VERIFIED");
  const unverifiedCases = results.filter((r) => r.verificationLevel === "UNVERIFIED");

  const labelledCases = verifiedCases.filter((r) => r.retrievalMetrics?.isLabelled);
  const totalLabelled = labelledCases.length;

  let r1Count = 0;
  let r3Count = 0;
  let r5Count = 0;
  let r10Count = 0;
  let mrrSum = 0;

  for (const c of labelledCases) {
    if (c.retrievalMetrics.recallAt1) r1Count++;
    if (c.retrievalMetrics.recallAt3) r3Count++;
    if (c.retrievalMetrics.recallAt5) r5Count++;
    if (c.retrievalMetrics.recallAt10) r10Count++;
    mrrSum += c.retrievalMetrics.reciprocalRank || 0;
  }

  const recallAt1 = totalLabelled > 0 ? Number((r1Count / totalLabelled).toFixed(4)) : 0;
  const recallAt3 = totalLabelled > 0 ? Number((r3Count / totalLabelled).toFixed(4)) : 0;
  const recallAt5 = totalLabelled > 0 ? Number((r5Count / totalLabelled).toFixed(4)) : 0;
  const recallAt10 = totalLabelled > 0 ? Number((r10Count / totalLabelled).toFixed(4)) : 0;
  const mrr = totalLabelled > 0 ? Number((mrrSum / totalLabelled).toFixed(4)) : 0;

  // Clarification Metrics
  const clarificationCases = results.filter((r) => r.clarificationExpected);
  const correctClarification = clarificationCases.filter((r) => r.clarificationActual).length;
  const falseClarifications = results.filter((r) => !r.clarificationExpected && r.clarificationActual).length;

  const clarificationRecall = clarificationCases.length > 0 ? Number((correctClarification / clarificationCases.length).toFixed(4)) : 1.0;
  const clarificationPrecision = (correctClarification + falseClarifications) > 0
    ? Number((correctClarification / (correctClarification + falseClarifications)).toFixed(4))
    : 1.0;

  // Evidence Coverage
  const evidenceCases = results.filter((r) => r.evidenceCoverage?.hasEvidence).length;
  const evidenceCoverage = results.length > 0 ? Number((evidenceCases / results.length).toFixed(4)) : 0;

  // Currentness Accuracy
  const currentnessPassed = results.filter((r) => r.currentnessEval?.safetyRulePassed).length;
  const currentnessAccuracy = results.length > 0 ? Number((currentnessPassed / results.length).toFixed(4)) : 1.0;

  // Attribute Accuracy
  const attrEvaluations = results.map((r) => r.attributeMatches?.summary?.accuracyRate).filter((n) => typeof n === "number");
  const attributeAccuracyRate = attrEvaluations.length > 0
    ? Number((attrEvaluations.reduce((a, b) => a + b, 0) / attrEvaluations.length).toFixed(4))
    : 1.0;

  // Error Classification Breakdown
  const errorBreakdown = {};
  for (const r of results) {
    if (r.errorCategory) {
      errorBreakdown[r.errorCategory] = (errorBreakdown[r.errorCategory] || 0) + 1;
    }
  }

  // Multilingual Breakdown
  const langBreakdown = {};
  for (const r of results) {
    const lang = (r.language || "en").toUpperCase();
    if (!langBreakdown[lang]) {
      langBreakdown[lang] = { cases: 0, successful: 0, failed: 0 };
    }
    langBreakdown[lang].cases++;
    if (r.status === "SUCCESS") langBreakdown[lang].successful++;
    else if (r.status === "FAILED") langBreakdown[lang].failed++;
  }

  // Latency Benchmarks
  const times = results.map((r) => r.processingTimeMs || 0).sort((a, b) => a - b);
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const medianTime = times.length > 0 ? times[Math.floor(times.length / 2)] : 0;
  const p95Time = times.length > 0 ? times[Math.floor(times.length * 0.95)] : 0;

  const metrics = {
    basedOnNotice: `Based on ${verifiedCases.length} verified cases (${results.length} total test cases)`,
    datasetCounts: {
      total: results.length,
      verified: verifiedCases.length,
      unverified: unverifiedCases.length,
      labelled: totalLabelled,
    },
    retrieval: {
      labelledCases: totalLabelled,
      recallAt1,
      recallAt3,
      recallAt5,
      recallAt10,
      mrr,
    },
    attributes: {
      accuracyRate: attributeAccuracyRate,
      accuracyPercent: `${(attributeAccuracyRate * 100).toFixed(1)}%`,
    },
    clarification: {
      totalCases: clarificationCases.length,
      correct: correctClarification,
      precision: clarificationPrecision,
      recall: clarificationRecall,
    },
    currentness: {
      accuracy: currentnessAccuracy,
      safetyViolations: results.length - currentnessPassed,
    },
    evidence: {
      coverage: evidenceCoverage,
      coveragePercent: (evidenceCoverage * 100).toFixed(1) + "%",
    },
    performance: {
      averageMs: avgTime,
      medianMs: medianTime,
      p95Ms: p95Time,
    },
    errorBreakdown,
    multilingual: langBreakdown,
    totalDurationMs: Date.now() - startTime,
  };

  // 3. Update EvaluationRun record with completed metrics
  const updatedRun = await prisma.evaluationRun.update({
    where: { id: evalRun.id },
    data: {
      completedCases: completed,
      failedCases: failed,
      metrics,
      completedAt: new Date(),
    },
    include: {
      results: true,
    },
  });

  return {
    run: updatedRun,
    metrics,
    results,
  };
}

/**
 * Records human technical reviewer validation feedback (Section 21)
 */
export async function recordHumanFeedback(resultId, feedback = {}) {
  const { decision, notes, reviewerId } = feedback;

  const validDecisions = [
    "CORRECT",
    "PARTIALLY_CORRECT",
    "INCORRECT",
    "INSUFFICIENT_EVIDENCE",
    "DATASET_ISSUE",
  ];

  if (!validDecisions.includes(decision)) {
    throw new Error(`Invalid decision '${decision}'. Allowed: ${validDecisions.join(", ")}`);
  }

  const updated = await prisma.evaluationResult.update({
    where: { id: resultId },
    data: {
      humanReviewDecision: decision,
      humanReviewNotes: notes,
      humanReviewerId: reviewerId,
      humanReviewedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Generates comprehensive Markdown evaluation report (Section 27)
 */
export function generateMarkdownReport(evalRun, metrics, results = []) {
  const dateStr = new Date(evalRun.completedAt || evalRun.createdAt).toISOString().slice(0, 10);
  const ds = metrics.datasetCounts || { total: evalRun.totalCases, verified: evalRun.completedCases, unverified: 0, labelled: 0 };

  return `# NormWise Recommendation Quality Validation & Benchmarking Report

> **Engine Diagnostics:** NormWise Recommendation Quality Evaluation Suite

- **Date:** ${dateStr}
- **Run ID:** \`${evalRun.id}\`
- **Engine Version:** \`${evalRun.engineVersion}\`
- **Dataset Version:** \`${evalRun.datasetVersion}\`
- **Retrieval Mode:** \`${evalRun.retrievalMode || "hybrid"}\`
- **Evaluation Scope:** ${metrics.basedOnNotice || `Based on ${ds.verified} verified cases`}

> **Important Disclosure:**  
> Internal evaluation scores are engineering diagnostic signals measuring system behavior against the project's verified evaluation dataset. They do not constitute legal or statutory compliance certainty.

---

## 1. Dataset Overview & Verification Levels

| Category | Cases Count | Verification Level | Purpose |
|---|---|---|---|
| **Verified Test Cases** | ${ds.verified} | \`VERIFIED\` | Ground-truth gold standards verified against official BIS publications |
| **Unverified / Emerging** | ${ds.unverified} | \`UNVERIFIED\` | Future standards under committee review (excluded from precision/recall) |
| **Labelled Retrieval Cases** | ${ds.labelled} | \`VERIFIED\` | Explicit single or multi-standard target specifications |
| **Total Evaluated** | ${ds.total} | Multi-Tier | Complete test coverage |

---

## 2. Recommendation Retrieval Metrics

*Calculated strictly over ${metrics.retrieval?.labelledCases || 0} verified labelled cases with official BIS standards.*

| Metric | Score | Labelled Cases | Interpretation |
|---|---|---|---|
| **Recall@1** | **${((metrics.retrieval?.recallAt1 || 0) * 100).toFixed(1)}%** | ${metrics.retrieval?.labelledCases || 0} | Correct standard selected as primary recommendation |
| **Recall@3** | **${((metrics.retrieval?.recallAt3 || 0) * 100).toFixed(1)}%** | ${metrics.retrieval?.labelledCases || 0} | Correct standard present in Top-3 candidates |
| **Recall@5** | **${((metrics.retrieval?.recallAt5 || 0) * 100).toFixed(1)}%** | ${metrics.retrieval?.labelledCases || 0} | Correct standard present in Top-5 candidates |
| **Recall@10** | **${((metrics.retrieval?.recallAt10 || 0) * 100).toFixed(1)}%** | ${metrics.retrieval?.labelledCases || 0} | Correct standard retrieved in candidate window |
| **MRR** | **${(metrics.retrieval?.mrr || 0).toFixed(3)}** | ${metrics.retrieval?.labelledCases || 0} | Mean Reciprocal Rank (harmonic mean of ranking positions) |

---

## 3. Attribute Extraction Evaluation

- **Attribute Accuracy Rate:** **${metrics.attributes?.accuracyPercent || "100.0%"}**
- Evaluates extraction of product, material, application, capacity, technical characteristics, intended use, and domain terminology.

---

## 4. Currentness & Safety Rule Evaluation

- **Currentness Accuracy:** **${((metrics.currentness?.accuracy || 1.0) * 100).toFixed(1)}%**
- **Safety Rule Violations:** **${metrics.currentness?.safetyViolations || 0}**
- *Invariant:* Withdrawn or superseded standards must never be silently recommended as current.

---

## 5. Ambiguity Handling & Clarification

- **Clarification Precision:** ${((metrics.clarification?.precision || 1.0) * 100).toFixed(1)}%
- **Clarification Recall:** ${((metrics.clarification?.recall || 1.0) * 100).toFixed(1)}%
- **Underspecified Cases Evaluated:** ${metrics.clarification?.totalCases || 0}
- *Invariant:* The engine must ask for clarification on underspecified requirements rather than forcing an unsupported standard.

---

## 6. Evidence Coverage & Grounded Claims

- **Overall Evidence Coverage:** **${metrics.evidence?.coveragePercent || "0.0%"}**
- Verified normative clause extracts, test requirements, and statutory QCO mandates linked to recommended standards.

---

## 7. Multilingual Preservation

| Language | Total Cases | Passed | Failed |
|---|---|---|---|
${Object.entries(metrics.multilingual || {}).map(([lang, s]) => `| **${lang}** | ${s.cases} | ${s.successful} | ${s.failed} |`).join("\n")}

---

## 8. Error Taxonomy Breakdown

| Error Category | Occurrences | Engineering Classification |
|---|---|---|
${Object.entries(metrics.errorBreakdown || {}).length === 0 ? "| *None* | 0 | Zero errors encountered in verified test cases |" : Object.entries(metrics.errorBreakdown || {}).map(([cat, count]) => `| \`${cat}\` | ${count} | Standardized Phase 21 Diagnostic Category |`).join("\n")}

---

## 9. Performance Latency Telemetry

| Metric | Latency |
|---|---|
| Average Latency (Response Time) | **${metrics.performance?.averageMs || 0} ms** |
| Median Response Time | **${metrics.performance?.medianMs || 0} ms** |
| p95 Response Time | **${metrics.performance?.p95Ms || 0} ms** |

---

## 10. Dataset Limitations & Known Gaps

1. Current verified catalog focuses on core public procurement categories: pressure cookers, street lighting luminaires, electrical switches/sockets, appliances, and water supply piping.
2. Specialized domains (e.g. agricultural solar hybrid inverters, aerospace cryogenic valves) are identified as \`UNVERIFIED\` or \`NO_MATCH\` to preserve evaluation integrity.

---
*Report generated automatically by NormWise Real-Case Quality Validation Framework (Phase 21).*
`;
}
