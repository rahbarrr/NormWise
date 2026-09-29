import { Router } from "express";
import { handleSprint2Recommend } from "../controllers/sprint2Recommend.controller.js";
import env from "../config/env.js";
import supabase from "../config/supabase.js";

const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "normwise-api" });
});

apiRouter.get("/health/ready", async (req, res) => {
  const readiness = { status: "ready", database: "ok", storage: "not_required" };
  const { error } = await supabase.from("standards").select("id").limit(1);
  if (error) {
    readiness.status = "unavailable";
    readiness.database = "error";
    return res.status(503).json(readiness);
  }
  return res.status(200).json(readiness);
});

apiRouter.get("/health/demo", async (req, res) => {
  const { count, error } = await supabase.from("standards").select("id", { count: "exact", head: true });
  if (error) return res.status(503).json({ status: "DEGRADED", database: "NOT_READY", error: "Supabase unavailable" });
  return res.status(200).json({ status: "READY", database: "READY", demoDataset: "READY", details: { standardsCount: count ?? 0, source: "supabase" }, timestamp: new Date().toISOString() });
});

apiRouter.get("/version", (req, res) => {
  res.status(200).json({ name: "NormWise", version: env.APP_VERSION, environment: env.NODE_ENV });
});

apiRouter.post("/recommend", handleSprint2Recommend);

export default apiRouter;
