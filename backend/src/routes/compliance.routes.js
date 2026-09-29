import express from "express";
import { complianceController } from "../controllers/compliance.controller.js";

const router = express.Router();

router.get("/rules", complianceController.getRules);
router.get("/rules/:id", complianceController.getRuleById);
router.post("/evaluate", complianceController.evaluate);

export default router;
