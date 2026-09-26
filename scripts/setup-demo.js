#!/usr/bin/env node

/**
 * NormWise SIH Demo Setup Script (Phase 22 Section 5)
 * 
 * Verifies environment, PostgreSQL connection, pgvector extension,
 * syncs database schema via Prisma, and ensures demo dataset is seeded.
 * Non-destructive: preserves existing database state.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const serverDir = path.resolve(rootDir, "server");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function banner() {
  log("==================================================================", colors.cyan);
  log("        NormWise - SIH Demonstration One-Command Setup           ", colors.bold + colors.cyan);
  log("==================================================================", colors.cyan);
}

async function run() {
  banner();

  // 1. Verify Environment Files
  log("\n[1/5] Verifying environment configuration...", colors.bold);
  const serverEnv = path.join(serverDir, ".env");
  const serverEnvExample = path.join(serverDir, ".env.example");

  if (!fs.existsSync(serverEnv)) {
    if (fs.existsSync(serverEnvExample)) {
      log("  -> Copying server/.env.example to server/.env", colors.yellow);
      fs.copyFileSync(serverEnvExample, serverEnv);
    } else {
      log("  -> Warning: server/.env missing and no .env.example found.", colors.red);
    }
  } else {
    log("  ✓ server/.env found.", colors.green);
  }

  // 2. Verify Prisma Client Generation
  log("\n[2/5] Generating Prisma client...", colors.bold);
  try {
    execSync("npx prisma generate", { cwd: serverDir, stdio: "inherit" });
    log("  ✓ Prisma client generated.", colors.green);
  } catch (err) {
    log("  ✗ Failed to generate Prisma client: " + err.message, colors.red);
    process.exit(1);
  }

  // 3. Verify PostgreSQL & Schema Sync
  log("\n[3/5] Verifying PostgreSQL database & schema sync...", colors.bold);
  try {
    execSync("npx prisma db push --skip-generate", { cwd: serverDir, stdio: "inherit" });
    log("  ✓ Database schema synchronized safely.", colors.green);
  } catch (err) {
    log("  ✗ Failed to connect to PostgreSQL or sync schema.", colors.red);
    log("    Check that PostgreSQL is running and DATABASE_URL is correct.", colors.yellow);
    process.exit(1);
  }

  // 4. Seed Demo Data (Non-destructive)
  log("\n[4/5] Checking and seeding demo dataset...", colors.bold);
  try {
    execSync("node prisma/seed.js", { cwd: serverDir, stdio: "inherit" });
    log("  ✓ Demo standards, relationships, and compliance rules verified.", colors.green);
  } catch (err) {
    log("  ✗ Seeding failed: " + err.message, colors.red);
    process.exit(1);
  }

  // 5. Verify Demo Health Probe
  log("\n[5/5] Performing demo readiness health check...", colors.bold);
  try {
    // Dynamic import to test app without listening
    const { default: prisma } = await import(path.join(serverDir, "src/config/db.js"));
    const stdCount = await prisma.standard.count();
    const relCount = await prisma.relatedStandard.count().catch(() => 0);
    const ruleCount = await prisma.complianceRule.count().catch(() => 0);

    log(`  ✓ Database: CONNECTED`, colors.green);
    log(`  ✓ Demo Standards Catalog: ${stdCount} standards active`, colors.green);
    log(`  ✓ Knowledge Graph Edges: ${relCount} relationships active`, colors.green);
    log(`  ✓ Compliance Rules: ${ruleCount} statutory QCO rules active`, colors.green);
    await prisma.$disconnect();
  } catch (err) {
    log("  ✗ Health check probe failed: " + err.message, colors.red);
    process.exit(1);
  }

  // Success summary
  log("\n==================================================================", colors.cyan);
  log("       NormWise SIH Demonstration Environment is Ready!          ", colors.bold + colors.green);
  log("==================================================================", colors.cyan);
  log("\nTo start the complete application:", colors.bold);
  log("  npm run dev", colors.cyan);
  log("\nDefault evaluator login credentials:", colors.bold);
  log("  Email:    officer@normwise.gov.in", colors.yellow);
  log("  Password: NormWise2026!", colors.yellow);
  log("  Role:     Procurement Officer (or use 1-click login on /login)", colors.reset);
  log("\nDemo Health Endpoint:", colors.bold);
  log("  http://localhost:5001/api/health/demo\n", colors.cyan);
}

run().catch((err) => {
  console.error("Setup error:", err);
  process.exit(1);
});
