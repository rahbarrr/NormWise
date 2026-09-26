/**
 * Phase 17 Test Suite: Recommendation Quality Evaluation & Benchmarking
 * Strictly implements all 18 test specifications outlined in Section 32 of Phase 17.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import {
  loadEvaluationCases,
  evaluateCase,
  evaluateRetrieval,
  evaluateAttributes,
  evaluateClarification,
  evaluateCurrentness,
  evaluateEvidence,
  runEvaluation,
  generateMarkdownReport,
} from "../src/services/evaluationService.js";
import {
  classifyFailure,
  explainFailure,
  ERROR_CATEGORIES,
} from "../src/services/errorAnalysisService.js";
import {
  generateDeterministicMockEmbedding,
  isEmbeddingConfigured,
} from "../src/services/embeddingService.js";
import { recommend } from "../src/services/recommendationService.js";

describe("Phase 17 Recommendation Quality Evaluation & Benchmarking", () => {
  // 1. Evaluation case loading
  it("1. should load structured evaluation cases from categories and validate required schema", () => {
    const cases = loadEvaluationCases();
    assert.ok(cases.length >= 20, "Should load at least 20 evaluation cases");
    const sample = cases[0];
    assert.ok(sample.id);
    assert.ok(sample.requirement);
    assert.ok(sample._sourceFile);
  });

  // 2. Evaluation run creation
  it("2. should create and persist an EvaluationRun with start and end timestamps in database", async () => {
    const sampleCases = loadEvaluationCases().slice(0, 2);
    const { run } = await runEvaluation({
      name: "Automated Test Run",
      cases: sampleCases,
    });

    assert.ok(run.id);
    assert.equal(run.totalCases, 2);
    assert.ok(run.startedAt);
    assert.ok(run.completedAt);

    const dbRun = await prisma.evaluationRun.findUnique({
      where: { id: run.id },
      include: { results: true },
    });
    assert.ok(dbRun);
    assert.equal(dbRun.results.length, 2);
  });

  // 3. Retrieval evaluation
  it("3. should accurately evaluate candidate retrieval rank and presence of expected standards", () => {
    const testCase = {
      id: "eval-test-01",
      expectedStandardIds: ["IS 2347:2023"],
    };
    const mockRec = {
      primaryRecommendation: { standardNumber: "IS 2347:2023" },
      alternatives: [{ standardNumber: "IS 7466:1994" }],
    };

    const res = evaluateRetrieval(testCase, mockRec, []);
    assert.equal(res.isLabelled, true);
    assert.equal(res.rankOfExpected, 1);
    assert.equal(res.recallAt1, 1);
    assert.equal(res.recallAt3, 1);
  });

  // 4. Recall@K
  it("4. should compute Recall@1, Recall@3, Recall@5, and Recall@10 correctly for candidate ranks", () => {
    const testCase = {
      expectedStandardIds: ["IS 10322"],
    };
    // Expected at rank 4
    const mockRecRank4 = {
      primaryRecommendation: { standardNumber: "IS 374:2019" },
      alternatives: [
        { standardNumber: "IS 3854:1997" },
        { standardNumber: "IS 1293:2019" },
        { standardNumber: "IS 10322 (Part 5/Sec 3):2012" },
      ],
    };

    const res = evaluateRetrieval(testCase, mockRecRank4, []);
    assert.equal(res.rankOfExpected, 4);
    assert.equal(res.recallAt1, 0);
    assert.equal(res.recallAt3, 0);
    assert.equal(res.recallAt5, 1);
    assert.equal(res.recallAt10, 1);
  });

  // 5. MRR (Mean Reciprocal Rank)
  it("5. should calculate Reciprocal Rank correctly (1/rank) for labelled standards", () => {
    const testCase = { expectedStandardIds: ["IS 2347"] };
    const mockRecRank2 = {
      primaryRecommendation: { standardNumber: "IS 6911:2017" },
      alternatives: [{ standardNumber: "IS 2347:2023" }],
    };

    const res = evaluateRetrieval(testCase, mockRecRank2, []);
    assert.equal(res.rankOfExpected, 2);
    assert.equal(res.reciprocalRank, 0.5);
  });

  // 6. Attribute evaluation
  it("6. should compare expected vs extracted attributes and identify EXACT_MATCH, NORMALIZED_MATCH, or MISSING", () => {
    const testCase = {
      expectedAttributes: {
        product: "pressure cooker",
        material: "stainless steel",
        application: "kitchen",
        capacity: "5 L",
      },
    };
    const mockRec = {
      requirement: {
        product: "Pressure Cooker",
        material: "Stainless Steel 304",
        application: "Institutional Kitchen",
        capacity: "5 Litre",
      },
    };

    const res = evaluateAttributes(testCase, mockRec);
    assert.equal(res.product.status, "EXACT_MATCH");
    assert.equal(res.material.status, "NORMALIZED_MATCH");
    assert.equal(res.application.status, "NORMALIZED_MATCH");
    assert.equal(res.capacity.status, "NORMALIZED_MATCH");
  });

  // 7. Clarification evaluation
  it("7. should verify CLARIFICATION_REQUIRED is returned when requirement is underspecified without fabricating standards", () => {
    const clarificationCase = {
      id: "clarif-01",
      evaluationType: "CLARIFICATION",
      notes: "Underspecified requirement needing clarification",
    };
    const mockRec = {
      state: "CLARIFICATION_REQUIRED",
      clarifyingQuestions: ["What is the intended power rating?"],
      requirement: { product: null },
    };

    const evalRes = evaluateClarification(clarificationCase, mockRec);
    assert.equal(evalRes.passed, true);
    assert.equal(evalRes.questionsGenerated, 1);
    assert.equal(evalRes.missingTaxonomyIdentified, true);
    assert.equal(evalRes.hasFabricatedStandard, false);
  });

  // 8. Currentness evaluation
  it("8. should enforce safety rules: forbid WITHDRAWN standards from primary citation and flag SUPERSEDED", () => {
    const withdrawnRec = {
      primaryRecommendation: { standardNumber: "IS 1239 (Part 2):1992", status: "WITHDRAWN" },
    };
    const withdrawnEval = evaluateCurrentness({}, withdrawnRec);
    assert.equal(withdrawnEval.isWithdrawnPrimary, true);
    assert.equal(withdrawnEval.safetyRulePassed, false);

    const supersededRec = {
      primaryRecommendation: {
        standardNumber: "IS 2347:2014",
        status: "SUPERSEDED",
        warnings: ["Standard is superseded by IS 2347:2023"],
      },
    };
    const supersededEval = evaluateCurrentness({}, supersededRec);
    assert.equal(supersededEval.isSupersededPrimary, true);
    assert.equal(supersededEval.hasSupersededWarning, true);
  });

  // 9. Evidence coverage
  it("9. should measure evidence coverage across scope, currentness, and compliance references", () => {
    const mockRec = {
      evidence: [
        { type: "SCOPE", content: "Scope clause extract" },
        { type: "CURRENTNESS", content: "Active BIS standard gazette" },
        { type: "CERTIFICATION", content: "Mandatory QCO order" },
      ],
    };

    const evEval = evaluateEvidence(mockRec);
    assert.equal(evEval.hasEvidence, true);
    assert.equal(evEval.evidenceCount, 3);
    assert.equal(evEval.breakdown.scope, 1);
    assert.equal(evEval.breakdown.currentness, 1);
    assert.equal(evEval.breakdown.compliance, 1);
  });

  // 10. Error classification
  it("10. should classify errors into structured categories (AMBIGUOUS_REQUIREMENT, WRONG_PRODUCT, etc.)", () => {
    const ambiguousCase = { evaluationType: "CLARIFICATION", expectedStandardIds: [] };
    const forcedRec = { state: "RECOMMENDED", primaryRecommendation: { standardNumber: "IS 302" } };

    const classification = classifyFailure(ambiguousCase, forcedRec, [], new Set(["IS 302"]));
    assert.equal(classification.category, ERROR_CATEGORIES.AMBIGUOUS_REQUIREMENT);

    const explanation = explainFailure(ambiguousCase, forcedRec, classification);
    assert.ok(explanation.whyItFailed);
    assert.ok(explanation.retrievalMethods);
  });

  // 11. Dataset gap detection
  it("11. should detect DATASET_GAP when expected standard is genuinely absent from standards database", () => {
    const missingCase = {
      expectedStandardIds: ["IS 99999:2024"],
    };
    const mockRec = {
      primaryRecommendation: { standardNumber: "IS 2347:2023" },
    };
    const dbStandards = new Set(["IS 2347:2023", "IS 10322", "IS 374:2019"]);

    const classification = classifyFailure(missingCase, mockRec, [], dbStandards);
    assert.equal(classification.category, ERROR_CATEGORIES.DATASET_GAP);
    assert.ok(classification.reason.includes("not present in the current standards catalog"));
  });

  // 12. Multilingual evaluation
  it("12. should evaluate Indian-language test case preserving original text and retrieving expected standard", async () => {
    const hindiCase = {
      id: "eval-hi-01",
      requirement: "स्टेनलेस स्टील का 5 litre प्रेशर कुकर घरेलू उपयोग के लिए IS 2347:2023",
      language: "hi",
      evaluationType: "MULTILINGUAL",
      expectedStandardIds: ["IS 2347:2023"],
    };
    const standards = await prisma.standard.findMany({ select: { standardNumber: true } });
    const dbStandards = new Set(standards.map((s) => s.standardNumber));

    const result = await evaluateCase(hindiCase, dbStandards);
    assert.equal(result.status, "SUCCESS");
    assert.equal(result.language, "hi");
    assert.equal(result.topStandardId, "IS 2347:2023");
    assert.equal(result.rankOfExpected, 1);
  });

  // 13. Performance measurement
  it("13. should benchmark latency in milliseconds (processingTimeMs) for evaluation cases", async () => {
    const testCase = {
      id: "perf-01",
      requirement: "Supply of 5 litre stainless steel pressure cooker conforming to IS 2347",
      expectedStandardIds: ["IS 2347:2023"],
    };
    const result = await evaluateCase(testCase, new Set(["IS 2347:2023"]));
    assert.ok(typeof result.processingTimeMs === "number");
    assert.ok(result.processingTimeMs > 0);
  });

  // 14. Evaluation report generation
  it("14. should generate comprehensive human-readable Markdown evaluation report", () => {
    const mockRun = {
      id: "run-mock-123",
      engineVersion: "hybrid-v1",
      datasetVersion: "2026.09",
      totalCases: 20,
      completedCases: 20,
      failedCases: 0,
      createdAt: new Date(),
    };
    const mockMetrics = {
      retrieval: { recallAt1: 0.85, recallAt3: 0.95, recallAt5: 1.0, recallAt10: 1.0, mrr: 0.91, labelledCases: 15 },
      clarification: { precision: 1.0, recall: 1.0, totalCases: 3, correct: 3 },
      evidence: { coverage: 0.9, coveragePercent: "90.0%" },
      performance: { averageMs: 45, medianMs: 38, p95Ms: 110 },
      thresholdAnalysis: [{ threshold: 0.70, recommended: 15, clarified: 3, noMatch: 2 }],
      errorBreakdown: {},
      multilingual: { HI: { cases: 3, successful: 3, failed: 0 } },
    };

    const report = generateMarkdownReport(mockRun, mockMetrics);
    assert.ok(report.includes("NormWise Recommendation Quality Evaluation"));
    assert.ok(report.includes("Recall@1"));
    assert.ok(report.includes("85.0%"));
    assert.ok(report.includes("Average Latency"));
  });

  // 15. Regression cases
  it("15. should load and execute regression test cases from server/data/evaluation/regression/", async () => {
    const cases = loadEvaluationCases();
    const regressionCases = cases.filter((c) => c._sourceFile?.includes("regression"));
    assert.ok(regressionCases.length >= 3, "Should have at least 3 regression cases");

    const sample = regressionCases[0];
    assert.ok(sample.id);
    assert.ok(sample.requirement);
  });

  // 16. Mock embeddings
  it("16. should provide deterministic 1536-dimensional mock embeddings without external network access", () => {
    const text = "Stainless steel pressure cooker 5 L";
    const vec1 = generateDeterministicMockEmbedding(text);
    const vec2 = generateDeterministicMockEmbedding(text);

    assert.equal(vec1.length, 1536);
    assert.equal(vec2.length, 1536);
    assert.deepEqual(vec1, vec2, "Identical text must produce identical deterministic mock vectors");

    // Vector magnitude should be approximately 1.0 (unit vector)
    const norm = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    assert.ok(Math.abs(norm - 1.0) < 0.05, `Vector norm ${norm} should be approximately 1.0`);
  });

  // 17. Existing recommendation engine
  it("17. should preserve all hybrid recommendation functionality through the production recommend function", async () => {
    const req = "Stainless steel pressure cooker, 5 litre, for institutional kitchen use.";
    const rec = await recommend(req);

    assert.ok(rec.primaryRecommendation);
    assert.equal(rec.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.ok(rec.matchScore >= 0.7);
    assert.ok(rec.datasetProvenance);
  });

  // 18. Existing Phases 1–16
  it("18. should preserve all multilingual detection, token protection, and compliance rules", async () => {
    const hindiInput = "5 litre स्टेनलेस स्टील प्रेशर कुकर IS 2347:2023";
    const rec = await recommend(hindiInput);

    assert.equal(rec.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.equal(rec.detectedLanguage, "HI");
    assert.equal(rec.originalText, hindiInput);
  });
});
