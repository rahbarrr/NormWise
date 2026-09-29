#!/usr/bin/env node
/**
 * NormWise Database Restore Utility (Phase 19)
 * Restores a logical pg_dump SQL export into the target PostgreSQL database.
 *
 * CRITICAL SAFETY:
 * Restoring overwrites existing database records.
 * You MUST pass the --confirm flag to execute.
 *
 * Usage:
 *   node bin/restore.js --file ./backups/normwise_backup_2026-09-26.sql --confirm
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function runRestore() {
  console.log("==================================================");
  console.log("      NormWise PostgreSQL Database Restore        ");
  console.log("==================================================");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[Error] DATABASE_URL is not configured.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const fileIndex = args.indexOf("--file");
  const isConfirmed = args.includes("--confirm");

  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error("[Error] Please specify the backup file to restore with --file <path>");
    console.error("Example: node bin/restore.js --file ./backups/normwise_backup_2026-09-26.sql --confirm");
    process.exit(1);
  }

  const backupFile = path.resolve(args[fileIndex + 1]);

  // Safety confirmation check
  if (!isConfirmed) {
    console.warn("\n[WARNING] Database restore will overwrite target database tables.");
    console.warn("To prevent accidental data loss, you must supply the '--confirm' flag.");
    console.warn(`Command: node bin/restore.js --file "${backupFile}" --confirm\n`);
    process.exit(1);
  }

  try {
    const stats = await fs.stat(backupFile);
    console.log(`Backup File: ${backupFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    const parsedUrl = new URL(databaseUrl);
    console.log(`Target Host: ${parsedUrl.hostname}:${parsedUrl.port || 5432}`);
    console.log(`Target DB:   ${parsedUrl.pathname.replace(/^\//, "")}`);
    console.log("Restoring database tables via psql...");

    const cmd = `psql "${databaseUrl}" -f "${backupFile}"`;
    const { stdout, stderr } = await execAsync(cmd);

    if (stdout) console.log(stdout.slice(0, 500));
    if (stderr && !stderr.includes("NOTICE")) console.warn(stderr.slice(0, 500));

    console.log("\n--------------------------------------------------");
    console.log("Database restore completed successfully!");
    console.log("--------------------------------------------------\n");
    process.exit(0);
  } catch (error) {
    console.error("\n[Error] Restore failed to execute:", error.message);
    process.exit(1);
  }
}

runRestore();
