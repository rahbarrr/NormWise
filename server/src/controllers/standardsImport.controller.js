import fs from "fs";
import { standardsImportService, validateRecord, normalizeRecord } from "../services/standardsImportService.js";

/**
 * Controller for Standards Ingestion & Administration
 */
export const standardsImportController = {
  /**
   * POST /api/admin/standards/import
   * Supports file upload (multipart/form-data) or JSON body
   */
  async handleImport(req, res, next) {
    try {
      const isDryRun = req.query.dryRun === "true" || req.body.dryRun === true || req.body.dryRun === "true";
      const sourceName = req.body.sourceName || req.query.sourceName || "Authorized Standards Repository";
      const datasetVersion = req.body.datasetVersion || req.query.datasetVersion || "2026.09";
      const isDemo = req.body.isDemo === true || req.body.isDemo === "true" || req.query.isDemo === "true";

      const options = {
        dryRun: isDryRun,
        sourceName,
        datasetVersion,
        isDemo,
      };

      let report;

      if (req.file) {
        options.filename = req.file.originalname;
        const fileExt = req.file.originalname.split(".").pop().toLowerCase();

        if (fileExt === "json") {
          const content = JSON.parse(req.file.buffer.toString("utf-8"));
          report = await standardsImportService.importJSON(content, options);
        } else if (fileExt === "csv") {
          report = await standardsImportService.importCSV(req.file.buffer, options);
        } else if (fileExt === "xlsx" || fileExt === "xls") {
          report = await standardsImportService.importXLSX(req.file.buffer, options);
        } else {
          return res.status(400).json({
            success: false,
            error: { message: `Unsupported file extension: .${fileExt}. Allowed: .csv, .json, .xlsx` },
          });
        }
      } else if (req.body.records) {
        report = await standardsImportService.importJSON(req.body.records, options);
      } else {
        return res.status(400).json({
          success: false,
          error: { message: "No import file or records payload provided." },
        });
      }

      return res.json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/imports
   */
  async getImports(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const jobs = await standardsImportService.getImportJobs(limit);
      const overview = await standardsImportService.getDatasetOverview();

      return res.json({
        success: true,
        data: {
          jobs,
          overview,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/imports/:id
   */
  async getImportById(req, res, next) {
    try {
      const { id } = req.params;
      const job = await standardsImportService.getImportReport(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: { message: `Import job not found: ${id}` },
        });
      }

      return res.json({
        success: true,
        data: job,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/imports/:id/report
   */
  async getImportReport(req, res, next) {
    try {
      const { id } = req.params;
      const job = await standardsImportService.getImportReport(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: { message: `Import job not found: ${id}` },
        });
      }

      return res.json({
        success: true,
        data: job.report || {
          jobId: job.id,
          sourceName: job.sourceName,
          status: job.status,
          recordsRead: job.recordsRead,
          recordsCreated: job.recordsCreated,
          recordsUpdated: job.recordsUpdated,
          recordsFailed: job.recordsFailed,
          errorSummary: job.errorSummary,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/standards/validate
   * Validates single or array of standard records without saving
   */
  async validate(req, res, next) {
    try {
      const records = Array.isArray(req.body) ? req.body : [req.body];
      const results = records.map((rec, index) => {
        const val = validateRecord(rec);
        const norm = val.isValid ? normalizeRecord(rec) : null;
        return {
          index,
          isValid: val.isValid,
          errors: val.errors,
          normalized: norm,
        };
      });

      return res.json({
        success: true,
        data: {
          total: results.length,
          valid: results.filter((r) => r.isValid).length,
          invalid: results.filter((r) => !r.isValid).length,
          results,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
