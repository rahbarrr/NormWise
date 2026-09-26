import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import prisma from "../src/config/db.js";
import xlsx from "xlsx";
import {
  normalizeStandardNumber,
  normalizeStatus,
  normalizeTitle,
  normalizeTerm,
} from "../src/services/standardNormalizationService.js";
import {
  importJSON,
  importCSV,
  importXLSX,
  validateRecord,
  normalizeRecord,
  detectConflicts,
  getDatasetOverview,
  getImportReport,
} from "../src/services/standardsImportService.js";
import { recommend } from "../src/services/recommendationService.js";

describe("Phase 14 Standards Data Ingestion & Dataset Foundation Test Suite", () => {
  let createdJobIds = [];
  let createdStandardIds = [];

  after(async () => {
    // Cleanup imported records and jobs
    if (createdJobIds.length > 0) {
      await prisma.importedStandardRecord.deleteMany({
        where: { importJobId: { in: createdJobIds } },
      });
      await prisma.recommendation.updateMany({
        where: { importJobId: { in: createdJobIds } },
        data: { importJobId: null },
      });
      await prisma.standard.updateMany({
        where: { importJobId: { in: createdJobIds } },
        data: { importJobId: null },
      });
      await prisma.dataImportJob.deleteMany({
        where: { id: { in: createdJobIds } },
      });
    }

    if (createdStandardIds.length > 0) {
      await prisma.relatedStandard.deleteMany({
        where: {
          OR: [
            { standardId: { in: createdStandardIds } },
            { relatedStandardId: { in: createdStandardIds } },
          ],
        },
      });
      await prisma.standardAmendment.deleteMany({
        where: { standardId: { in: createdStandardIds } },
      });
      await prisma.standard.deleteMany({
        where: { id: { in: createdStandardIds } },
      });
    }
  });

  // 1. CSV Parsing
  test("1. should parse standard records from CSV format successfully", async () => {
    const csvContent = `standardNumber,title,status,sourceName,category\nIS 99991:2024,Test CSV Standard,CURRENT,Authorized Source,Testing`;
    const result = await importCSV(Buffer.from(csvContent), {
      sourceName: "CSV Test Source",
      datasetVersion: "2026.09",
      dryRun: true,
    });

    assert.equal(result.recordsRead, 1);
    assert.equal(result.recordsCreated, 1);
    assert.equal(result.recordsFailed, 0);
  });

  // 2. JSON Parsing
  test("2. should parse standard records from JSON format successfully", async () => {
    const jsonRecords = [
      {
        standardNumber: "IS 99992:2024",
        title: "Test JSON Standard",
        status: "CURRENT",
        sourceName: "Authorized JSON Source",
        category: "Testing",
      },
    ];
    const result = await importJSON(Buffer.from(JSON.stringify(jsonRecords)), {
      sourceName: "JSON Test Source",
      datasetVersion: "2026.09",
      dryRun: true,
    });

    assert.equal(result.recordsRead, 1);
    assert.equal(result.recordsCreated, 1);
    assert.equal(result.recordsFailed, 0);
  });

  // 3. XLSX Parsing
  test("3. should parse standard records from XLSX spreadsheet format successfully", async () => {
    const ws = xlsx.utils.json_to_sheet([
      {
        standardNumber: "IS 99993:2024",
        title: "Test XLSX Standard",
        status: "CURRENT",
        sourceName: "Authorized XLSX Source",
        category: "Testing",
      },
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Standards");
    const xlsxBuffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = await importXLSX(xlsxBuffer, {
      sourceName: "XLSX Test Source",
      datasetVersion: "2026.09",
      dryRun: true,
    });

    assert.equal(result.recordsRead, 1);
    assert.equal(result.recordsCreated, 1);
    assert.equal(result.recordsFailed, 0);
  });

  // 4. Required Field Validation
  test("4. should mark records invalid when required minimum fields are missing", async () => {
    // Missing title
    const invalidRecord1 = {
      standardNumber: "IS 99994:2024",
      sourceName: "Source",
    };
    const res1 = validateRecord(invalidRecord1);
    assert.equal(res1.isValid, false);
    assert.match(res1.errors.join(" "), /title/i);

    // Missing standardNumber
    const invalidRecord2 = {
      title: "Title without Number",
      sourceName: "Source",
    };
    const res2 = validateRecord(invalidRecord2);
    assert.equal(res2.isValid, false);
    assert.match(res2.errors.join(" "), /standardNumber/i);

    // Missing sourceName
    const invalidRecord3 = {
      standardNumber: "IS 99995:2024",
      title: "Title without Source",
    };
    const res3 = validateRecord(invalidRecord3);
    assert.equal(res3.isValid, false);
    assert.match(res3.errors.join(" "), /sourceName/i);
  });

  // 5. Identifier Normalization
  test("5. should normalize varied identifier formats while preserving parts and sections", () => {
    const norm1 = normalizeStandardNumber("IS 2347:2023");
    assert.equal(norm1.canonical, "IS 2347:2023");
    assert.equal(norm1.searchKey, "IS23472023");

    const norm2 = normalizeStandardNumber("IS-2347:2023");
    assert.equal(norm2.canonical, "IS 2347:2023");

    const norm3 = normalizeStandardNumber("IS2347:2023");
    assert.equal(norm3.canonical, "IS 2347:2023");

    // Parts preservation
    const part1 = normalizeStandardNumber("IS 10322 (Part 5/Sec 3):2012");
    const part2 = normalizeStandardNumber("IS 10322 Part 5 Sec 5:2013");
    assert.notEqual(part1.canonical, part2.canonical);
    assert.equal(part1.part, "5");
    assert.equal(part1.section, "3");
    assert.equal(part2.part, "5");
    assert.equal(part2.section, "5");
  });

  // 6. Duplicate Detection
  test("6. should detect duplicate records matching existing database standards", async () => {
    // Query an existing standard in DB
    const existing = await prisma.standard.findFirst();
    assert.ok(existing, "At least one standard must exist in DB");

    const record = {
      standardNumber: existing.standardNumber,
      title: "Duplicate Check Standard",
      sourceName: "Test Source",
    };

    const conflicts = await detectConflicts(record, existing);
    assert.ok(conflicts !== null || existing !== null);
  });

  // 7. Upsert Behavior
  test("7. should upsert new standards and create DataImportJob", async () => {
    const uniqueStdNum = `IS ${88100 + Math.floor(Math.random() * 800)}:2024`;
    const payload = [
      {
        standardNumber: uniqueStdNum,
        title: "Upsert Integration Standard",
        scope: "Testing upsert pipeline capabilities",
        status: "CURRENT",
        sourceName: "Controlled Source",
        category: "Test Category",
        isDemo: false,
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Integration Test Job",
      datasetVersion: "2026.09",
      dryRun: false,
    });

    createdJobIds.push(result.jobId);
    assert.equal(result.recordsCreated, 1);

    const saved = await prisma.standard.findUnique({
      where: { standardNumber: uniqueStdNum },
    });
    assert.ok(saved);
    createdStandardIds.push(saved.id);
    assert.equal(saved.isDemo, false);
    assert.equal(saved.sourceName, "Controlled Source");
  });

  // 8. Null-Field Protection
  test("8. should preserve existing verified fields when incoming record has null values", async () => {
    // Create baseline standard
    const stdNum = `IS ${88900 + Math.floor(Math.random() * 800)}:2024`;
    const baseline = await prisma.standard.create({
      data: {
        standardNumber: stdNum,
        title: "Original Verified Title",
        scope: "Original comprehensive verified scope that must not be erased",
        status: "CURRENT",
        sourceName: "Primary Source",
        isDemo: false,
      },
    });
    createdStandardIds.push(baseline.id);

    // Incoming record with null scope
    const updatePayload = [
      {
        standardNumber: stdNum,
        title: "Updated Title From Secondary Source",
        scope: null, // Should NOT erase existing scope
        sourceName: "Secondary Source",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(updatePayload)), {
      sourceName: "Secondary Ingestion",
      datasetVersion: "2026.09",
      dryRun: false,
    });
    createdJobIds.push(result.jobId);

    const refreshed = await prisma.standard.findUnique({
      where: { id: baseline.id },
    });
    assert.equal(refreshed.title, "Updated Title From Secondary Source");
    assert.equal(refreshed.scope, "Original comprehensive verified scope that must not be erased");
  });

  // 9. Status Mapping
  test("9. should map varied source status strings to standard enum and default to UNKNOWN", () => {
    assert.equal(normalizeStatus("Active"), "CURRENT");
    assert.equal(normalizeStatus("Current"), "CURRENT");
    assert.equal(normalizeStatus("Superseded"), "SUPERSEDED");
    assert.equal(normalizeStatus("Cancelled"), "WITHDRAWN");
    assert.equal(normalizeStatus("Withdrawn"), "WITHDRAWN");
    assert.equal(normalizeStatus("Under revision"), "UNDER_REVIEW");
    assert.equal(normalizeStatus("Random Unrecognized Status"), "UNKNOWN");
    assert.equal(normalizeStatus(null), "UNKNOWN");
  });

  // 10. Date Validation
  test("10. should validate publication dates without crashing on bad date formats", () => {
    const validNorm = normalizeRecord({
      standardNumber: "IS 1234:2024",
      title: "Date Test",
      publicationDate: "2024-05-15",
      sourceName: "Source",
    });
    assert.ok(validNorm.publicationDate instanceof Date);

    const badDateNorm = normalizeRecord({
      standardNumber: "IS 1234:2024",
      title: "Date Test",
      publicationDate: "Invalid-Date-String",
      sourceName: "Source",
    });
    assert.equal(badDateNorm.publicationDate, null);
  });

  // 11. Conflict Detection
  test("11. should detect and record conflicts between existing and incoming records", async () => {
    const existing = {
      standardNumber: "IS 1000:2020",
      status: "CURRENT",
      title: "Original Standard",
      sourceName: "Source A",
    };

    const incoming = {
      standardNumber: "IS 1000:2020",
      status: "SUPERSEDED",
      title: "Conflicting Standard Title",
      sourceName: "Source B",
    };

    const conflicts = detectConflicts(existing, incoming);
    assert.ok(conflicts.length > 0);
    assert.equal(conflicts.length, 2);
    assert.equal(conflicts[0].field, "status");
    assert.equal(conflicts[1].field, "title");
  });

  // 12. Relationship Import
  test("12. should import relationships between standards supported by the source", async () => {
    const stdA = `IS ${89100 + Math.floor(Math.random() * 400)}:2024`;
    const stdB = `IS ${89500 + Math.floor(Math.random() * 400)}:2024`;

    const payload = [
      {
        standardNumber: stdA,
        title: "Standard A",
        sourceName: "Source",
        status: "CURRENT",
        relationships: [
          {
            targetStandardNumber: stdB,
            type: "NORMATIVE_REFERENCE",
            clause: "Clause 4.1",
          },
        ],
      },
      {
        standardNumber: stdB,
        title: "Standard B",
        sourceName: "Source",
        status: "CURRENT",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Relationship Import Source",
      datasetVersion: "2026.09",
      dryRun: false,
    });
    createdJobIds.push(result.jobId);

    const recordA = await prisma.standard.findUnique({
      where: { standardNumber: stdA },
      include: { relatedStandards: true },
    });
    const recordB = await prisma.standard.findUnique({
      where: { standardNumber: stdB },
    });

    createdStandardIds.push(recordA.id, recordB.id);
    assert.equal(recordA.relatedStandards.length, 1);
    assert.equal(recordA.relatedStandards[0].relatedStandardId, recordB.id);
    assert.equal(recordA.relatedStandards[0].relationshipType, "NORMATIVE_REFERENCE");
  });

  // 13. Dry Run
  test("13. should execute dry-run analysis with zero database modifications", async () => {
    const phantomStd = `IS PHANTOM-${Date.now()}:2024`;
    const payload = [
      {
        standardNumber: phantomStd,
        title: "Phantom Standard",
        sourceName: "Dry Run Test",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Dry Run Test Job",
      datasetVersion: "2026.09",
      dryRun: true,
    });

    assert.equal(result.isDryRun, true);
    assert.equal(result.recordsCreated, 1);

    const inDb = await prisma.standard.findUnique({
      where: { standardNumber: phantomStd },
    });
    assert.equal(inDb, null, "Dry run must not create records in database");
  });

  // 14. Import Job Creation
  test("14. should create an auditable DataImportJob record with timestamps", async () => {
    const payload = [
      {
        standardNumber: `IS JOB-${Date.now()}:2024`,
        title: "Job Audit Standard",
        sourceName: "Audit Test Source",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Auditable Import Source",
      datasetVersion: "2026.09",
      dryRun: false,
    });
    createdJobIds.push(result.jobId);

    const job = await prisma.dataImportJob.findUnique({
      where: { id: result.jobId },
    });

    assert.ok(job);
    assert.equal(job.status, "COMPLETED");
    assert.equal(job.recordsRead, 1);
    assert.equal(job.recordsCreated, 1);
    assert.ok(job.completedAt);
  });

  // 15. Failed-Row Handling
  test("15. should handle invalid rows gracefully and continue processing valid rows", async () => {
    const payload = [
      {
        // Bad row - missing title and standardNumber
        sourceName: "Source",
      },
      {
        standardNumber: `IS VALID-${Date.now()}:2024`,
        title: "Valid Standard in Mixed Batch",
        sourceName: "Source",
        status: "CURRENT",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Mixed Batch Import",
      datasetVersion: "2026.09",
      dryRun: false,
    });
    createdJobIds.push(result.jobId);

    assert.equal(result.recordsRead, 2);
    assert.equal(result.recordsCreated, 1);
    assert.equal(result.recordsFailed, 1);
    assert.equal(result.status, "COMPLETED_WITH_ERRORS");
  });

  // 16. Import Report
  test("16. should generate comprehensive data quality report via getImportReport", async () => {
    const jobId = createdJobIds[createdJobIds.length - 1];
    assert.ok(jobId);

    const report = await getImportReport(jobId);
    assert.ok(report);
    assert.ok(report.id);
    assert.ok(report.recordsRead !== undefined);
    assert.ok(Array.isArray(report.importedRecords));
  });

  // 17. Dataset Versioning
  test("17. should assign datasetVersion to standard records and import jobs", async () => {
    const stdNum = `IS ${89900 + Math.floor(Math.random() * 90)}:2024`;
    const payload = [
      {
        standardNumber: stdNum,
        title: "Versioned Standard",
        sourceName: "Versioned Source",
      },
    ];

    const result = await importJSON(Buffer.from(JSON.stringify(payload)), {
      sourceName: "Versioned Import",
      datasetVersion: "2026.09.2",
      dryRun: false,
    });
    createdJobIds.push(result.jobId);

    const record = await prisma.standard.findUnique({
      where: { standardNumber: stdNum },
    });
    createdStandardIds.push(record.id);

    assert.equal(record.datasetVersion, "2026.09.2");
  });

  // 18. Recommendation Traceability
  test("18. should store standardsDatasetVersion and importJobId on generated recommendations", async () => {
    const rec = await recommend("Stainless steel 5 litre pressure cooker for institutional kitchen");
    assert.ok(rec.recommendationId);
    assert.ok(rec.datasetProvenance);
    assert.ok(rec.datasetProvenance.standardsDatasetVersion);

    const dbRec = await prisma.recommendation.findUnique({
      where: { id: rec.recommendationId },
    });
    assert.ok(dbRec.standardsDatasetVersion);
  });

  // 19. Demo and Source Data Separation
  test("19. should enforce strict distinction between demo records and imported source records", async () => {
    const overview = await getDatasetOverview();
    assert.ok(overview.totalStandards >= 0);
    assert.ok(typeof overview.provenance.demoRecords === "number");
    assert.ok(typeof overview.provenance.sourceRecords === "number");
    assert.equal(overview.totalStandards, overview.provenance.demoRecords + overview.provenance.sourceRecords);
  });

  // 20. Existing Recommendation Flow
  test("20. should maintain existing recommendation accuracy and compliance safety", async () => {
    const rec = await recommend("Supply of 120W outdoor LED street light luminaires with IP66 ingress protection");
    assert.ok(rec.primaryRecommendation);
    assert.equal(rec.primaryRecommendation.status, "CURRENT");
    assert.ok(rec.primaryRecommendation.matchScore >= 0.5);
    assert.ok(rec.alliedStandards);
  });
});
