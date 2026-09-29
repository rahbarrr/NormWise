/**
 * NormWise Admin System Health & Monitoring Controller (Phase 19)
 * Gathers operational telemetry, dependency availability, and safe telemetry metrics.
 */

import prisma from "../config/db.js";
import env from "../config/env.js";
import { checkStorageHealth } from "../services/documents/storageService.js";
import metricsService from "../services/recommendation/metricsService.js";

export async function getSystemHealth(req, res) {
  try {
    // 1. Check Database
    let dbStatus = "AVAILABLE";
    try {
      await prisma.$queryRaw`SELECT 1;`;
    } catch (err) {
      dbStatus = "UNAVAILABLE";
    }

    // 2. Check pgvector
    let vectorStatus = "AVAILABLE";
    try {
      const ext = await prisma.$queryRaw`SELECT 1 FROM pg_extension WHERE extname = 'vector';`;
      if (!Array.isArray(ext) || ext.length === 0) {
        vectorStatus = "UNAVAILABLE";
      }
    } catch (err) {
      vectorStatus = "UNAVAILABLE";
    }

    // 3. Check Storage
    let storageStatus = "AVAILABLE";
    try {
      const storageCheck = await checkStorageHealth();
      if (storageCheck.status !== "AVAILABLE") {
        storageStatus = "UNAVAILABLE";
      }
    } catch (err) {
      storageStatus = "UNAVAILABLE";
    }

    // 4. External Services & Providers
    const ocrStatus = env.OCR_ENABLED ? "AVAILABLE" : "NOT_CONFIGURED";
    const llmStatus = env.LLM_API_KEY ? "AVAILABLE" : "NOT_CONFIGURED";
    const embeddingStatus = env.EMBEDDING_API_KEY ? "AVAILABLE" : "NOT_CONFIGURED";
    const translationStatus = env.TRANSLATION_API_KEY ? "AVAILABLE" : "NOT_CONFIGURED";

    // 5. Gather Telemetry
    const telemetry = metricsService.getMetrics();

    // 6. Fetch recent dataset imports (safe summary)
    let recentImports = [];
    try {
      recentImports = await prisma.datasetImportJob.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          sourceName: true,
          datasetVersion: true,
          standardsCreated: true,
          standardsUpdated: true,
          errorsCount: true,
          createdAt: true,
        },
      });
    } catch (err) {
      // Prisma table may be empty or error handled safely
      recentImports = [];
    }

    // 7. Fetch recent document processing failures (safe summary)
    let recentDocumentFailures = [];
    try {
      recentDocumentFailures = await prisma.document.findMany({
        where: { processingStatus: "FAILED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalFilename: true,
          fileType: true,
          processingError: true,
          createdAt: true,
        },
      });
    } catch (err) {
      recentDocumentFailures = [];
    }

    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        api: "AVAILABLE",
        database: dbStatus,
        pgvector: vectorStatus,
        storage: storageStatus,
        ocr: ocrStatus,
        llmProvider: llmStatus,
        embeddingProvider: embeddingStatus,
        translationProvider: translationStatus,
      },
      system: {
        name: "NormWise",
        version: env.APP_VERSION,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: telemetry.uptimeSeconds,
        memoryMb: telemetry.memoryMb,
      },
      metrics: {
        requests: telemetry.requests,
        recommendations: telemetry.recommendations,
        documents: telemetry.documents,
        embeddings: telemetry.embeddings,
      },
      recentErrors: telemetry.recentErrors,
      recentAlerts: telemetry.recentAlerts,
      recentImports,
      recentDocumentFailures,
    });
  } catch (error) {
    console.error("[AdminMonitoringController] Failed to compile system health:", error);
    return res.status(500).json({
      error: {
        code: "MONITORING_FAILED",
        message: "Failed to collect operational telemetry metrics.",
      },
    });
  }
}

export default {
  getSystemHealth,
};
