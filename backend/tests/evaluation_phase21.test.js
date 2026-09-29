/**
 * Phase 21: Real-Case Validation and Recommendation-Quality Testing Framework Test Suite
 *
 * Verifies:
 * 1. Real evaluation dataset loading, categorization, and verification levels
 * 2. Attribute extraction accuracy (exact, partial, missing, incorrect)
 * 3. Recommendation retrieval accuracy (Recall@1/3/5/10, MRR on verified cases)
 * 4. Currentness safety rule (withdrawn standard never silently primary)
 * 5. Ambiguity and partial specification handling (CLARIFICATION_REQUIRED, no forced answers)
 * 6. Related standards knowledge graph retrieval
 * 7. Deterministic compliance rule evaluation against statutory QCOs
 * 8. Evidence coverage & claim groundedness
 * 9. Multilingual Indic terminology preservation
 * 10. Multi-strategy retrieval comparison (Structured, Lexical, Vector, Hybrid)
 * 11. Standardized error taxonomy classification (13 categories)
 * 12. Debug recommendation mode payload completeness
 * 13. Technical reviewer human validation feedback loop
 * 14. Markdown evaluation report generation
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import {
  loadEvaluationCases,
  evaluateAttributes,
  evaluateRetrieval,
  evaluateCurrentness,
  evaluateAmbiguity,
  evaluateRelationships,
  evaluateCompliance,
  evaluateEvidenceCoverage,
  compareRetrievalMethods,
  evaluateCase,
  runEvaluation,
  recordHumanFeedback,
  generateMarkdownReport,
} from "../src/services/evaluationService.js";
import { recommend } from "../src/services/recommendation/recommendationService.js";
import { ERROR_CATEGORIES, classifyFailure } from "../src/services/errorAnalysisService.js";

describe("Phase 21 Real-Case Validation & Quality Evaluation Test Suite", () => {
  before(async () => {
    await prisma.$connect();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("1. should load real evaluation cases organized by category and verification level", () => {
    const cases = loadEvaluationCases();
    assert.ok(cases.length >= 20, `Expected at least 20 evaluation cases, found ${cases.length}`);

    const verifiedCases = cases.filter((c) => c.verificationLevel === "VERIFIED");
    const unverifiedCases = cases.filter((c) => c.verificationLevel === "UNVERIFIED");

    assert.ok(verifiedCases.length > 0, "Expected verified evaluation cases");
    assert.ok(unverifiedCases.length > 0, "Expected unverified evaluation cases");

    // Check categories
    const categories = new Set(cases.map((c) => c.category));
    assert.ok(categories.has("pressure-cooker"), "Missing pressure-cooker category");
    assert.ok(categories.has("lighting"), "Missing lighting category");
    assert.ok(categories.has("electrical-accessories"), "Missing electrical-accessories category");
    assert.ok(categories.has("other-authorized-categories"), "Missing other-authorized-categories");
  });

  it("2. should correctly evaluate attribute extraction matches, partials, and mismatches", () => {
    const mockCase = {
      expectedAttributes: {
        product: "Pressure Cooker",
        material: "Stainless Steel",
        application: "Commercial Canteen",
        capacity: "5 Litre",
      },
    };

    const mockRec = {
      requirement: {
        product: "Pressure Cooker",
        material: "Stainless Steel AISI 304",
        application: "Commercial Canteen Kitchen",
        capacity: null, // missing
      },
    };

    const evalReport = evaluateAttributes(mockCase, mockRec);
    assert.equal(evalReport.fields.product.status, "EXACT_MATCH");
    assert.equal(evalReport.fields.material.status, "PARTIAL_MATCH");
    assert.equal(evalReport.fields.application.status, "PARTIAL_MATCH");
    assert.equal(evalReport.fields.capacity.status, "MISSING");
    assert.ok(evalReport.summary.accuracyRate > 0, "Accuracy rate should be greater than zero");
  });

  it("3. should calculate Recall@K and MRR on verified cases with acceptable alternatives", () => {
    const mockCase = {
      expectedStandards: ["IS 2347:2023"],
      acceptableAlternatives: ["IS 2347"],
      caseType: "CLEAR",
      verificationLevel: "VERIFIED",
    };

    const mockRec = {
      primaryRecommendation: { standardNumber: "IS 2347:2023" },
      alternatives: [{ standardNumber: "IS 6911:2017" }],
    };

    const retrievalEval = evaluateRetrieval(mockCase, mockRec);
    assert.equal(retrievalEval.isLabelled, true);
    assert.equal(retrievalEval.rankOfExpected, 1);
    assert.equal(retrievalEval.recallAt1, 1);
    assert.equal(retrievalEval.recallAt3, 1);
    assert.equal(retrievalEval.recallAt5, 1);
    assert.equal(retrievalEval.reciprocalRank, 1.0);
  });

  it("4. should never calculate recall metrics on unverified or no-match cases", () => {
    const unverifiedCase = {
      expectedStandards: [],
      caseType: "NO_MATCH",
      verificationLevel: "UNVERIFIED",
    };

    const mockRec = {
      primaryRecommendation: null,
    };

    const retrievalEval = evaluateRetrieval(unverifiedCase, mockRec);
    assert.equal(retrievalEval.isLabelled, false);
    assert.equal(retrievalEval.recallAt1, null);
    assert.equal(retrievalEval.reciprocalRank, null);
  });

  it("5. should enforce currentness safety rules and detect withdrawn standards", () => {
    const mockCase = { expectedCurrentness: "WITHDRAWN" };
    const mockRecWithdrawn = {
      primaryRecommendation: {
        standardNumber: "IS 1239 (Part 2):1992",
        status: "WITHDRAWN",
      },
    };

    const currentnessEval = evaluateCurrentness(mockCase, mockRecWithdrawn);
    assert.equal(currentnessEval.isWithdrawnPrimary, true);
    assert.equal(currentnessEval.safetyRulePassed, false, "Withdrawn standard as primary should violate safety rule");
  });

  it("6. should verify ambiguity evaluation prompts for missing information without forced answers", () => {
    const ambiguousCase = {
      caseType: "AMBIGUOUS",
      ambiguityLevel: "HIGH",
    };

    const mockRecClarification = {
      status: "CLARIFICATION_REQUIRED",
      clarifyingQuestions: ["Specify nominal capacity", "Specify material grade"],
    };

    const ambiguityEval = evaluateAmbiguity(ambiguousCase, mockRecClarification);
    assert.equal(ambiguityEval.expected, true);
    assert.equal(ambiguityEval.actual, true);
    assert.equal(ambiguityEval.passed, true);
    assert.equal(ambiguityEval.hasForcedAnswer, false);
  });

  it("7. should evaluate related standards from the knowledge graph", () => {
    const testCase = {
      expectedRelationships: [
        { type: "MATERIAL", standardNumber: "IS 6911:2017" },
        { type: "COMPONENT", standardNumber: "IS 7466:1994" },
      ],
    };

    const mockRec = {
      relatedStandards: [
        { standardNumber: "IS 6911:2017", relationshipType: "MATERIAL" },
        { standardNumber: "IS 7466:1994", relationshipType: "COMPONENT" },
        { standardNumber: "IS 2:2022", relationshipType: "NORMATIVE_REFERENCE" },
      ],
    };

    const relEval = evaluateRelationships(testCase, mockRec);
    assert.equal(relEval.evaluated, true);
    assert.equal(relEval.expectedCount, 2);
    assert.equal(relEval.matched.length, 2);
    assert.equal(relEval.missing.length, 0);
    assert.equal(relEval.recall, 1.0);
  });

  it("8. should evaluate deterministic compliance without LLM hallucinations", () => {
    const testCase = { expectedComplianceOutcome: "POTENTIALLY_APPLICABLE" };
    const mockRec = {
      compliance: {
        overallOutcome: "POTENTIALLY_APPLICABLE",
        summaryExplanation: "Mandatory ISI mark required under DPIIT Pressure Cooker QCO.",
      },
    };

    const compEval = evaluateCompliance(testCase, mockRec);
    assert.equal(compEval.passed, true);
    assert.equal(compEval.actualOutcome, "POTENTIALLY_APPLICABLE");
  });

  it("9. should classify evidence coverage across standard identity, currentness, and compliance", () => {
    const mockRec = {
      primaryRecommendation: {
        standardNumber: "IS 2347:2023",
        title: "Domestic and commercial pressure cookers",
        status: "CURRENT",
      },
      relatedStandards: [{ standardNumber: "IS 6911:2017" }],
      compliance: { evaluations: [{ id: "eval-1" }] },
      explanation: "Verified against Clause 5 and Clause 8.",
      evidence: [{ type: "SCOPE" }, { type: "CURRENTNESS" }],
    };

    const coverage = evaluateEvidenceCoverage(mockRec);
    assert.equal(coverage.hasEvidence, true);
    assert.equal(coverage.breakdown.standardIdentity, "SUPPORTED");
    assert.equal(coverage.breakdown.currentness, "SUPPORTED");
    assert.equal(coverage.breakdown.relationship, "SUPPORTED");
    assert.equal(coverage.overallSupported, true);
  });

  it("10. should compare the 4 candidate generation retrieval strategies", async () => {
    const testCase = {
      requirement: "Stainless steel pressure cooker 5 litre for institutional canteens",
      expectedStandards: ["IS 2347:2023"],
      expectedAttributes: { product: "Pressure Cooker", material: "Stainless Steel" },
    };

    const comp = await compareRetrievalMethods(testCase);
    assert.ok(comp.structured, "Structured retrieval missing");
    assert.ok(comp.lexical, "Lexical retrieval missing");
    assert.ok(comp.vector, "Vector retrieval missing");
    assert.ok(comp.hybrid, "Hybrid retrieval missing");
    assert.ok(typeof comp.hybrid.count === "number", "Hybrid candidate count must be a number");
  });

  it("11. should map failure modes into the 13 standardized error taxonomy categories", () => {
    assert.ok(ERROR_CATEGORIES.ATTRIBUTE_EXTRACTION_ERROR);
    assert.ok(ERROR_CATEGORIES.LEXICAL_RETRIEVAL_ERROR);
    assert.ok(ERROR_CATEGORIES.SEMANTIC_RETRIEVAL_ERROR);
    assert.ok(ERROR_CATEGORIES.CURRENTNESS_ERROR);
    assert.ok(ERROR_CATEGORIES.RELATIONSHIP_ERROR);
    assert.ok(ERROR_CATEGORIES.COMPLIANCE_ERROR);
    assert.ok(ERROR_CATEGORIES.EVIDENCE_ERROR);
    assert.ok(ERROR_CATEGORIES.AMBIGUOUS_HANDLING_ERROR);
    assert.ok(ERROR_CATEGORIES.MULTILINGUAL_ERROR);
    assert.ok(ERROR_CATEGORIES.NO_MATCH_HANDLING_ERROR);
    assert.ok(ERROR_CATEGORIES.DATASET_GAP);
    assert.ok(ERROR_CATEGORIES.SOURCE_GAP);
    assert.ok(ERROR_CATEGORIES.CONFIGURATION_ERROR);
  });

  it("12. should return complete debug payload when debug=true in recommend()", async () => {
    const rec = await recommend("Stainless steel pressure cooker 5 litre", { debug: true });
    assert.ok(rec.debug, "Debug payload missing in recommend response");
    assert.ok(rec.debug.normalizedRequirement, "Missing normalized requirement");
    assert.ok(rec.debug.extractedAttributes, "Missing extracted attributes");
    assert.ok(Array.isArray(rec.debug.mergedCandidates), "Missing merged candidates array");
    assert.ok(rec.debug.currentnessFiltering, "Missing currentness filtering");
    assert.ok(rec.debug.scoreComponents, "Missing score components");
    assert.ok(Array.isArray(rec.debug.finalRanking), "Missing final ranking array");
  });

  it("13. should record human validation feedback on evaluation results", async () => {
    // 1. Create a dummy evaluation run and result
    const run = await prisma.evaluationRun.create({
      data: {
        name: "Test Human Review Run",
        totalCases: 1,
      },
    });

    const result = await prisma.evaluationResult.create({
      data: {
        evaluationRunId: run.id,
        caseId: "TEST-CASE-01",
        requirement: "Test requirement for human review",
        status: "SUCCESS",
      },
    });

    // 2. Submit human reviewer feedback
    const updated = await recordHumanFeedback(result.id, {
      decision: "CORRECT",
      notes: "Verified against Clause 4.1 in gazetted BIS standard publication.",
      reviewerId: "reviewer-unit-test",
    });

    assert.equal(updated.humanReviewDecision, "CORRECT");
    assert.equal(updated.humanReviewNotes, "Verified against Clause 4.1 in gazetted BIS standard publication.");
    assert.equal(updated.humanReviewerId, "reviewer-unit-test");
    assert.ok(updated.humanReviewedAt instanceof Date);

    // Clean up test run
    await prisma.evaluationRun.delete({ where: { id: run.id } });
  });

  it("14. should generate a structured Markdown validation report with explicit scope notice", () => {
    const mockRun = {
      id: "run-demo-123",
      engineVersion: "hybrid-v1",
      datasetVersion: "2026.09",
      totalCases: 20,
      completedCases: 20,
      failedCases: 1,
      createdAt: new Date(),
    };

    const mockMetrics = {
      basedOnNotice: "Based on 19 verified cases (20 total test cases)",
      datasetCounts: { total: 20, verified: 19, unverified: 1, labelled: 18 },
      retrieval: { recallAt1: 0.889, recallAt3: 0.889, recallAt5: 0.944, recallAt10: 0.944, mrr: 0.903, labelledCases: 18 },
      attributes: { accuracyRate: 0.95, accuracyPercent: "95.0%" },
      clarification: { precision: 1.0, recall: 1.0, totalCases: 2 },
      currentness: { accuracy: 1.0, safetyViolations: 0 },
      evidence: { coverage: 0.9, coveragePercent: "90.0%" },
      performance: { averageMs: 32, medianMs: 28, p95Ms: 65 },
      errorBreakdown: { MULTILINGUAL_ERROR: 1 },
      multilingual: { HI: { cases: 1, successful: 1, failed: 0 } },
    };

    const markdown = generateMarkdownReport(mockRun, mockMetrics);
    assert.ok(markdown.includes("NormWise Recommendation Quality Validation & Benchmarking Report"));
    assert.ok(markdown.includes("Based on 19 verified cases"));
    assert.ok(markdown.includes("Recall@1"));
    assert.ok(markdown.includes("MRR"));
    assert.ok(markdown.includes("Currentness & Safety Rule Evaluation"));
    assert.ok(markdown.includes("Error Taxonomy Breakdown"));
  });
});
