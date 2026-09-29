#!/usr/bin/env node
/**
 * NormWise Standards Data Ingestion CLI
 * Usage:
 *   node bin/import-standards.js <filePath> [--dry-run] [--source "SourceName"] [--version "2026.09"]
 */
import fs from "fs";
import path from "path";
import { standardsImportService } from "../src/services/standardsImportService.js";

async function runCli() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
NormWise Standards Data Ingestion CLI

Usage:
  node bin/import-standards.js <filePath> [options]

Options:
  --dry-run              Simulate parsing, validation, and changes without modifying PostgreSQL
  --source <name>        Source dataset name (default: "Authorized Standards Repository")
  --version <version>    Dataset version string (default: "2026.09")
  --demo                 Mark imported standards as demo records (isDemo: true)
  --batch-size <num>     Batch processing size (default: 100)

Examples:
  node bin/import-standards.js data/fixtures/standards_sample.json --dry-run
  node bin/import-standards.js data/fixtures/standards_sample.csv --source "BIS Authorized Dataset"
`);
    process.exit(0);
  }

  const filePath = args.find((a) => !a.startsWith("--"));
  if (!filePath) {
    console.error("Error: Please provide a path to a CSV, JSON, or XLSX file.");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  const dryRun = args.includes("--dry-run");
  const isDemo = args.includes("--demo");

  const sourceIdx = args.indexOf("--source");
  const sourceName = sourceIdx !== -1 && args[sourceIdx + 1] ? args[sourceIdx + 1] : "Authorized Standards Repository";

  const versionIdx = args.indexOf("--version");
  const datasetVersion = versionIdx !== -1 && args[versionIdx + 1] ? args[versionIdx + 1] : "2026.09";

  const ext = path.extname(resolvedPath).toLowerCase();
  console.log(`\n==================================================`);
  console.log(` NormWise Standards Data Ingestion Engine`);
  console.log(` Mode: ${dryRun ? "DRY RUN (No database modifications)" : "LIVE DATABASE IMPORT"}`);
  console.log(` File: ${path.basename(resolvedPath)} (${ext})`);
  console.log(` Source: ${sourceName} | Version: ${datasetVersion}`);
  console.log(`==================================================\n`);

  try {
    let report;
    const options = {
      dryRun,
      sourceName,
      datasetVersion,
      filename: path.basename(resolvedPath),
      isDemo,
    };

    if (ext === ".json") {
      const content = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
      report = await standardsImportService.importJSON(content, options);
    } else if (ext === ".csv") {
      report = await standardsImportService.importCSV(resolvedPath, options);
    } else if (ext === ".xlsx" || ext === ".xls") {
      report = await standardsImportService.importXLSX(resolvedPath, options);
    } else {
      console.error(`Error: Unsupported file format "${ext}". Supported: .csv, .json, .xlsx`);
      process.exit(1);
    }

    console.log(`\n--- IMPORT REPORT ---`);
    console.log(`Status: ${dryRun ? "DRY RUN COMPLETED" : "IMPORT COMPLETED"}`);
    console.log(`Total records read: ${report.totalRead}`);
    console.log(`Records ${dryRun ? "would create" : "created"}: ${report.created}`);
    console.log(`Records ${dryRun ? "would update" : "updated"}: ${report.updated}`);
    console.log(`Records skipped: ${report.skipped}`);
    console.log(`Records failed validation: ${report.failed}`);
    console.log(`Conflicts flagged: ${report.conflicts.length}`);
    console.log(`Execution time: ${report.durationMs}ms`);

    if (report.qualityErrors.length > 0) {
      console.log(`\n--- QUALITY WARNINGS (${report.qualityErrors.length}) ---`);
      report.qualityErrors.slice(0, 10).forEach((err) => {
        console.log(`  Row ${err.row} [${err.rawIdentifier}]: ${err.errors.join(", ")}`);
      });
      if (report.qualityErrors.length > 10) {
        console.log(`  ...and ${report.qualityErrors.length - 10} more warnings.`);
      }
    }

    if (dryRun) {
      console.log(`\n✔ Dry run finished. No database changes were made.\n`);
    } else {
      console.log(`\n✔ Import finished successfully with Job ID: ${report.jobId}\n`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Fatal ingestion error:", err.message);
    process.exit(1);
  }
}

runCli();
