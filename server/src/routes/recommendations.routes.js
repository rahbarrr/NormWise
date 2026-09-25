import { Router } from "express";
import * as recController from "../controllers/recommendations.controller.js";
import * as reviewController from "../controllers/review.controller.js";
import * as evidenceController from "../controllers/evidence.controller.js";
import * as auditController from "../controllers/audit.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Recommendation Core
router.get("/", recController.getRecommendations);
router.get("/:id", recController.getRecommendationById);
router.post(
  "/",
  validate(recController.createRecommendationSchema),
  recController.createRecommendation
);
router.patch("/:id/save", recController.toggleSave);
router.patch("/:id/archive", recController.archive);

// Evidence Sub-routes
router.get("/:id/evidence", evidenceController.getEvidence);
router.post(
  "/:id/evidence",
  validate(evidenceController.createEvidenceSchema),
  evidenceController.createEvidence
);

// Review Sub-routes
router.get("/:id/review", reviewController.getReview);
router.post(
  "/:id/review",
  validate(reviewController.updateReviewSchema),
  reviewController.createOrUpdateReview
);
router.patch(
  "/:id/review",
  validate(reviewController.updateReviewSchema),
  reviewController.createOrUpdateReview
);

// Decision Endpoints
router.post(
  "/:id/accept",
  validate(reviewController.acceptSchema),
  reviewController.acceptRecommendation
);
router.post(
  "/:id/request-review",
  validate(reviewController.requestReviewSchema),
  reviewController.requestTechnicalReview
);
router.post(
  "/:id/request-clarification",
  validate(reviewController.requestClarificationSchema),
  reviewController.requestClarification
);
router.post(
  "/:id/not-applicable",
  validate(reviewController.notApplicableSchema),
  reviewController.markNotApplicable
);

// Audit Trail Sub-routes
router.get("/:id/audit", auditController.getAuditEventsByRecommendationId);

export default router;
