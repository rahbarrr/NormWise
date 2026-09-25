import { recommend } from "../services/recommendationService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const recommendSchema = z.object({
  requirementText: z
    .string({ required_error: "Please provide a procurement requirement." })
    .trim()
    .min(5, "Please provide a procurement requirement (minimum 5 characters).")
    .max(10000, "Requirement text must not exceed 10,000 characters."),
  userId: z.string().optional(),
});

export const handleRecommend = async (req, res, next) => {
  try {
    const { requirementText, userId } = req.body;
    if (!requirementText || typeof requirementText !== "string" || requirementText.trim().length < 5) {
      return sendError(res, "Please provide a procurement requirement.", 400);
    }

    const result = await recommend(requirementText, { userId });
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};
