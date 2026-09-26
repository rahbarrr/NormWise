/**
 * NormWise Evaluation Routes (Phase 17)
 */
import { Router } from "express";
import {
  triggerEvaluationRun,
  listEvaluationRuns,
  getEvaluationRunDetails,
  exportEvaluationReport,
  getAvailableCases,
  evaluateSingleCase,
} from "../controllers/evaluation.controller.js";

const router = Router();

router.post("/run", triggerEvaluationRun);
router.get("/runs", listEvaluationRuns);
router.get("/runs/:id", getEvaluationRunDetails);
router.get("/:id/report", exportEvaluationReport);
router.get("/cases", getAvailableCases);
router.post("/case", evaluateSingleCase);

export default router;
