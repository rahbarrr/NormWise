import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import prisma from "../config/db.js";
import {
  standardNormalizationService,
  normalizeStandardNumber,
  normalizeStatus,
  normalizeTitle,
  normalizeTerm,
} from "./standardNormalizationService.js";

const DEFAULT_BATCH_SIZE = 100;

/**
 * Validates raw standard record against required schema.
 * Required: standardNumber, title, sourceName
 */
export function validateRecord(record) {
  const errors = [];

  if (!record || typeof record !== "object") {
    return { isValid: false, errors: ["Record must be an object"] };
  }

  const rawNumber = String(record.standardNumber || record.code || record.id || "").trim();
  if (!rawNumber) {
    errors.push("Missing required field: standardNumber");
  }

  const rawTitle = String(record.title || record.name || "").trim();
  if (!rawTitle) {
    errors.push("Missing required field: title");
  }

  const sourceName = String(record.sourceName || record.source || "").trim();
  if (!sourceName) {
    errors.push("Missing required field: sourceName");
  }

  const normalizedNumber = normalizeStandardNumber(rawNumber);
  if (!normalizedNumber.isValid) {
    errors.push(`Invalid standard identifier format: "${rawNumber}"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedNumber,
  };
}

/**
 * Normalizes record into structured standard schema
 */
export function normalizeRecord(rawRecord, options = {}) {
  const normId = normalizeStandardNumber(
    rawRecord.standardNumber || rawRecord.code || rawRecord.id || ""
  );

  const status = normalizeStatus(rawRecord.status || rawRecord.currentness || "CURRENT");
  const title = normalizeTitle(rawRecord.title || rawRecord.name || "");
  const shortTitle = rawRecord.shortTitle ? normalizeTitle(rawRecord.shortTitle) : null;
  const sourceName = (rawRecord.sourceName || options.sourceName || "Authorized Dataset").trim();
  const datasetVersion = (rawRecord.datasetVersion || options.datasetVersion || "2026.09").trim();
  const isDemo = options.isDemo !== undefined ? Boolean(options.isDemo) : Boolean(rawRecord.isDemo);

  // Arrays
  const keywords = Array.isArray(rawRecord.keywords)
    ? rawRecord.keywords.map(normalizeTerm).filter(Boolean)
    : typeof rawRecord.keywords === "string"
    ? rawRecord.keywords.split(",").map(normalizeTerm).filter(Boolean)
    : [];

  const applicableProducts = Array.isArray(rawRecord.applicableProducts)
    ? rawRecord.applicableProducts.map((p) => String(p).trim()).filter(Boolean)
    : typeof rawRecord.applicableProducts === "string"
    ? rawRecord.applicableProducts.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const materials = Array.isArray(rawRecord.materials)
    ? rawRecord.materials.map((m) => String(m).trim()).filter(Boolean)
    : typeof rawRecord.materials === "string"
    ? rawRecord.materials.split(",").map((m) => m.trim()).filter(Boolean)
    : [];

  const applications = Array.isArray(rawRecord.applications)
    ? rawRecord.applications.map((a) => String(a).trim()).filter(Boolean)
    : typeof rawRecord.applications === "string"
    ? rawRecord.applications.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  // Parse publication date safely
  let publicationDate = null;
  if (rawRecord.publicationDate) {
    const d = new Date(rawRecord.publicationDate);
    if (!isNaN(d.getTime())) {
      publicationDate = d;
    }
  }

  return {
    standardNumber: normId.canonical,
    title,
    shortTitle,
    edition: rawRecord.edition ? String(rawRecord.edition).trim() : normId.year || null,
    revision: rawRecord.revision ? String(rawRecord.revision).trim() : null,
    status,
    category: rawRecord.category ? String(rawRecord.category).trim() : null,
    technicalDomain: rawRecord.technicalDomain ? String(rawRecord.technicalDomain).trim() : null,
    description: rawRecord.description ? String(rawRecord.description).trim() : null,
    scope: rawRecord.scope ? String(rawRecord.scope).trim() : null,
    language: rawRecord.language ? String(rawRecord.language).trim() : "en",
    sourceName,
    sourceReference: rawRecord.sourceReference ? String(rawRecord.sourceReference).trim() : null,
    sourceUrl: rawRecord.sourceUrl ? String(rawRecord.sourceUrl).trim() : null,
    isDemo,
    datasetVersion,
    publicationDate,
    keywords,
    applicableProducts,
    materials,
    applications,
    searchKey: normId.searchKey,
    amendments: Array.isArray(rawRecord.amendments) ? rawRecord.amendments : [],
    relationships: Array.isArray(rawRecord.relationships) ? rawRecord.relationships : [],
  };
}

/**
 * Checks for conflicts between existing and incoming record
 */
export function detectConflicts(existing, incoming) {
  const conflicts = [];

  if (existing.status && incoming.status && existing.status !== incoming.status) {
    conflicts.push({
      field: "status",
      existingValue: existing.status,
      incomingValue: incoming.status,
      message: `Status divergence: database has "${existing.status}", incoming record specifies "${incoming.status}".`,
    });
  }

  if (
    existing.title &&
    incoming.title &&
    existing.title.toLowerCase().trim() !== incoming.title.toLowerCase().trim()
  ) {
    conflicts.push({
      field: "title",
      existingValue: existing.title,
      incomingValue: incoming.title,
      message: "Title divergence between existing record and incoming source.",
    });
  }

  return conflicts;
}

/**
 * Standards Ingestion Engine
 */
export const standardsImportService = {
  /**
   * Imports standards from parsed JSON array
   */
  async importJSON(records, options = {}) {
    let rawArray;
    if (Buffer.isBuffer(records)) {
      const parsed = JSON.parse(records.toString("utf-8"));
      rawArray = Array.isArray(parsed) ? parsed : [parsed];
    } else if (typeof records === "string") {
      if (fs.existsSync(records)) {
        const parsed = JSON.parse(fs.readFileSync(records, "utf-8"));
        rawArray = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        const parsed = JSON.parse(records);
        rawArray = Array.isArray(parsed) ? parsed : [parsed];
      }
    } else if (Array.isArray(records)) {
      rawArray = records;
    } else {
      rawArray = [records];
    }

    return await standardsImportService.processRecords(rawArray, {
      ...options,
      sourceType: "JSON",
    });
  },

  /**
   * Imports standards from CSV string, buffer, or file path
   */
  async importCSV(contentOrPath, options = {}) {
    let rawText = "";

    if (typeof contentOrPath === "string") {
      if (fs.existsSync(contentOrPath)) {
        rawText = fs.readFileSync(contentOrPath, "utf-8");
      } else {
        rawText = contentOrPath;
      }
    } else if (Buffer.isBuffer(contentOrPath)) {
      rawText = contentOrPath.toString("utf-8");
    }

    const workbook = XLSX.read(rawText, { type: "string" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const records = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    return await standardsImportService.processRecords(records, {
      ...options,
      sourceType: "CSV",
    });
  },

  /**
   * Imports standards from XLSX buffer or file path
   */
  async importXLSX(bufferOrPath, options = {}) {
    let workbook;

    if (typeof bufferOrPath === "string" && fs.existsSync(bufferOrPath)) {
      workbook = XLSX.readFile(bufferOrPath);
    } else if (Buffer.isBuffer(bufferOrPath)) {
      workbook = XLSX.read(bufferOrPath, { type: "buffer" });
    } else {
      throw new Error("Invalid XLSX file or buffer provided");
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const records = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    return await standardsImportService.processRecords(records, {
      ...options,
      sourceType: "XLSX",
    });
  },

  /**
   * Core Batch Ingestion & Validation Pipeline
   */
  async processRecords(rawRecords, options = {}) {
    const startTime = Date.now();
    const dryRun = Boolean(options.dryRun);
    const sourceName = options.sourceName || "Authorized Standards Repository";
    const sourceType = options.sourceType || "UNKNOWN";
    const datasetVersion = options.datasetVersion || "2026.09";
    const filename = options.filename || null;
    const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;

    // 1. Create or initialize DataImportJob
    let importJob = null;
    if (!dryRun) {
      importJob = await prisma.dataImportJob.create({
        data: {
          sourceName,
          sourceType,
          datasetVersion,
          filename,
          status: "PROCESSING",
          recordsRead: rawRecords.length,
          isDryRun: false,
          startedAt: new Date(),
        },
      });
    }

    const pendingRelationships = [];

    const report = {
      jobId: importJob?.id || "DRY_RUN",
      isDryRun: dryRun,
      sourceName,
      sourceType,
      datasetVersion,
      totalRead: rawRecords.length,
      created: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      failed: 0,
      conflicts: [],
      qualityErrors: [],
      durationMs: 0,
    };

    // 2. Iterate in batches
    for (let i = 0; i < rawRecords.length; i += batchSize) {
      const batch = rawRecords.slice(i, i + batchSize);

      for (let j = 0; j < batch.length; j++) {
        const rawRow = batch[j];
        const rowNumber = i + j + 1;

        // A. Validation
        const valRes = validateRecord({
          sourceName,
          ...rawRow,
        });

        if (!valRes.isValid) {
          report.failed++;
          report.qualityErrors.push({
            row: rowNumber,
            rawIdentifier: rawRow.standardNumber || rawRow.code || "(missing)",
            errors: valRes.errors,
          });

          if (!dryRun && importJob) {
            await prisma.importedStandardRecord.create({
              data: {
                importJobId: importJob.id,
                rawIdentifier: String(rawRow.standardNumber || rawRow.code || `Row-${rowNumber}`),
                rawData: rawRow,
                validationStatus: "INVALID",
                validationError: valRes.errors.join("; "),
              },
            }).catch(() => null);
          }
          continue;
        }

        // B. Normalization
        const norm = normalizeRecord(rawRow, {
          sourceName,
          datasetVersion,
          isDemo: options.isDemo,
        });

        // C. Duplicate and conflict check against database
        const existing = await prisma.standard.findUnique({
          where: { standardNumber: norm.standardNumber },
          include: { amendments: true },
        });

        if (existing) {
          const conflicts = detectConflicts(existing, norm);
          if (conflicts.length > 0) {
            report.conflicts.push({
              standardNumber: norm.standardNumber,
              conflicts,
            });
          }

          if (dryRun) {
            report.updated++;
          } else {
            // Null-field protection: only update non-null fields
            const updatePayload = {
              title: norm.title || existing.title,
              shortTitle: norm.shortTitle ?? existing.shortTitle,
              edition: norm.edition ?? existing.edition,
              revision: norm.revision ?? existing.revision,
              publicationDate: norm.publicationDate ?? existing.publicationDate,
              status: conflicts.some((c) => c.field === "status") ? "UNDER_REVIEW" : norm.status,
              category: norm.category ?? existing.category,
              technicalDomain: norm.technicalDomain ?? existing.technicalDomain,
              description: norm.description ?? existing.description,
              scope: norm.scope ?? existing.scope,
              sourceName: norm.sourceName || existing.sourceName,
              sourceReference: norm.sourceReference ?? existing.sourceReference,
              sourceUrl: norm.sourceUrl ?? existing.sourceUrl,
              datasetVersion: norm.datasetVersion ?? existing.datasetVersion,
              importJobId: importJob.id,
              keywords: norm.keywords.length > 0 ? Array.from(new Set([...existing.keywords, ...norm.keywords])) : existing.keywords,
              applicableProducts: norm.applicableProducts.length > 0 ? Array.from(new Set([...existing.applicableProducts, ...norm.applicableProducts])) : existing.applicableProducts,
              materials: norm.materials.length > 0 ? Array.from(new Set([...existing.materials, ...norm.materials])) : existing.materials,
              applications: norm.applications.length > 0 ? Array.from(new Set([...existing.applications, ...norm.applications])) : existing.applications,
            };

            const updatedStandard = await prisma.standard.update({
              where: { id: existing.id },
              data: updatePayload,
            });

            // Import amendments if present
            if (norm.amendments && norm.amendments.length > 0) {
              await standardsImportService.upsertAmendments(updatedStandard.id, norm.amendments);
            }

            // Save staging record
            await prisma.importedStandardRecord.create({
              data: {
                importJobId: importJob.id,
                rawIdentifier: norm.standardNumber,
                normalizedIdentifier: norm.standardNumber,
                rawTitle: norm.title,
                rawData: rawRow,
                validationStatus: conflicts.length > 0 ? "CONFLICT" : "VALID",
                validationError: conflicts.length > 0 ? "Field divergences marked for review" : null,
              },
            }).catch(() => null);

            report.updated++;
          }
        } else {
          // New standard
          if (dryRun) {
            report.created++;
          } else {
            const createdStandard = await prisma.standard.create({
              data: {
                standardNumber: norm.standardNumber,
                title: norm.title,
                shortTitle: norm.shortTitle,
                edition: norm.edition,
                revision: norm.revision,
                publicationDate: norm.publicationDate,
                status: norm.status,
                category: norm.category,
                technicalDomain: norm.technicalDomain,
                description: norm.description,
                scope: norm.scope,
                language: norm.language,
                sourceName: norm.sourceName,
                sourceReference: norm.sourceReference,
                sourceUrl: norm.sourceUrl,
                isDemo: norm.isDemo,
                datasetVersion: norm.datasetVersion,
                importJobId: importJob.id,
                keywords: norm.keywords,
                applicableProducts: norm.applicableProducts,
                materials: norm.materials,
                applications: norm.applications,
              },
            });

            // Save terminology tokens in StandardTerm table
            if (norm.keywords.length > 0) {
              for (const kw of norm.keywords) {
                await prisma.standardTerm.upsert({
                  where: {
                    normalizedTerm_category: {
                      normalizedTerm: kw,
                      category: norm.category || "GENERAL",
                    },
                  },
                  update: {},
                  create: {
                    term: kw,
                    normalizedTerm: kw,
                    category: norm.category || "GENERAL",
                    sourceStandardId: createdStandard.id,
                  },
                }).catch(() => null);
              }
            }

            // Import amendments if present
            if (norm.amendments && norm.amendments.length > 0) {
              await standardsImportService.upsertAmendments(createdStandard.id, norm.amendments);
            }

            // Save staging record
            await prisma.importedStandardRecord.create({
              data: {
                importJobId: importJob.id,
                rawIdentifier: norm.standardNumber,
                normalizedIdentifier: norm.standardNumber,
                rawTitle: norm.title,
                rawData: rawRow,
                validationStatus: "VALID",
              },
            }).catch(() => null);

            report.created++;
          }

          if (rawRow.relationships && Array.isArray(rawRow.relationships)) {
            for (const rel of rawRow.relationships) {
              pendingRelationships.push({
                sourceStandardNumber: norm.standardNumber,
                targetStandardNumber: rel.targetStandardNumber || rel.target,
                relationshipType: rel.relationshipType || rel.type,
                clause: rel.clause,
                description: rel.description,
              });
            }
          }
        }
      }
    }

    // 2b. Import relationships after all standards in batch are upserted
    if (pendingRelationships.length > 0) {
      await standardsImportService.importRelationships(pendingRelationships, { dryRun });
    }

    report.durationMs = Date.now() - startTime;

    // 3. Finalize DataImportJob
    if (!dryRun && importJob) {
      const finalStatus = report.failed > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
      report.status = finalStatus;

      await prisma.dataImportJob.update({
        where: { id: importJob.id },
        data: {
          status: finalStatus,
          recordsCreated: report.created,
          recordsUpdated: report.updated,
          recordsSkipped: report.skipped,
          recordsFailed: report.failed,
          errorSummary: report.qualityErrors,
          report: report,
          completedAt: new Date(),
        },
      });

      // Audit Event
      await prisma.auditEvent.create({
        data: {
          action: "DATASET_IMPORTED",
          details: `Dataset imported from source: ${sourceName} (${sourceType}). Version: ${datasetVersion}. Created: ${report.created}, Updated: ${report.updated}, Failed: ${report.failed}. Job ID: ${importJob.id}`,
        },
      }).catch(() => null);
    }

    report.recordsRead = report.totalRead;
    report.recordsCreated = report.created;
    report.recordsUpdated = report.updated;
    report.recordsSkipped = report.skipped;
    report.recordsFailed = report.failed;

    return report;
  },

  /**
   * Upserts amendments for a standard without duplicates
   */
  async upsertAmendments(standardId, amendments = []) {
    for (const am of amendments) {
      const amNum = String(am.amendmentNumber || am.number || "").trim();
      if (!amNum) continue;

      const existingAm = await prisma.standardAmendment.findFirst({
        where: { standardId, amendmentNumber: amNum },
      });

      const date = am.date ? new Date(am.date) : null;
      const effectiveDate = am.effectiveDate ? new Date(am.effectiveDate) : null;

      if (existingAm) {
        await prisma.standardAmendment.update({
          where: { id: existingAm.id },
          data: {
            date: date ?? existingAm.date,
            effectiveDate: effectiveDate ?? existingAm.effectiveDate,
            description: am.description ?? existingAm.description,
            sourceReference: am.sourceReference ?? existingAm.sourceReference,
            status: am.status ?? existingAm.status,
          },
        });
      } else {
        await prisma.standardAmendment.create({
          data: {
            standardId,
            amendmentNumber: amNum,
            date,
            effectiveDate,
            description: am.description || null,
            sourceReference: am.sourceReference || null,
            status: am.status || "ACTIVE",
          },
        });
      }
    }
  },

  /**
   * Imports directional relationships from source dataset
   */
  async importRelationships(relationships = [], options = {}) {
    const dryRun = Boolean(options.dryRun);
    const results = {
      total: relationships.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const ALLOWED_REL_TYPES = [
      "NORMATIVE_REFERENCE",
      "TERMINOLOGY",
      "TEST_METHOD",
      "SAFETY",
      "INSTALLATION",
      "EQUIVALENT",
      "SUPERSEDED_BY",
      "AMENDED_BY",
      "MANDATORY_UNDER",
      "APPLIES_TO",
      "COMPONENT",
      "MATERIAL",
      "OTHER",
    ];

    for (const rel of relationships) {
      const sourceNorm = normalizeStandardNumber(rel.sourceStandardNumber || rel.source || "");
      const targetNorm = normalizeStandardNumber(rel.targetStandardNumber || rel.target || "");

      if (!sourceNorm.isValid || !targetNorm.isValid) {
        results.errors.push(`Invalid relationship standard numbers: "${rel.source}" -> "${rel.target}"`);
        results.skipped++;
        continue;
      }

      if (sourceNorm.canonical === targetNorm.canonical) {
        results.errors.push(`Rejected self-referencing relationship: ${sourceNorm.canonical}`);
        results.skipped++;
        continue;
      }

      const relType = String(rel.relationshipType || rel.type || "OTHER").toUpperCase();
      if (!ALLOWED_REL_TYPES.includes(relType)) {
        results.errors.push(`Unmapped relationship type: "${relType}" for ${sourceNorm.canonical} -> ${targetNorm.canonical}`);
        results.skipped++;
        continue;
      }

      if (!dryRun) {
        const sourceStd = await prisma.standard.findUnique({ where: { standardNumber: sourceNorm.canonical } });
        const targetStd = await prisma.standard.findUnique({ where: { standardNumber: targetNorm.canonical } });

        if (!sourceStd || !targetStd) {
          results.errors.push(`Standards not found in database: "${sourceNorm.canonical}" or "${targetNorm.canonical}"`);
          results.skipped++;
          continue;
        }

        await prisma.relatedStandard.upsert({
          where: {
            standardId_relatedStandardId_relationshipType: {
              standardId: sourceStd.id,
              relatedStandardId: targetStd.id,
              relationshipType: relType,
            },
          },
          update: {
            notes: rel.notes || null,
          },
          create: {
            standardId: sourceStd.id,
            relatedStandardId: targetStd.id,
            relationshipType: relType,
            notes: rel.notes || null,
            status: rel.status || "ACTIVE",
          },
        }).catch((err) => {
          results.errors.push(`Error inserting relationship: ${err.message}`);
        });

        results.imported++;
      } else {
        results.imported++;
      }
    }

    return results;
  },

  /**
   * Retrieves summary report for a specific import job
   */
  async getImportReport(jobId) {
    const job = await prisma.dataImportJob.findUnique({
      where: { id: jobId },
      include: {
        importedRecords: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return job;
  },

  /**
   * Retrieves list of all import jobs
   */
  async getImportJobs(limit = 20) {
    return await prisma.dataImportJob.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Retrieves dataset overview metrics
   */
  async getDatasetOverview() {
    const totalStandards = await prisma.standard.count();
    const currentCount = await prisma.standard.count({ where: { status: "CURRENT" } });
    const supersededCount = await prisma.standard.count({ where: { status: "SUPERSEDED" } });
    const withdrawnCount = await prisma.standard.count({ where: { status: "WITHDRAWN" } });
    const unknownCount = await prisma.standard.count({ where: { status: "UNKNOWN" } });
    const underReviewCount = await prisma.standard.count({ where: { status: "UNDER_REVIEW" } });
    const demoCount = await prisma.standard.count({ where: { isDemo: true } });
    const nonDemoCount = await prisma.standard.count({ where: { isDemo: false } });

    const latestJob = await prisma.dataImportJob.findFirst({
      where: { status: { in: ["COMPLETED", "COMPLETED_WITH_ERRORS"] } },
      orderBy: { completedAt: "desc" },
    });

    return {
      totalStandards,
      statusBreakdown: {
        CURRENT: currentCount,
        SUPERSEDED: supersededCount,
        WITHDRAWN: withdrawnCount,
        UNKNOWN: unknownCount,
        UNDER_REVIEW: underReviewCount,
      },
      provenance: {
        demoRecords: demoCount,
        sourceRecords: nonDemoCount,
      },
      latestImport: latestJob
        ? {
            jobId: latestJob.id,
            sourceName: latestJob.sourceName,
            datasetVersion: latestJob.datasetVersion,
            completedAt: latestJob.completedAt,
            recordsRead: latestJob.recordsRead,
            recordsCreated: latestJob.recordsCreated,
            recordsUpdated: latestJob.recordsUpdated,
          }
        : null,
    };
  },
};

export const {
  importJSON,
  importCSV,
  importXLSX,
  processRecords,
  upsertAmendments,
  importRelationships,
  getImportReport,
  getImportJobs,
  getDatasetOverview,
} = standardsImportService;
