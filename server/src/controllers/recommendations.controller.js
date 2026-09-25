import * as recService from "../services/recommendations.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const createRecommendationSchema = z.object({
  requirementText: z.string().min(5, "Requirement text must be at least 5 characters"),
  product: z.string().optional(),
  material: z.string().optional(),
  capacity: z.string().optional(),
  application: z.string().optional(),
  technicalCharacteristics: z.string().optional(),
  confidence: z.number().min(0).max(100).optional(),
  standardNumber: z.string().optional(),
  department: z.string().optional(),
});

export const getRecommendations = async (req, res, next) => {
  try {
    const { page, limit, search, status, savedOnly } = req.query;
    const result = await recService.getRecommendations({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
      savedOnly: savedOnly === "true",
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getRecommendationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await recService.getRecommendationById(id);
    if (!rec) {
      return sendError(res, `Recommendation not found for ID: ${id}`, 404);
    }
    return sendSuccess(res, rec);
  } catch (error) {
    next(error);
  }
};

export const createRecommendation = async (req, res, next) => {
  try {
    const rec = await recService.createRecommendation(req.body);
    return sendSuccess(res, rec, 201);
  } catch (error) {
    next(error);
  }
};

export const toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await recService.toggleSaveRecommendation(id);
    return sendSuccess(res, { id: rec.id, saved: rec.saved });
  } catch (error) {
    next(error);
  }
};

export const archive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = await recService.archiveRecommendation(id);
    return sendSuccess(res, { id: rec.id, archived: rec.archived });
  } catch (error) {
    next(error);
  }
};
