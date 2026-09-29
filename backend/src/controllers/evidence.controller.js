import * as evidenceService from "../services/evidence/evidenceService.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";

export const createEvidenceSchema = z.object({
  standardId: z.string().optional(),
  type: z.enum([
    "SCOPE",
    "REQUIREMENT",
    "MATERIAL",
    "CERTIFICATION",
    "CURRENTNESS",
    "RELATED_STANDARD",
    "TEST_METHOD",
  ]),
  reference: z.string().min(2, "Reference is required"),
  content: z.string().min(5, "Evidence content is required"),
  source: z.string().min(2, "Source is required"),
  status: z.string().optional(),
});

export const getEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evidence = await evidenceService.getEvidenceByRecommendationId(id);
    return sendSuccess(res, evidence);
  } catch (error) {
    next(error);
  }
};

export const createEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newEvidence = await evidenceService.createEvidence(id, req.body);
    return sendSuccess(res, newEvidence, 201);
  } catch (error) {
    next(error);
  }
};
