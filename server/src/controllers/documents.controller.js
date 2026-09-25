import * as docService from "../services/documents.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

export const createDocumentSchema = z.object({
  recommendationId: z.string().optional(),
  filename: z.string().min(1, "Filename is required"),
  fileType: z.string().optional(),
  fileSize: z.union([z.string(), z.number()]).optional(),
  pageCount: z.number().int().positive().optional(),
  processingStatus: z.enum(["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"]).optional(),
  storagePath: z.string().optional(),
});

export const updateDocumentStatusSchema = z.object({
  processingStatus: z.enum(["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"]),
});

export const createDocument = async (req, res, next) => {
  try {
    const doc = await docService.createDocument(req.body);
    return sendSuccess(res, doc, 201);
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await docService.getDocumentById(id);
    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }
    return sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
};

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { processingStatus } = req.body;
    const doc = await docService.updateDocumentStatus(id, processingStatus);
    return sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
};
