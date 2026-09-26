#!/usr/bin/env node
/**
 * NormWise Multilingual Evaluation Script (Phase 16)
 *
 * Evaluates multilingual requirement handling across 11 Indian languages:
 * English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia.
 *
 * Reports:
 * - Language
 * - Input
 * - Detected language
 * - Normalization status
 * - Protected terms
 * - Extracted attributes
 * - Retrieval status
 * - Errors
 *
 * Note: Never reports unsupported "translation accuracy percentages".
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeRequirementMultilingual } from "../src/services/multilingualNormalizationService.js";
import { recommend } from "../src/services/recommendationService.js";
import prisma from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMultilingualEvaluation() {
  console.log("================================================================================");
  console.log(" NormWise Multilingual Input & Terminology Normalization Evaluation (Phase 16)");
  console.log("================================================================================\n");

  const evalDir = path.resolve(__dirname, "../data/evaluation/multilingual");
  if (!fs.existsSync(evalDir)) {
    console.error(`Evaluation directory not found: ${evalDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(evalDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Loaded ${files.length} language datasets from ${evalDir}.\n`);

  let totalTestCases = 0;
  let successfulNormalizations = 0;
  let successfulDetections = 0;
  let retrievalEvaluated = 0;
  let retrievalSuccessful = 0;
  const errors = [];

  for (const file of files) {
    const langKey = file.replace(".json", "").toUpperCase();
    const cases = JSON.parse(fs.readFileSync(path.join(evalDir, file), "utf-8"));

    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(` Language Dataset: ${langKey} (${cases.length} test cases)`);
    console.log(`--------------------------------------------------------------------------------`);

    for (const testCase of cases) {
      totalTestCases++;
      const startTime = Date.now();

      try {
        // Step 1: Multilingual Normalization Pipeline
        const normResult = await normalizeRequirementMultilingual(testCase.input);

        const langMatch = normResult.detectedLanguage === testCase.expectedLanguage;
        if (langMatch) successfulDetections++;

        const normSuccess = Boolean(normResult.searchText && normResult.normalizedText);
        if (normSuccess) successfulNormalizations++;

        const protectedTermsFound = normResult.protectedTerms?.map((p) => p.original) || [];

        // Step 2: Retrieval Evaluation
        let retrievalStatus = "SKIPPED";
        let topStandard = null;

        if (testCase.expectedStandardId) {
          retrievalEvaluated++;
          try {
            const rec = await recommend(testCase.input, { language: normResult.detectedLanguage });
            topStandard = rec.primaryRecommendation?.standardNumber || null;
            const alternatives = (rec.alternatives || []).map((a) => a.standardNumber);
            const allCandidates = [topStandard, ...alternatives].filter(Boolean);

            const hitExpected = allCandidates.some((num) => num && num.includes(testCase.expectedStandardId));
            if (hitExpected) {
              retrievalSuccessful++;
              retrievalStatus = `MATCH (${topStandard || "alternative"})`;
            } else {
              retrievalStatus = `NO_MATCH (top: ${topStandard || "NONE"})`;
            }
          } catch (recErr) {
            retrievalStatus = `RETRIEVAL_ERROR: ${recErr.message}`;
          }
        }

        const durationMs = Date.now() - startTime;

        console.log(`[${testCase.id}]`);
        console.log(`  Language:             ${langKey}`);
        console.log(`  Input:                "${testCase.input}"`);
        console.log(`  Detected language:    ${normResult.detectedLanguage} (Expected: ${testCase.expectedLanguage}, Confidence: ${normResult.languageConfidence || "N/A"}) [${langMatch ? "PASS" : "FAIL"}]`);
        console.log(`  Normalization status: ${normSuccess ? "SUCCESS" : "FAILED"} (Method: ${normResult.normalizationMethod})`);
        console.log(`  Search representation: "${normResult.searchText}"`);
        console.log(`  Protected terms:      ${protectedTermsFound.length > 0 ? protectedTermsFound.join(", ") : "None detected"}`);
        console.log(`  Extracted attributes: ${JSON.stringify(normResult.extractedAttributes)}`);
        console.log(`  Retrieval status:     ${retrievalStatus}`);
        console.log(`  Duration:             ${durationMs}ms\n`);
      } catch (err) {
        errors.push({ id: testCase.id, language: langKey, error: err.message });
        console.error(`  [${testCase.id}] Evaluation Error:`, err.message, "\n");
      }
    }
  }

  console.log("================================================================================");
  console.log(" MULTILINGUAL EVALUATION SUMMARY");
  console.log("================================================================================");
  console.log(` Total Multilingual Cases:  ${totalTestCases}`);
  console.log(` Language Detection Pass:   ${successfulDetections} / ${totalTestCases} (${((successfulDetections / totalTestCases) * 100).toFixed(1)}%)`);
  console.log(` Normalization Success:     ${successfulNormalizations} / ${totalTestCases} (${((successfulNormalizations / totalTestCases) * 100).toFixed(1)}%)`);
  if (retrievalEvaluated > 0) {
    console.log(` Retrieval Expected Target: ${retrievalSuccessful} / ${retrievalEvaluated} (${((retrievalSuccessful / retrievalEvaluated) * 100).toFixed(1)}%)`);
  }
  console.log(` Total Pipeline Errors:     ${errors.length}`);
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

runMultilingualEvaluation().catch(async (e) => {
  console.error("Evaluation script encountered unhandled fatal exception:", e);
  await prisma.$disconnect();
  process.exit(1);
});
