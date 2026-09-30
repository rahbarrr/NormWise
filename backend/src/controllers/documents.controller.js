import prisma from "../config/db.js";
import { saveFile } from "../services/documents/storageService.js";
import { processDocument as runProcessPipeline } from "../services/documents/processingService.js";
import { createSprint2Recommendation } from "../services/recommendation/sprint2RecommendationService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

// Zod schema for updating reviewed requirements
export const updateRequirementsSchema = z.object({
  product: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  capacity: z.string().nullable().optional(),
  application: z.string().nullable().optional(),
  technicalCharacteristics: z.array(z.string()).optional(),
  requirementText: z.string().optional(),
});

export const updateDocumentStatusSchema = z.object({
  processingStatus: z.enum([
    "UPLOADED",
    "PROCESSING",
    "TEXT_EXTRACTED",
    "REQUIREMENTS_EXTRACTED",
    "PROCESSED",
    "COMPLETED",
    "FAILED",
  ]),
});

/**
 * Upload Document (Multipart Form Data)
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, "No file uploaded. Please upload a PDF or DOCX file.", 400);
    }

    // Size limit check (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return sendError(res, "File exceeds maximum allowed size of 10 MB.", 400);
    }

    if (file.size === 0) {
      return sendError(res, "Uploaded file is empty (0 bytes).", 400);
    }

    // Allowed extensions and MIME types
    const originalName = file.originalname || "document.pdf";
    const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
    const allowedExts = [".pdf", ".docx"];

    if (!allowedExts.includes(ext)) {
      return sendError(res, "Unsupported file format. Please upload a .pdf or .docx document.", 400);
    }

    // Save to protected local storage
    const saved = await saveFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    // Create Document record in PostgreSQL
    const doc = await prisma.document.create({
      data: {
        filename: saved.filename,
        originalFilename: saved.originalFilename,
        fileType: saved.fileType,
        fileSize: saved.fileSize,
        storagePath: saved.storagePath,
        processingStatus: "UPLOADED",
      },
    });

    // Log upload in AuditEvent
    await prisma.auditEvent.create({
      data: {
        action: "DOCUMENT_UPLOADED",
        details: `Document "${saved.originalFilename}" uploaded (${(Number(saved.fileSize) / 1024).toFixed(1)} KB, type: ${saved.fileType}).`,
      },
    });

    return sendSuccess(res, {
      documentId: doc.id,
      filename: doc.filename,
      originalFilename: doc.originalFilename,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      processingStatus: doc.processingStatus,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Start Document Processing Pipeline
 */
export const processDocumentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await runProcessPipeline(id);

    if (result.status === "FAILED") {
      return sendError(res, result.error || "Document processing failed.", 422, result);
    }

    return sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Document Processing Status
 */
export const getDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        processingStatus: true,
        processingError: true,
        extractionMethod: true,
        textExtractionQuality: true,
        originalFilename: true,
      },
    });

    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }

    let progress = 20;
    let currentStep = "Document received";

    switch (doc.processingStatus) {
      case "UPLOADED":
        progress = 20;
        currentStep = "Document received";
        break;
      case "PROCESSING":
        progress = 50;
        currentStep = "Extracting text and checking quality";
        break;
      case "TEXT_EXTRACTED":
        progress = 75;
        currentStep = "Extracting procurement requirements";
        break;
      case "REQUIREMENTS_EXTRACTED":
      case "COMPLETED":
      case "PROCESSED":
        progress = 100;
        currentStep = "Requirements ready for review";
        break;
      case "FAILED":
        progress = 100;
        currentStep = "Processing failed";
        break;
    }

    return sendSuccess(res, {
      documentId: doc.id,
      status: doc.processingStatus,
      progress,
      currentStep,
      error: doc.processingError,
      extractionMethod: doc.extractionMethod,
      quality: doc.textExtractionQuality,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Extracted Requirements
 */
export const getDocumentRequirements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }

    return sendSuccess(res, {
      documentId: doc.id,
      status: doc.processingStatus,
      requirements: doc.extractedRequirements || null,
      extractionMethod: doc.extractionMethod,
      quality: doc.textExtractionQuality,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update / Edit Extracted Requirements by User
 */
export const updateDocumentRequirements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }

    const currentReqs = (doc.extractedRequirements && typeof doc.extractedRequirements === "object")
      ? doc.extractedRequirements
      : {};

    const updatedReqs = {
      ...currentReqs,
      ...req.body,
    };

    // Reconstruct summary requirementText if modified
    const summaryParts = [
      updatedReqs.product || "Procurement item",
      updatedReqs.material ? `made of ${updatedReqs.material}` : null,
      updatedReqs.capacity ? `(${updatedReqs.capacity})` : null,
      updatedReqs.application ? `for ${updatedReqs.application}` : null,
    ].filter(Boolean);

    updatedReqs.requirementText = req.body.requirementText || summaryParts.join(" ");

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        extractedRequirements: updatedReqs,
      },
    });

    // Audit event for requirement editing
    await prisma.auditEvent.create({
      data: {
        recommendationId: doc.recommendationId || null,
        action: "REQUIREMENTS_EDITED",
        details: `User refined extracted requirements for document "${doc.originalFilename || doc.filename}". Product: "${updatedReqs.product || "N/A"}", Material: "${updatedReqs.material || "N/A"}".`,
      },
    });

    return sendSuccess(res, {
      documentId: id,
      requirements: updatedDoc.extractedRequirements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forward Reviewed Document Requirements to Recommendation Engine
 */
export const generateRecommendationFromDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }

    const reqs = req.body.requirements || doc.extractedRequirements;
    if (!reqs || typeof reqs !== "object") {
      return sendError(res, "No extracted requirements found for this document. Please process document first.", 400);
    }

    // Build the query text for recommendation engine
    const requirementText = req.body.requirementText || reqs.requirementText || [
      reqs.product || "Procurement specification",
      reqs.material ? `made of ${reqs.material}` : null,
      reqs.capacity ? `capacity ${reqs.capacity}` : null,
      reqs.application ? `for ${reqs.application}` : null,
      Array.isArray(reqs.technicalCharacteristics) && reqs.technicalCharacteristics.length > 0
        ? `with ${reqs.technicalCharacteristics.join(", ")}`
        : null,
    ].filter(Boolean).join(", ");

    if (requirementText.length < 5) {
      return sendError(res, "Extracted requirement text is too short to generate a recommendation.", 400);
    }

    // Call Phase 10 Recommendation Engine
    const recResult = await createSprint2Recommendation(requirementText, {
      userId: req.body.userId || null,
      // The document workflow stores documents in Prisma while Sprint 2
      // recommendations currently live in Supabase. Do not pass the Prisma
      // UUID into Supabase until both stores share the same document record.
    });

    // Link Recommendation to Document
    await prisma.document.update({
      where: { id },
      data: {
        processingStatus: "COMPLETED",
      },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        action: "RECOMMENDATION_STARTED",
        details: `Recommendation initiated from document "${doc.originalFilename || doc.filename}". Matched primary: ${recResult.primary_standard?.is_number || "None"}.`,
      },
    });

    return sendSuccess(res, {
      recommendationId: recResult.recommendation_id,
      documentId: id,
      recommendation: recResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Document Metadata
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        recommendation: {
          select: {
            id: true,
            product: true,
            status: true,
            confidence: true,
          },
        },
      },
    });
    if (!doc) {
      return sendError(res, `Document not found for ID: ${id}`, 404);
    }
    return sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Document Status
 */
export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { processingStatus } = req.body;
    const doc = await prisma.document.update({
      where: { id },
      data: { processingStatus },
    });
    return sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
};
