import { Router } from "express";
import * as standardsController from "../controllers/standards.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", standardsController.getStandards);
router.get("/:id", standardsController.getStandardById);
router.post(
  "/",
  validate(standardsController.createStandardSchema),
  standardsController.createStandard
);

export default router;
