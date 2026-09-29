/**
 * NormWise Evaluation Controller (Phase 17 & Phase 21)
 */
import prisma from "../config/db.js";
import {
  runEvaluation,
  loadEvaluationCases,
  evaluateCase,
  compareRetrievalMethods,
  recordHumanFeedback,
  generateMarkdownReport,
} from "../services/evaluationService.js";

/**
 * Trigger an evaluation run
 * POST /api/admin/evaluation/run or POST /api/evaluation/run
 */
export async function triggerEvaluationRun(req, res) {
  try {
    const {
      name,
      limit,
      category,
      caseType,
      verificationLevel,
      includeMultilingual,
      datasetVersion,
      mode,
      compareRetrieval,
    } = req.body || {};

    const result = await runEvaluation({
      name,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      caseType,
      verificationLevel,
      includeMultilingual: Boolean(includeMultilingual),
      datasetVersion,
      mode: mode || "hybrid",
      compareRetrieval: Boolean(compareRetrieval),
    });

    res.status(201).json({
      success: true,
      runId: result.run.id,
      name: result.run.name,
      metrics: result.metrics,
      totalCases: result.run.totalCases,
      completedCases: result.run.completedCases,
      failedCases: result.run.failedCases,
    });
  } catch (error) {
    console.error("[EvaluationController] Failed to run evaluation:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * List past evaluation runs
 * GET /api/admin/evaluation/runs
 */
export async function listEvaluationRuns(req, res) {
  try {
    const runs = await prisma.evaluationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    res.json({ success: true, runs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get details of a specific evaluation run with its case results
 * GET /api/admin/evaluation/runs/:id
 */
export async function getEvaluationRunDetails(req, res) {
  try {
    const { id } = req.params;
    const run = await prisma.evaluationRun.findUnique({
      where: { id },
      include: {
        results: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: "Evaluation run not found" });
    }

    res.json({ success: true, run });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Export evaluation run report (JSON + Markdown)
 * GET /api/admin/evaluation/:id/report
 */
export async function exportEvaluationReport(req, res) {
  try {
    const { id } = req.params;
    const run = await prisma.evaluationRun.findUnique({
      where: { id },
      include: {
        results: true,
      },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: "Evaluation run not found" });
    }

    const markdown = generateMarkdownReport(run, run.metrics || {}, run.results);

    // If query ?format=markdown is requested, send text/markdown
    if (req.query.format === "markdown" || req.query.format === "md") {
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="evaluation-report-${new Date().toISOString().slice(0, 10)}.md"`
      );
      return res.send(markdown);
    }

    res.json({
      success: true,
      runId: run.id,
      name: run.name,
      engineVersion: run.engineVersion,
      datasetVersion: run.datasetVersion,
      metrics: run.metrics,
      markdownReport: markdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get all available evaluation cases from filesystem
 * GET /api/admin/evaluation/cases
 */
export async function getAvailableCases(req, res) {
  try {
    const { category, caseType, verificationLevel } = req.query;
    const cases = loadEvaluationCases({
      includeMultilingual: true,
      category,
      caseType,
      verificationLevel,
    });
    res.json({ success: true, count: cases.length, cases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Evaluate single case on demand (for debug view & case explorer)
 * POST /api/admin/evaluation/case
 */
export async function evaluateSingleCase(req, res) {
  try {
    const testCase = req.body;
    if (!testCase || (!testCase.requirement && !testCase.requirementText)) {
      return res.status(400).json({ success: false, error: "Missing test case requirement" });
    }

    const standards = await prisma.standard.findMany({ select: { standardNumber: true } });
    const dbStandardNumbers = new Set(standards.map((s) => s.standardNumber));

    const result = await evaluateCase(
      {
        ...testCase,
        requirement: testCase.requirement || testCase.requirementText,
      },
      dbStandardNumbers,
      { compareRetrieval: Boolean(req.body.compareRetrieval) }
    );

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Record human technical reviewer feedback on an evaluation case result
 * POST /api/admin/evaluation/results/:id/feedback
 */
export async function submitHumanFeedback(req, res) {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body || {};

    if (!decision) {
      return res.status(400).json({ success: false, error: "Decision is required." });
    }

    const reviewerId = req.user?.id || "reviewer-institutional-demo";
    const updated = await recordHumanFeedback(id, {
      decision,
      notes,
      reviewerId,
    });

    res.json({ success: true, result: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Compare retrieval strategies for a requirement
 * POST /api/admin/evaluation/compare-retrieval
 */
export async function compareRetrievalStrategies(req, res) {
  try {
    const { requirement, requirementText, expectedStandards, expectedAttributes } = req.body || {};
    const text = requirement || requirementText;

    if (!text) {
      return res.status(400).json({ success: false, error: "Requirement text is required." });
    }

    const comparison = await compareRetrievalMethods({
      requirement: text,
      expectedStandards: expectedStandards || [],
      expectedAttributes: expectedAttributes || {},
    });

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
