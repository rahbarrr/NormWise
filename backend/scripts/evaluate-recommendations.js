#!/usr/bin/env node
/**
 * NormWise Recommendation Quality Evaluation & Benchmarking CLI (Phase 17)
 *
 * Runs evaluation against the hybrid recommendation engine.
 * Supports:
 *   --dataset=<category|multilingual|all>
 *   --method=<hybrid|lexical|vector>
 *   --limit=<number>
 *   --dry-run
 */
import path from "path";
import { fileURLToPath } from "url";
import { runEvaluation, loadEvaluationCases, generateMarkdownReport } from "../src/services/evaluationService.js";
import prisma from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CLI Argument Parser
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dataset: "all",
    method: "hybrid",
    limit: null,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--dataset=")) {
      options.dataset = arg.split("=")[1];
    } else if (arg.startsWith("--method=")) {
      options.method = arg.split("=")[1];
    } else if (arg.startsWith("--limit=")) {
      options.limit = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log("================================================================================");
  console.log(" NormWise Recommendation Quality Evaluation & Benchmarking Framework (Phase 17)");
  console.log("================================================================================\n");
  console.log(`Configuration:`);
  console.log(`  Target Dataset: ${options.dataset}`);
  console.log(`  Retrieval Method: ${options.method}`);
  console.log(`  Case Limit: ${options.limit || "Unlimited"}`);
  console.log(`  Dry Run Mode: ${options.dryRun ? "ENABLED (No DB records created)" : "DISABLED"}\n`);

  let targetDir = path.resolve(__dirname, "../data/evaluation");
  let includeMultilingual = options.dataset === "multilingual" || options.dataset === "all";

  if (options.dataset !== "all" && options.dataset !== "multilingual") {
    targetDir = path.join(targetDir, options.dataset);
  }

  const cases = loadEvaluationCases({
    datasetDir: targetDir,
    includeMultilingual,
    limit: options.limit,
  });

  console.log(`Loaded ${cases.length} evaluation test cases.\n`);

  if (options.dryRun) {
    console.log("--- Dry-Run Case Listing ---");
    cases.forEach((c, idx) => {
      console.log(`[${idx + 1}] ID: ${c.id} | Type: ${c.evaluationType || "STANDARD_RETRIEVAL"} | Lang: ${c.language || "en"} | File: ${c._sourceFile || "unknown"}`);
      console.log(`    Requirement: "${c.requirement.slice(0, 75)}..."`);
    });
    console.log("\nDry-run completed successfully.");
    await prisma.$disconnect();
    return;
  }

  const startTime = Date.now();
  const { run, metrics, results } = await runEvaluation({
    name: `CLI Evaluation Run (${options.dataset}, ${options.method})`,
    cases,
  });

  const durationMs = Date.now() - startTime;

  // Print Summary Table
  console.log("================================================================================");
  console.log(" EVALUATION RESULTS SUMMARY");
  console.log("================================================================================");
  console.log(` Total Cases Evaluated: ${run.totalCases} (Completed: ${run.completedCases}, Failed: ${run.failedCases})`);
  console.log(` Duration: ${durationMs} ms (Avg: ${metrics.performance.averageMs}ms, Median: ${metrics.performance.medianMs}ms, p95: ${metrics.performance.p95Ms}ms)\n`);

  console.log("RETRIEVAL METRICS (Labelled Standards):");
  console.log(`  Recall@1:  ${(metrics.retrieval.recallAt1 * 100).toFixed(1)}%`);
  console.log(`  Recall@3:  ${(metrics.retrieval.recallAt3 * 100).toFixed(1)}%`);
  console.log(`  Recall@5:  ${(metrics.retrieval.recallAt5 * 100).toFixed(1)}%`);
  console.log(`  Recall@10: ${(metrics.retrieval.recallAt10 * 100).toFixed(1)}%`);
  console.log(`  MRR:       ${metrics.retrieval.mrr.toFixed(3)}\n`);

  console.log("CLARIFICATION METRICS:");
  console.log(`  Precision: ${(metrics.clarification.precision * 100).toFixed(1)}%`);
  console.log(`  Recall:    ${(metrics.clarification.recall * 100).toFixed(1)}%\n`);

  console.log("EVIDENCE COVERAGE:");
  console.log(`  Coverage in Dataset: ${metrics.evidence.coveragePercent}\n`);

  console.log("ERROR CATEGORIES:");
  if (Object.keys(metrics.errorBreakdown).length === 0) {
    console.log("  No errors detected across test suite.");
  } else {
    for (const [cat, count] of Object.entries(metrics.errorBreakdown)) {
      console.log(`  - ${cat}: ${count}`);
    }
  }

  console.log("\n================================================================================");
  console.log(` Evaluation Run ID: ${run.id}`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Evaluation script encountered fatal error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
