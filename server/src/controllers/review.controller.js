import * as reviewService from "../services/review.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const updateReviewSchema = z.object({
  reviewerId: z.string().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "TECHNICAL_REVIEW", "CLARIFICATION_REQUESTED", "NOT_APPLICABLE"]).optional(),
  notes: z.string().optional(),
  checklist: z
    .array(
      z.object({
        itemKey: z.string().optional(),
        id: z.string().optional(),
        label: z.string().optional(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

export const acceptSchema = z.object({
  notes: z.string().optional(),
  reviewerId: z.string().optional(),
});

export const requestReviewSchema = z.object({
  reason: z.string().min(3, "Reason for technical review is required"),
  reviewerId: z.string().optional(),
});

export const requestClarificationSchema = z.object({
  category: z.string().optional(),
  question: z.string().min(3, "Clarification question is required"),
  reviewerId: z.string().optional(),
});

export const notApplicableSchema = z.object({
  reason: z.string().min(2, "Reason is required"),
  explanation: z.string().min(3, "Explanation is required"),
  reviewerId: z.string().optional(),
});

export const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewByRecommendationId(id);
    return sendSuccess(res, review || null);
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.createOrUpdateReview(id, req.body);
    return sendSuccess(res, review);
  } catch (error) {
    next(error);
  }
};

export const acceptRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.body.reviewerId || req.user?.id;
    const rec = await reviewService.acceptRecommendation(id, { ...req.body, reviewerId });
    return sendSuccess(res, rec);
  } catch (error) {
    next(error);
  }
};

export const requestTechnicalReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.body.reviewerId || req.user?.id;
    const rec = await reviewService.requestTechnicalReview(id, { ...req.body, reviewerId });
    return sendSuccess(res, rec);
  } catch (error) {
    next(error);
  }
};

export const requestClarification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.body.reviewerId || req.user?.id;
    const rec = await reviewService.requestClarification(id, { ...req.body, reviewerId });
    return sendSuccess(res, rec);
  } catch (error) {
    next(error);
  }
};

export const markNotApplicable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.body.reviewerId || req.user?.id;
    const rec = await reviewService.markNotApplicable(id, { ...req.body, reviewerId });
    return sendSuccess(res, rec);
  } catch (error) {
    next(error);
  }
};
