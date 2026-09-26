/**
 * NormWise Evaluation Controller (Phase 17)
 */
import prisma from "../config/db.js";
import {
  runEvaluation,
  loadEvaluationCases,
  evaluateCase,
  generateMarkdownReport,
} from "../services/evaluationService.js";

/**
 * Trigger an evaluation run
 * POST /api/admin/evaluation/run or POST /api/evaluation/run
 */
export async function triggerEvaluationRun(req, res) {
  try {
    const { name, limit, includeMultilingual, datasetVersion } = req.body || {};
    const result = await runEvaluation({
      name,
      limit: limit ? parseInt(limit, 10) : undefined,
      includeMultilingual: Boolean(includeMultilingual),
      datasetVersion,
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
      take: 20,
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
    const cases = loadEvaluationCases({ includeMultilingual: true });
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
    if (!testCase || !testCase.requirement) {
      return res.status(400).json({ success: false, error: "Missing test case requirement" });
    }

    const standards = await prisma.standard.findMany({ select: { standardNumber: true } });
    const dbStandardNumbers = new Set(standards.map((s) => s.standardNumber));

    const result = await evaluateCase(testCase, dbStandardNumbers);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
