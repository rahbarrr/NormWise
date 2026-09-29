import { Router } from "express";
import * as standardsController from "../controllers/standards.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Standards basic endpoints
router.get("/", standardsController.getStandards);
router.get("/:id", standardsController.getStandardById);
router.post(
  "/",
  validate(standardsController.createStandardSchema),
  standardsController.createStandard
);

// Phase 12: Allied Standards & Knowledge Graph endpoints
router.get("/:id/related", standardsController.getRelatedStandardsHandler);
router.get("/:id/graph", standardsController.getStandardGraphHandler);
router.post(
  "/:id/related",
  validate(standardsController.createRelationshipSchema),
  standardsController.createStandardRelationship
);
router.patch(
  "/:id/related/:relationshipId",
  validate(standardsController.updateRelationshipSchema),
  standardsController.updateStandardRelationship
);
router.delete(
  "/:id/related/:relationshipId",
  standardsController.deleteStandardRelationship
);

export default router;
