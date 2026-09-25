import * as standardsService from "../services/standards.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const createStandardSchema = z.object({
  standardNumber: z.string().min(2, "Standard number is required (e.g. IS 2347:2023)"),
  title: z.string().min(3, "Title is required"),
  edition: z.string().optional(),
  revision: z.string().optional(),
  status: z.enum(["CURRENT", "SUPERSEDED", "WITHDRAWN", "UNDER_REVIEW", "UNKNOWN"]).default("CURRENT"),
  description: z.string().optional(),
});

export const getStandards = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const standards = await standardsService.getStandards({ search, status });
    return sendSuccess(res, standards);
  } catch (error) {
    next(error);
  }
};

export const getStandardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const standard = await standardsService.getStandardById(id);
    if (!standard) {
      return sendError(res, `Standard not found for ID/Number: ${id}`, 404);
    }
    return sendSuccess(res, standard);
  } catch (error) {
    next(error);
  }
};

export const createStandard = async (req, res, next) => {
  try {
    const standard = await standardsService.createStandard(req.body);
    return sendSuccess(res, standard, 201);
  } catch (error) {
    next(error);
  }
};
