import { Router } from "express";
import {
  getTerminology,
  createTerm,
  updateTerm,
  approveTerm,
  rejectTerm,
  deleteTerm,
} from "../controllers/terminology.controller.js";

const router = Router();

router.get("/", getTerminology);
router.post("/", createTerm);
router.put("/:id", updateTerm);
router.post("/:id/approve", approveTerm);
router.post("/:id/reject", rejectTerm);
router.delete("/:id", deleteTerm);

export default router;
