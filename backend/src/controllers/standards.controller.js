import * as standardsService from "../services/standards/standardsService.js";
import * as relationshipService from "../services/standardRelationshipService.js";
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

export const createRelationshipSchema = z.object({
  relatedStandardId: z.string().min(1, "Related standard ID is required"),
  relationshipType: z.enum([
    "NORMATIVE_REFERENCE",
    "TERMINOLOGY",
    "TEST_METHOD",
    "SAFETY",
    "INSTALLATION",
    "EQUIVALENT",
    "SUPERSEDED_BY",
    "AMENDED_BY",
    "MANDATORY_UNDER",
    "APPLIES_TO",
    "COMPONENT",
    "MATERIAL",
    "OTHER",
  ]),
  evidenceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().optional().default("DEMO"),
});

export const updateRelationshipSchema = z.object({
  relatedStandardId: z.string().optional(),
  relationshipType: z.enum([
    "NORMATIVE_REFERENCE",
    "TERMINOLOGY",
    "TEST_METHOD",
    "SAFETY",
    "INSTALLATION",
    "EQUIVALENT",
    "SUPERSEDED_BY",
    "AMENDED_BY",
    "MANDATORY_UNDER",
    "APPLIES_TO",
    "COMPONENT",
    "MATERIAL",
    "OTHER",
  ]).optional(),
  evidenceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().optional(),
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

/**
 * GET /api/standards/:id/related
 */
export const getRelatedStandardsHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { direction, type } = req.query;
    const result = await relationshipService.getRelatedStandards(id, { direction, type });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/standards/:id/graph
 */
export const getStandardGraphHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { depth, type } = req.query;
    const graph = await relationshipService.getRelationshipGraph(id, { depth, type });
    return sendSuccess(res, graph);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/standards/:id/related
 */
export const createStandardRelationship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await relationshipService.createRelationship({
      standardId: id,
      ...req.body,
    });
    return sendSuccess(res, record, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/standards/:id/related/:relationshipId
 */
export const updateStandardRelationship = async (req, res, next) => {
  try {
    const { relationshipId } = req.params;
    const updated = await relationshipService.updateRelationship(relationshipId, req.body);
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/standards/:id/related/:relationshipId
 */
export const deleteStandardRelationship = async (req, res, next) => {
  try {
    const { relationshipId } = req.params;
    const result = await relationshipService.deleteRelationship(relationshipId);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
