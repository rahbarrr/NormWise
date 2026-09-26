#!/usr/bin/env node
/**
 * NormWise Offline Recommendation Evaluation Script (Phase 15)
 * Runs controlled evaluation test cases against the hybrid recommendation engine.
 * Computes Top-1 retrieval match, Top-K coverage, and match score distribution.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { recommend } from "../src/services/recommendationService.js";
import prisma from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runEvaluation() {
  console.log("==================================================");
  console.log(" NormWise Hybrid Recommendation Evaluation Engine");
  console.log("==================================================\n");

  const evalDir = path.resolve(__dirname, "../data/evaluation");
  if (!fs.existsSync(evalDir)) {
    console.error(`Evaluation directory not found: ${evalDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(evalDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Loaded ${files.length} controlled evaluation test cases.\n`);

  let totalCases = 0;
  let top1Matches = 0;
  let topKMatches = 0;
  const results = [];

  for (const file of files) {
    totalCases++;
    const testCase = JSON.parse(fs.readFileSync(path.join(evalDir, file), "utf-8"));
    const startTime = Date.now();

    try {
      const rec = await recommend(testCase.requirement, { debug: true });
      const durationMs = Date.now() - startTime;

      const topCandidate = rec.primaryRecommendation;
      const isTop1 = topCandidate?.standardNumber === testCase.expectedStandardNumber;

      const allRetrievedNumbers = [
        topCandidate?.standardNumber,
        ...(rec.alternatives || []).map((a) => a.standardNumber),
      ].filter(Boolean);

      const isTopK = allRetrievedNumbers.includes(testCase.expectedStandardNumber);

      if (isTop1) top1Matches++;
      if (isTopK) topKMatches++;

      results.push({
        id: testCase.id,
        requirement: testCase.requirement,
        expectedStandard: testCase.expectedStandardNumber,
        retrievedTopCandidate: topCandidate?.standardNumber || "NONE",
        matchScore: topCandidate?.matchScore || 0,
        currentness: topCandidate?.status || "UNKNOWN",
        retrievedBy: topCandidate?.retrievedBy || ["lexical"],
        isTop1,
        isTopK,
        durationMs,
      });

      console.log(`[${testCase.id}] ${file}`);
      console.log(`  Requirement: "${testCase.requirement.slice(0, 65)}..."`);
      console.log(`  Expected Standard: ${testCase.expectedStandardNumber}`);
      console.log(`  Top Candidate:     ${topCandidate?.standardNumber || "NONE"} (Score: ${topCandidate?.matchScore || 0}, Status: ${topCandidate?.status || "N/A"})`);
      console.log(`  Retrieval Method:  ${(topCandidate?.retrievedBy || ["lexical"]).join(", ")}`);
      console.log(`  Evaluation Result: ${isTop1 ? "✓ Top-1 Match" : isTopK ? "○ Top-K Match" : "✗ Missed"} (${durationMs}ms)\n`);
    } catch (err) {
      console.error(`  Error evaluating ${file}:`, err.message);
    }
  }

  const top1Rate = totalCases > 0 ? ((top1Matches / totalCases) * 100).toFixed(1) : "0";
  const topKRate = totalCases > 0 ? ((topKMatches / totalCases) * 100).toFixed(1) : "0";

  console.log("==================================================");
  console.log(" EVALUATION SUMMARY");
  console.log("==================================================");
  console.log(` Total Test Cases:      ${totalCases}`);
  console.log(` Top-1 Retrieval Count: ${top1Matches} / ${totalCases} (${top1Rate}%)`);
  console.log(` Top-K Coverage Rate:   ${topKMatches} / ${totalCases} (${topKRate}%)`);
  console.log("==================================================\n");

  await prisma.$disconnect();
}

runEvaluation().catch(async (e) => {
  console.error("Evaluation run failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
