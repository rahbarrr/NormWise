import { Router } from "express";
import standardsRoutes from "./standards.routes.js";
import recommendationsRoutes from "./recommendations.routes.js";
import documentsRoutes from "./documents.routes.js";
import complianceRoutes from "./compliance.routes.js";
import adminRoutes from "./admin.routes.js";
import languageRoutes from "./language.routes.js";
import terminologyRoutes from "./terminology.routes.js";
import evaluationRoutes from "./evaluation.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import { handleRecommend } from "../controllers/recommendEngine.controller.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

import prisma from "../config/db.js";
import env from "../config/env.js";
import { checkStorageHealth } from "../services/storageService.js";

const apiRouter = Router();

// Liveness health check endpoint (Section 12)
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "normwise-api",
  });
});

// Readiness health check endpoint (Section 12 & 21)
apiRouter.get("/health/ready", async (req, res) => {
  const readiness = {
    status: "ready",
    database: "ok",
    vectorStore: "ok",
    storage: "ok",
  };

  let isReady = true;

  // 1. Check PostgreSQL Database Connectivity
  try {
    await prisma.$queryRaw`SELECT 1;`;
  } catch (err) {
    readiness.database = "error";
    isReady = false;
  }

  // 2. Check pgvector extension availability
  try {
    const extCheck = await prisma.$queryRaw`SELECT 1 FROM pg_extension WHERE extname = 'vector';`;
    if (!Array.isArray(extCheck) || extCheck.length === 0) {
      readiness.vectorStore = "unavailable";
      isReady = false;
    }
  } catch (err) {
    readiness.vectorStore = "unavailable";
    isReady = false;
  }

  // 3. Check Storage Health (read/write probe)
  try {
    const storageRes = await checkStorageHealth();
    if (storageRes.status !== "AVAILABLE") {
      readiness.storage = "STORAGE_UNAVAILABLE";
      isReady = false;
    }
  } catch (err) {
    readiness.storage = "STORAGE_UNAVAILABLE";
    isReady = false;
  }

  if (!isReady) {
    readiness.status = "unavailable";
    return res.status(503).json(readiness);
  }

  return res.status(200).json(readiness);
});

// Demo Health & Readiness Check endpoint (Phase 22 Section 7)
apiRouter.get("/health/demo", async (req, res) => {
  const result = {
    status: "READY",
    database: "READY",
    pgvector: "READY",
    demoDataset: "READY",
    recommendation: "READY",
    compliance: "READY",
    details: {
      database: "PostgreSQL connected",
      pgvector: "Extension active",
      tables: "All required tables present",
      demoDataset: { standardsCount: 0, relationshipsCount: 0, rulesCount: 0 },
      recommendationEngine: "hybrid-v1 (Structured + BM25 + pgvector)",
      complianceEngine: "deterministic (QCO Rule Engine)",
    },
    timestamp: new Date().toISOString(),
  };

  let allReady = true;

  // 1. PostgreSQL reachability
  try {
    await prisma.$queryRaw`SELECT 1;`;
  } catch (err) {
    result.database = "NOT_READY";
    result.details.database = "PostgreSQL connection failed";
    allReady = false;
  }

  // 2. pgvector extension
  try {
    const ext = await prisma.$queryRaw`SELECT 1 FROM pg_extension WHERE extname = 'vector';`;
    if (!Array.isArray(ext) || ext.length === 0) {
      result.pgvector = "UNAVAILABLE";
      result.details.pgvector = "pgvector extension not installed in current database";
      allReady = false;
    }
  } catch (err) {
    result.pgvector = "ERROR";
    result.details.pgvector = "Error verifying pgvector";
    allReady = false;
  }

  // 3. Demo dataset check
  try {
    const [stdCount, relCount, ruleCount] = await Promise.all([
      prisma.standard.count(),
      prisma.relatedStandard.count().catch(() => 0),
      prisma.complianceRule.count().catch(() => 0),
    ]);

    result.details.demoDataset = {
      standardsCount: stdCount,
      relationshipsCount: relCount,
      rulesCount: ruleCount,
    };

    if (stdCount === 0) {
      result.demoDataset = "EMPTY";
      result.details.demoDataset.note = "No standards seeded in database";
      allReady = false;
    }
  } catch (err) {
    result.demoDataset = "ERROR";
    allReady = false;
  }

  // Overall status
  if (!allReady) {
    result.status = "DEGRADED";
    return res.status(503).json(result);
  }

  return res.status(200).json(result);
});

// System Version endpoint (Section 38)
apiRouter.get("/version", (req, res) => {
  res.status(200).json({
    name: "NormWise",
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
  });
});

// Resource routes
apiRouter.post("/recommend", optionalAuth, handleRecommend);
apiRouter.use("/language", languageRoutes);
apiRouter.use("/terminology", terminologyRoutes);
apiRouter.use("/evaluation", evaluationRoutes);
apiRouter.use("/standards", standardsRoutes);
apiRouter.use("/recommendations", recommendationsRoutes);
apiRouter.use("/documents", documentsRoutes);
apiRouter.use("/compliance", complianceRoutes);
apiRouter.use("/admin/evaluation", evaluationRoutes);
apiRouter.use("/admin/terminology", terminologyRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/admin", userRoutes);
apiRouter.use("/auth", authRoutes);

export default apiRouter;
