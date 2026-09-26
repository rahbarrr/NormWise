/**
 * NormWise Evaluation Routes (Phase 17 & Phase 21)
 */
import { Router } from "express";
import {
  triggerEvaluationRun,
  listEvaluationRuns,
  getEvaluationRunDetails,
  exportEvaluationReport,
  getAvailableCases,
  evaluateSingleCase,
  submitHumanFeedback,
  compareRetrievalStrategies,
} from "../controllers/evaluation.controller.js";

const router = Router();

router.post("/run", triggerEvaluationRun);
router.get("/runs", listEvaluationRuns);
router.get("/runs/:id", getEvaluationRunDetails);
router.get("/:id/report", exportEvaluationReport);
router.get("/cases", getAvailableCases);
router.post("/case", evaluateSingleCase);
router.post("/results/:id/feedback", submitHumanFeedback);
router.post("/compare-retrieval", compareRetrievalStrategies);

export default router;
