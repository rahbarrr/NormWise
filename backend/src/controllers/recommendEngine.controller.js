import { recommend } from "../services/recommendation/recommendationService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const recommendSchema = z.object({
  text: z.string().optional(),
  requirementText: z.string().optional(),
  language: z.string().optional().default("en"),
  documentId: z.string().nullable().optional(),
  userId: z.string().optional(),
});

export const handleRecommend = async (req, res, next) => {
  try {
    const rawText = req.body.text || req.body.requirementText;
    const userId = req.body.userId || req.user?.id;
    const { language, documentId } = req.body;
    const isDebug = req.query.debug === "true";

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 5) {
      return sendError(res, "Please provide a procurement requirement.", 400);
    }
    if (rawText.trim().length > 10000) {
      return sendError(res, "Requirement text exceeds maximum allowed length of 10,000 characters.", 400);
    }

    const result = await recommend(rawText, {
      userId,
      language,
      documentId,
      debug: isDebug,
    });

    const responsePayload = {
      ...result,
      primaryStandard: result.primaryRecommendation,
      requiresReview:
        result.status === "CLARIFICATION_REQUIRED" ||
        result.status === "UNDER_TECHNICAL_REVIEW" ||
        result.status === "INSUFFICIENT_EVIDENCE",
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};
