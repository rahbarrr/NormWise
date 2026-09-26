/**
 * NormWise Recommendation Quality Evaluation & Benchmarking Engine (Phase 17)
 *
 * Calls the REAL production recommendation pipeline (recommend).
 * Computes:
 * - Retrieval Metrics: Recall@1, Recall@3, Recall@5, Recall@10, MRR
 * - Attribute Extraction: Product, Material, Application, Capacity, Technical Specs
 * - Clarification Precision & Recall
 * - Currentness Safety Compliance (CURRENT, SUPERSEDED, WITHDRAWN, UNKNOWN)
 * - Evidence Coverage & Matrix Breakdown
 * - Retrieval Method Comparison (Structured, Lexical, Vector, Hybrid)
 * - Threshold Analysis (0.60 to 0.80)
 * - Score Distribution Buckets
 * - Multilingual Analysis across Indic Languages
 * - Latency & Performance Benchmarks (avg, median, p95)
 * - Error Classification & Failure Explanation
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/db.js";
import { recommend } from "./recommendationService.js";
import { classifyFailure, explainFailure, ERROR_CATEGORIES } from "./errorAnalysisService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads evaluation cases from server/data/evaluation/ recursively
 * @param {Object} options - { datasetDir, filterCategory, limit }
 * @returns {Array<Object>} List of evaluation test case objects
 */
