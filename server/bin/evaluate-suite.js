#!/usr/bin/env node
/**
 * NormWise Comprehensive Real-Case Evaluation & Diagnostic CLI Suite (Phase 21)
 *
 * Supports:
 *   npm run evaluate:recommendations
 *   npm run evaluate:retrieval
 *   npm run evaluate:multilingual
 *   npm run evaluate:currentness
 *   npm run evaluate:compliance
 *   npm run evaluate:all
 *
 * Arguments:
 *   --dataset=<version|all|real-case|category>
 *   --case=<caseId>
 *   --mode=<hybrid|lexical|vector|structured>
 *   --debug
 *   --suite=<recommendations|retrieval|multilingual|currentness|compliance|all>
 */

import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/config/db.js";
import {
  runEvaluation,
  loadEvaluationCases,
  compareRetrievalMethods,
  evaluateCase,
  generateMarkdownReport,
} from "../src/services/evaluationService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suite: "all",
    dataset: "real-case",
    caseId: null,
    mode: "hybrid",
    limit: null,
    debug: false,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--suite=")) {
      options.suite = arg.split("=")[1];
    } else if (arg.startsWith("--dataset=")) {
      options.dataset = arg.split("=")[1];
    } else if (arg.startsWith("--case=")) {
      options.caseId = arg.split("=")[1];
    } else if (arg.startsWith("--mode=")) {
      options.mode = arg.split("=")[1];
    } else if (arg.startsWith("--limit=")) {
      options.limit = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--debug") {
      options.debug = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log("================================================================================");
  console.log(" NormWise Real-Case Quality Validation & Benchmarking CLI (Phase 21)");
  console.log("================================================================================\n");
  console.log(`Configuration:`);
  console.log(`  Target Suite:      ${options.suite.toUpperCase()}`);
  console.log(`  Dataset Scope:     ${options.dataset}`);
  console.log(`  Retrieval Mode:    ${options.mode}`);
  console.log(`  Specific Case ID:  ${options.caseId || "All matching cases"}`);
  console.log(`  Debug Trace Mode:  ${options.debug ? "ON" : "OFF"}\n`);

  let targetDir = path.resolve(__dirname, "../data/evaluation");
  if (options.dataset === "real-case") {
    targetDir = path.join(targetDir, "real-case");
  } else if (options.dataset !== "all") {
    // Check if subfolder exists in real-case or data/evaluation
    const realSub = path.join(targetDir, "real-case", options.dataset);
    const directSub = path.join(targetDir, options.dataset);
    targetDir = fsExists(realSub) ? realSub : directSub;
  }

  let filterCaseType = null;
  let includeMultilingual = true;

  if (options.suite === "currentness") {
    filterCaseType = "OUTDATED_STANDARD";
  } else if (options.suite === "multilingual") {
    filterCaseType = "MULTILINGUAL";
  }

  const cases = loadEvaluationCases({
    datasetDir: targetDir,
    caseId: options.caseId,
    caseType: filterCaseType,
    includeMultilingual,
    limit: options.limit,
  });

  if (cases.length === 0) {
    console.warn(`No evaluation cases found in target directory: ${targetDir}`);
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`Discovered ${cases.length} evaluation test case(s) ready for execution.`);

  // If Suite is 'retrieval' comparison mode
  if (options.suite === "retrieval") {
    console.log("\n--- Multi-Strategy Retrieval Benchmark Comparison ---\n");
    console.log(
      "Case ID".padEnd(14) +
      "Structured Match".padEnd(20) +
      "Lexical (FTS)".padEnd(20) +
      "Vector (pgvector)".padEnd(20) +
      "Hybrid Top Match".padEnd(20)
    );
    console.log("-".repeat(94));

    for (const testCase of cases) {
      const comp = await compareRetrievalMethods(testCase);
      const strMatch = comp.structured?.topMatch || "None";
      const lexMatch = comp.lexical?.topMatch || "None";
      const vecMatch = comp.vector?.topMatch || "None";
      const hybMatch = comp.hybrid?.topMatch || "None";

      console.log(
        testCase.id.padEnd(14) +
        strMatch.slice(0, 18).padEnd(20) +
        lexMatch.slice(0, 18).padEnd(20) +
        vecMatch.slice(0, 18).padEnd(20) +
        hybMatch.slice(0, 18).padEnd(20)
      );
    }
    console.log("\nRetrieval comparison benchmark completed.");
    await prisma.$disconnect();
    return;
  }

  // Standard or full evaluation run
  const startTime = Date.now();
  const { run, metrics, results } = await runEvaluation({
    name: `CLI Evaluation Suite: ${options.suite.toUpperCase()} [${options.mode}]`,
    cases,
    mode: options.mode,
    compareRetrieval: options.suite === "all" || options.debug,
  });

  const durationMs = Date.now() - startTime;

  console.log("\n================================================================================");
  console.log(" EVALUATION RESULTS SUMMARY");
  console.log("================================================================================");
  console.log(` Evaluation Run ID:    ${run.id}`);
  console.log(` Scope:                 ${metrics.basedOnNotice}`);
  console.log(` Cases Evaluated:       ${run.totalCases} (Completed: ${run.completedCases}, Failed: ${run.failedCases})`);
  console.log(` Total Time:            ${durationMs}ms (Avg: ${metrics.performance.averageMs}ms/case)\n`);

  console.log("RETRIEVAL ACCURACY (Verified Standards):");
  console.log(`  Recall@1:             ${((metrics.retrieval?.recallAt1 || 0) * 100).toFixed(1)}%`);
  console.log(`  Recall@3:             ${((metrics.retrieval?.recallAt3 || 0) * 100).toFixed(1)}%`);
  console.log(`  Recall@5:             ${((metrics.retrieval?.recallAt5 || 0) * 100).toFixed(1)}%`);
  console.log(`  Recall@10:            ${((metrics.retrieval?.recallAt10 || 0) * 100).toFixed(1)}%`);
  console.log(`  MRR:                  ${(metrics.retrieval?.mrr || 0).toFixed(3)}\n`);

  console.log("ENGINEERING SAFETY SIGNALS:");
  console.log(`  Attribute Accuracy:   ${metrics.attributes?.accuracyPercent || "100.0%"}`);
  console.log(`  Clarification Precision: ${((metrics.clarification?.precision || 1.0) * 100).toFixed(1)}%`);
  console.log(`  Currentness Safety:   ${((metrics.currentness?.accuracy || 1.0) * 100).toFixed(1)}% (${metrics.currentness?.safetyViolations || 0} violations)`);
  console.log(`  Evidence Coverage:    ${metrics.evidence?.coveragePercent || "0.0%"}\n`);

  if (Object.keys(metrics.errorBreakdown || {}).length > 0) {
    console.log("ERROR TAXONOMY DISTRIBUTION:");
    for (const [category, count] of Object.entries(metrics.errorBreakdown)) {
      console.log(`  - ${category.padEnd(28)}: ${count}`);
    }
    console.log("");
  } else {
    console.log("ERROR TAXONOMY: 0 errors recorded in verified test cases.\n");
  }

  if (options.debug) {
    console.log("--- CASE-BY-CASE DIAGNOSTIC TRACE ---");
    for (const res of results) {
      const topStd = res.topStandardId || "None";
      const score = Math.round((res.topMatchScore || 0) * 100);
      console.log(`[${res.status}] ${res.caseId} [${res.verificationLevel}] -> Top: ${topStd} (${score}%) | Error: ${res.errorCategory || "None"}`);
      if (res.failureReason) {
        console.log(`       Reason: ${res.failureReason}`);
      }
    }
    console.log("");
  }

  console.log("================================================================================");
  console.log(`Validation report archived to database run: ${run.id}`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

function fsExists(p) {
  try {
    const fs = import("fs");
    return true;
  } catch {
    return false;
  }
}

main().catch(async (err) => {
  console.error("Evaluation CLI encountered fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
