import { Router } from "express";
import * as recController from "../controllers/recommendations.controller.js";
import * as reviewController from "../controllers/review.controller.js";
import * as evidenceController from "../controllers/evidence.controller.js";
import * as auditController from "../controllers/audit.controller.js";
import { complianceController } from "../controllers/compliance.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { forbidSelfApproval } from "../middleware/authorizationMiddleware.js";

const router = Router();

// Recommendation Core
router.get("/", optionalAuth, recController.getRecommendations);
router.get("/:id", optionalAuth, recController.getRecommendationById);
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

// Decision Endpoints (Role & self-approval guardrails)
router.post(
  "/:id/accept",
  optionalAuth,
  forbidSelfApproval,
  validate(reviewController.acceptSchema),
  reviewController.acceptRecommendation
);
router.post(
  "/:id/request-review",
  optionalAuth,
  validate(reviewController.requestReviewSchema),
  reviewController.requestTechnicalReview
);
router.post(
  "/:id/request-clarification",
  optionalAuth,
  forbidSelfApproval,
  validate(reviewController.requestClarificationSchema),
  reviewController.requestClarification
);
router.post(
  "/:id/not-applicable",
  optionalAuth,
  forbidSelfApproval,
  validate(reviewController.notApplicableSchema),
  reviewController.markNotApplicable
);

// Audit Trail Sub-routes
router.get("/:id/audit", auditController.getAuditEventsByRecommendationId);

// Compliance Sub-routes
router.get("/:id/compliance", complianceController.getRecommendationCompliance);

export default router;
