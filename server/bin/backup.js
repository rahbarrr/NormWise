#!/usr/bin/env node
/**
 * NormWise Database Logical Backup Utility (Phase 19)
 * Generates a clean pg_dump logical export of PostgreSQL + pgvector schemas and tables.
 *
 * Usage:
 *   node bin/backup.js [--output ./backups/custom_backup.sql]
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackup() {
  console.log("==================================================");
  console.log("      NormWise PostgreSQL Database Backup         ");
  console.log("==================================================");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[Error] DATABASE_URL is not configured.");
    process.exit(1);
  }

  // Ensure backups directory exists
  const backupsDir = path.resolve(__dirname, "../../backups");
  await fs.mkdir(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultOutputFile = path.join(backupsDir, `normwise_backup_${timestamp}.sql`);

  // Parse output flag if supplied
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--output");
  const outputFile = outIndex !== -1 && args[outIndex + 1] ? path.resolve(args[outIndex + 1]) : defaultOutputFile;

  console.log(`Target destination: ${outputFile}`);
  console.log("Initiating pg_dump...");

  try {
    // Mask password in logs
    const parsedUrl = new URL(databaseUrl);
    console.log(`Database Host: ${parsedUrl.hostname}:${parsedUrl.port || 5432}`);
    console.log(`Database Name: ${parsedUrl.pathname.replace(/^\//, "")}`);

    // Command uses pg_dump with the connection URI
    const cmd = `pg_dump --no-owner --no-privileges --clean --if-exists --dbname="${databaseUrl}" --file="${outputFile}"`;

    const { stdout, stderr } = await execAsync(cmd);
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("NOTICE")) console.warn(stderr);

    const stats = await fs.stat(outputFile);
    const sizeMb = (stats.size / 1024 / 1024).toFixed(2);

    console.log("\n--------------------------------------------------");
    console.log(`Backup completed successfully!`);
    console.log(`File: ${outputFile}`);
    console.log(`Size: ${sizeMb} MB`);
    console.log("--------------------------------------------------\n");
    process.exit(0);
  } catch (error) {
    console.error("\n[Error] Backup failed to execute:", error.message);
    console.error("Please verify that 'pg_dump' is installed and DATABASE_URL is reachable.");
    process.exit(1);
  }
}

runBackup();