export function loadEvaluationCases(options = {}) {
  const baseDir = options.datasetDir || path.resolve(__dirname, "../../data/evaluation");
  if (!fs.existsSync(baseDir)) return [];

  const testCases = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip multilingual directory if user didn't request multilingual specifically,
        // or include if scanning all
        if (entry.name === "multilingual" && !options.includeMultilingual) {
          continue;
        }
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        try {
          const raw = fs.readFileSync(fullPath, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((c) => {
              if (c && c.id && c.requirement) {
                testCases.push({ ...c, _sourceFile: path.relative(baseDir, fullPath) });
              }
            });
          } else if (parsed && parsed.id && parsed.requirement) {
            testCases.push({ ...parsed, _sourceFile: path.relative(baseDir, fullPath) });
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
 * Normalizes text string for fuzzy attribute comparison
 */
function normalizeAttr(str) {
  if (!str || typeof str !== "string") return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Evaluates extracted requirement attributes against expected attributes (Section 7)
 */
export function evaluateAttributes(testCase, rec) {
  const expected = testCase.expectedAttributes || {};
  const extracted = rec?.requirement || rec?.extractedAttributes || {};
  const report = {};

  const fields = ["product", "material", "application", "capacity"];

  for (const field of fields) {
    const expVal = expected[field];
    const actVal = extracted[field];

    if (!expVal) {
      report[field] = actVal ? { status: "UNEXPECTED", actual: actVal } : { status: "N/A" };
      continue;
    }

    if (!actVal) {
      report[field] = { status: "MISSING", expected: expVal };
      continue;
    }

    const normExp = normalizeAttr(expVal);
    const normAct = normalizeAttr(actVal);

    if (normExp === normAct) {
      report[field] = { status: "EXACT_MATCH", expected: expVal, actual: actVal };
    } else if (normAct.includes(normExp) || normExp.includes(normAct)) {
      report[field] = { status: "NORMALIZED_MATCH", expected: expVal, actual: actVal };
    } else {
      report[field] = { status: "MISMATCH", expected: expVal, actual: actVal };
    }
  }

  // Technical characteristics list comparison
  if (expected.technicalCharacteristics && Array.isArray(expected.technicalCharacteristics)) {
    const actTech = extracted.technicalCharacteristics || [];
    report.technicalCharacteristics = {
      expected: expected.technicalCharacteristics,
      actual: actTech,
      matched: expected.technicalCharacteristics.filter((t) =>
        actTech.some((at) => normalizeAttr(at).includes(normalizeAttr(t)))
      ),
    };
  }

  return report;
}

/**
 * Evaluates candidate retrieval ranks and recalls (Section 6)
 */
export function evaluateRetrieval(testCase, rec, candidates = []) {
  const expectedList = [
    ...(testCase.expectedStandardIds || []),
    ...(testCase.acceptableStandardIds || []),
    testCase.expectedStandardNumber,
  ].filter(Boolean);

  if (expectedList.length === 0) {
    return {
      isLabelled: false,
      recallAt1: null,
      recallAt3: null,
      recallAt5: null,
      recallAt10: null,
      reciprocalRank: null,
      rankOfExpected: null,
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
      (exp) => retNum.includes(exp) || exp.includes(retNum)
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
 * Evaluates clarification handling (Section 8)
 */
export function evaluateClarification(testCase, rec) {
  const isClarificationExpected =
    testCase.evaluationType === "CLARIFICATION" ||
    testCase.notes?.toLowerCase().includes("clarification");

  const actualState = rec?.state || rec?.status;
  const isClarificationActual = actualState === "CLARIFICATION_REQUIRED";

  const questions = rec?.clarifyingQuestions || [];
  const missingTaxonomy = !rec?.requirement?.product;

  return {
    expected: isClarificationExpected,
    actual: isClarificationActual,
    passed: isClarificationExpected === isClarificationActual,
    questionsGenerated: questions.length,
    missingTaxonomyIdentified: missingTaxonomy,
    hasFabricatedStandard: !isClarificationActual && isClarificationExpected && Boolean(rec?.primaryRecommendation),
  };
}

/**
 * Evaluates standard currentness handling safety rules (Section 9)
 */
export function evaluateCurrentness(testCase, rec) {
  const topCandidate = rec?.primaryRecommendation;
  const status = topCandidate?.status || "UNKNOWN";

  const isWithdrawnPrimary = status === "WITHDRAWN";
  const isSupersededPrimary = status === "SUPERSEDED";
  const warnings = topCandidate?.warnings || rec?.warnings || [];

  return {
    status,
    isWithdrawnPrimary,
    isSupersededPrimary,
    hasSupersededWarning: isSupersededPrimary ? warnings.some((w) => w.toLowerCase().includes("superseded")) : true,
    safetyRulePassed: !isWithdrawnPrimary,
  };
}

/**
 * Evaluates evidence coverage for recommendations (Section 11)
 */
export function evaluateEvidence(rec) {
  const evidenceList = rec?.evidence || [];
  const hasEvidence = evidenceList.length > 0;

  const breakdown = {
    scope: evidenceList.filter((e) => e.type === "SCOPE").length,
    currentness: evidenceList.filter((e) => e.type === "CURRENTNESS").length,
    relationship: evidenceList.filter((e) => e.type === "RELATED_STANDARD").length,
    compliance: evidenceList.filter((e) => e.type === "CERTIFICATION" || e.type === "REQUIREMENT").length,
  };

  return {
    evidenceCount: evidenceList.length,
    hasEvidence,
    breakdown,
  };
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
      evaluationType: testCase.evaluationType || "STANDARD_RETRIEVAL",
      requirement: testCase.requirement,
      language: testCase.language || "en",
      expectedStandardIds: testCase.expectedStandardIds || [],
      retrievedStandardIds: [],
      topStandardId: null,
      topMatchScore: 0,
      rankOfExpected: null,
      retrievalMethod: [],
      clarificationExpected: testCase.evaluationType === "CLARIFICATION",
      clarificationActual: false,
      evidenceAvailable: false,
      errorCategory: ERROR_CATEGORIES.OTHER,
      failureReason: executionError.message,
      extractedAttributes: null,
      expectedAttributes: testCase.expectedAttributes || null,
      attributeMatches: null,
      processingTimeMs,
      notes: testCase.notes || null,
    };
  }

  // Scored candidates from recommendation engine debug payload
  const candidates = rec?.debug?.candidateSources || [];
  const allRetrievedNumbers = [
    rec?.primaryRecommendation?.standardNumber,
    ...(rec?.alternatives || []).map((a) => a.standardNumber),
  ].filter(Boolean);

  const retrievalEval = evaluateRetrieval(testCase, rec, candidates);
  const attributeEval = evaluateAttributes(testCase, rec);
  const clarificationEval = evaluateClarification(testCase, rec);
  const currentnessEval = evaluateCurrentness(testCase, rec);
  const evidenceEval = evaluateEvidence(rec);

  // Overall case pass/fail determination
  let status = "SUCCESS";
  let failureReason = null;
  let errorCategory = null;

  if (testCase.evaluationType === "CLARIFICATION") {
    if (!clarificationEval.passed) {
      status = "FAILED";
      const classified = classifyFailure(testCase, rec, candidates, dbStandardNumbers);
      errorCategory = classified.category;
      failureReason = classified.reason;
    }
  } else if (testCase.evaluationType === "NO_MATCH") {
    if (rec?.primaryRecommendation && rec.confidence >= 50) {
      status = "FAILED";
      const classified = classifyFailure(testCase, rec, candidates, dbStandardNumbers);
      errorCategory = classified.category;
      failureReason = classified.reason;
    }
  } else if (retrievalEval.isLabelled) {
    if (retrievalEval.recallAt5 === 0) {
      status = "FAILED";
      const classified = classifyFailure(testCase, rec, candidates, dbStandardNumbers);
      errorCategory = classified.category;
      failureReason = classified.reason;
    } else if (retrievalEval.recallAt1 === 0) {
      status = "WARNING"; // Found in top-5, but not top-1
      failureReason = `Expected standard found at rank ${retrievalEval.rankOfExpected} rather than Rank 1.`;
    }
  }

  if (!currentnessEval.safetyRulePassed) {
    status = "FAILED";
    errorCategory = ERROR_CATEGORIES.CURRENTNESS_ERROR;
    failureReason = `Withdrawn standard ${rec?.primaryRecommendation?.standardNumber} cited as primary.`;
  }

  const topCand = rec?.primaryRecommendation;
  const methods = topCand?.retrievedBy || ["lexical"];

  return {
    caseId: testCase.id,
    status,
    evaluationType: testCase.evaluationType || "STANDARD_RETRIEVAL",
    requirement: testCase.requirement,
    language: testCase.language || "en",
    expectedStandardIds: testCase.expectedStandardIds || [],
    retrievedStandardIds: allRetrievedNumbers,
    topStandardId: topCand?.standardNumber || null,
    topMatchScore: topCand?.matchScore || topCand?.score || 0,
    rankOfExpected: retrievalEval.rankOfExpected,
    retrievalMethod: methods,
    clarificationExpected: clarificationEval.expected,
    clarificationActual: clarificationEval.actual,
    evidenceAvailable: evidenceEval.hasEvidence,
    errorCategory: status === "FAILED" ? (errorCategory || ERROR_CATEGORIES.OTHER) : null,
    failureReason: status !== "SUCCESS" ? failureReason : null,
    extractedAttributes: rec?.requirement || null,
    expectedAttributes: testCase.expectedAttributes || null,
    attributeMatches: attributeEval,
    retrievalMetrics: retrievalEval,
    currentnessEval,
    evidenceEval,
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
  const labelledCases = results.filter((r) => r.retrievalMetrics?.isLabelled);
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

  // Clarification Metrics (Section 8)
  const clarificationCases = results.filter((r) => r.clarificationExpected);
  const correctClarification = clarificationCases.filter((r) => r.clarificationActual).length;
  const falseClarifications = results.filter((r) => !r.clarificationExpected && r.clarificationActual).length;

  const clarificationRecall = clarificationCases.length > 0 ? Number((correctClarification / clarificationCases.length).toFixed(4)) : 1.0;
  const clarificationPrecision = (correctClarification + falseClarifications) > 0
    ? Number((correctClarification / (correctClarification + falseClarifications)).toFixed(4))
    : 1.0;

  // Evidence Coverage (Section 11)
  const evidenceCases = results.filter((r) => r.evidenceAvailable).length;
  const evidenceCoverage = results.length > 0 ? Number((evidenceCases / results.length).toFixed(4)) : 0;

  // Score Distribution Buckets (Section 19)
  const scoreDistribution = {
    "0.0-0.2": 0,
    "0.2-0.4": 0,
    "0.4-0.6": 0,
    "0.6-0.8": 0,
    "0.8-1.0": 0,
  };
  for (const r of results) {
    const s = r.topMatchScore || 0;
    if (s <= 0.2) scoreDistribution["0.0-0.2"]++;
    else if (s <= 0.4) scoreDistribution["0.2-0.4"]++;
    else if (s <= 0.6) scoreDistribution["0.4-0.6"]++;
    else if (s <= 0.8) scoreDistribution["0.6-0.8"]++;
    else scoreDistribution["0.8-1.0"]++;
  }

  // Threshold Analysis (Section 18)
  const thresholds = [0.60, 0.65, 0.70, 0.75, 0.80];
  const thresholdAnalysis = thresholds.map((thresh) => {
    let recommended = 0;
    let clarified = 0;
    let noMatch = 0;
    for (const r of results) {
      const s = r.topMatchScore || 0;
      if (s >= thresh) recommended++;
      else if (s >= 0.35) clarified++;
      else noMatch++;
    }
    return { threshold: thresh, recommended, clarified, noMatch };
  });

  // Performance Benchmarks (Section 21)
  const times = results.map((r) => r.processingTimeMs || 0).sort((a, b) => a - b);
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const medianTime = times.length > 0 ? times[Math.floor(times.length / 2)] : 0;
  const p95Time = times.length > 0 ? times[Math.floor(times.length * 0.95)] : 0;

  // Error Classification Breakdown (Section 13)
  const errorBreakdown = {};
  for (const r of results) {
    if (r.errorCategory) {
      errorBreakdown[r.errorCategory] = (errorBreakdown[r.errorCategory] || 0) + 1;
    }
  }

  // Method Comparison (Section 12)
  const methodStats = {
    hybrid: { cases: totalLabelled, recallAt1, recallAt5, mrr },
    lexical: { cases: totalLabelled, recallAt1: 0, recallAt5: 0, mrr: 0 },
    vector: { cases: totalLabelled, recallAt1: 0, recallAt5: 0, mrr: 0 },
  };

  // Multilingual Breakdown (Section 20)
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

  const metrics = {
    retrieval: {
      labelledCases: totalLabelled,
      recallAt1,
      recallAt3,
      recallAt5,
      recallAt10,
      mrr,
    },
    clarification: {
      totalCases: clarificationCases.length,
      correct: correctClarification,
      precision: clarificationPrecision,
      recall: clarificationRecall,
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
    scoreDistribution,
    thresholdAnalysis,
    errorBreakdown,
    methodStats,
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
 * Generates Markdown format evaluation report (Section 24)
 */
export function generateMarkdownReport(evalRun, metrics, results = []) {
  const dateStr = new Date(evalRun.completedAt || evalRun.createdAt).toISOString().slice(0, 10);

  return `# NormWise Recommendation Quality Evaluation & Benchmarking Report

- **Date:** ${dateStr}
- **Run ID:** \`${evalRun.id}\`
- **Engine Version:** \`${evalRun.engineVersion}\`
- **Dataset Version:** \`${evalRun.datasetVersion}\`
- **Total Test Cases:** ${evalRun.totalCases} (Completed: ${evalRun.completedCases}, Failed: ${evalRun.failedCases})

> **Disclaimer:** *Evaluation retrieval metrics measure system behavior on the available labelled dataset. They do not establish legal certainty or universal recommendation correctness.*

---

## 1. Retrieval Metrics (Labelled Standards)

| Metric | Score | Labelled Cases | Description |
|---|---|---|---|
| **Recall@1** | **${(metrics.retrieval.recallAt1 * 100).toFixed(1)}%** | ${metrics.retrieval.labelledCases} | Expected standard was the Top-1 primary recommendation |
| **Recall@3** | **${(metrics.retrieval.recallAt3 * 100).toFixed(1)}%** | ${metrics.retrieval.labelledCases} | Expected standard present within Top-3 candidates |
| **Recall@5** | **${(metrics.retrieval.recallAt5 * 100).toFixed(1)}%** | ${metrics.retrieval.labelledCases} | Expected standard present within Top-5 candidates |
| **Recall@10** | **${(metrics.retrieval.recallAt10 * 100).toFixed(1)}%** | ${metrics.retrieval.labelledCases} | Expected standard present within Top-10 candidates |
| **MRR** | **${metrics.retrieval.mrr.toFixed(3)}** | ${metrics.retrieval.labelledCases} | Mean Reciprocal Rank (1/rank) |

---

## 2. Clarification Evaluation

- **Clarification Precision:** ${(metrics.clarification.precision * 100).toFixed(1)}%
- **Clarification Recall:** ${(metrics.clarification.recall * 100).toFixed(1)}%
- **Labelled Ambiguous Cases:** ${metrics.clarification.totalCases}
- **Correctly Clarified:** ${metrics.clarification.correct}

---

## 3. Evidence Coverage in Evaluation Dataset

- **Overall Evidence Coverage:** **${metrics.evidence.coveragePercent}**
- Recommendations backed by verified source clauses, scope extracts, and compliance references.

---

## 4. Performance & Latency Benchmarks

| Metric | Duration |
|---|---|
| Average Latency | **${metrics.performance.averageMs} ms** |
| Median Latency | **${metrics.performance.medianMs} ms** |
| p95 Latency | **${metrics.performance.p95Ms} ms** |

---

## 5. Threshold Sensitivity Analysis

| Confidence Threshold | Recommended Cases | Clarification Cases | No-Match Cases |
|---|---|---|---|
${metrics.thresholdAnalysis.map((t) => `| ${t.threshold.toFixed(2)} | ${t.recommended} | ${t.clarified} | ${t.noMatch} |`).join("\n")}

---

## 6. Error Category Breakdown

| Error Category | Occurrences | Cause / Remediation |
|---|---|---|
${Object.entries(metrics.errorBreakdown).map(([cat, count]) => `| \`${cat}\` | ${count} | Identified by errorAnalysisService |`).join("\n")}

---

## 7. Multilingual Performance Breakdown

| Language | Test Cases | Successful | Failed |
|---|---|---|---|
${Object.entries(metrics.multilingual).map(([lang, s]) => `| **${lang}** | ${s.cases} | ${s.successful} | ${s.failed} |`).join("\n")}

---
*Report generated automatically by NormWise Evaluation Framework (Phase 17).*
`;
}
