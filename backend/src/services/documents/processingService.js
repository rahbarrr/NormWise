/**
 * NormWise Document Processing Pipeline
 * Orchestrates file retrieval, native/OCR text extraction, quality checks,
 * structured requirement extraction, and state persistence.
 */
import prisma from "../../config/db.js";
import { extractText } from "./extractionService.js";
import { extractRequirementsFromDocumentText } from "./requirementExtractService.js";
import { detectLanguage } from "../requirement/languageDetectionService.js";
import { getFile } from "./storageService.js";
import { enrichRequirementsWithAi } from "../ai/requirementExtractionService.js";

export async function processDocument(documentId) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error(`Document not found for ID: ${documentId}`);
  }

  // Update status: PROCESSING
  await prisma.document.update({
    where: { id: documentId },
    data: { processingStatus: "PROCESSING", processingError: null },
  });

  try {
    if (!document.storagePath) {
      throw new Error("Document storage file path is missing.");
    }

    // 1-6. Extract text (PDF/DOCX/OCR fallback)
    const fileBuffer = await getFile(document.storagePath);
    const extractionResult = await extractText(fileBuffer, document.fileType);

    // Phase 16: Detect Language of extracted document text
    const langDetection = detectLanguage(extractionResult.text || "");

    // 7-8. Update Document with extracted text, quality, and detected language
    await prisma.document.update({
      where: { id: documentId },
      data: {
        pageCount: extractionResult.pageCount || document.pageCount,
        extractedText: extractionResult.text || "",
        extractionMethod: extractionResult.extractionMethod || "PDF_TEXT",
        textExtractionQuality: extractionResult.quality || "MEDIUM",
        detectedLanguage: langDetection.language,
        originalLanguage: langDetection.language,
        languageConfidence: langDetection.confidence,
        processingStatus: "TEXT_EXTRACTED",
      },
    });

    // Check if text is completely unusable or scanned without OCR
    if (extractionResult.isScannedPdfWithoutOcr || extractionResult.quality === "LOW") {
      if (!extractionResult.text || extractionResult.text.length < 10) {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            processingStatus: "FAILED",
            processingError: "This document appears to be scanned, but OCR processing is not available or produced insufficient text.",
          },
        });

        return {
          documentId,
          status: "FAILED",
          error: "This document appears to be scanned, but OCR processing is not available or produced insufficient text.",
          extractionMethod: extractionResult.extractionMethod,
          isScannedPdfWithoutOcr: Boolean(extractionResult.isScannedPdfWithoutOcr),
        };
      }
    }

    // 9. Extract procurement requirements
    const deterministicRequirements = extractRequirementsFromDocumentText(extractionResult.text, {
      pageCount: extractionResult.pageCount,
      pages: extractionResult.pages || [],
    });
    let requirementResult;
    try {
      requirementResult = await enrichRequirementsWithAi(extractionResult.text, deterministicRequirements);
    } catch (aiError) {
      console.warn(`[DocumentProcessingService] AI extraction unavailable; using deterministic extraction: ${aiError.message}`);
      requirementResult = { ...deterministicRequirements, ai: { used: false, provider: "fallback", reason: aiError.message } };
    }

    // 10. Update Document with extracted requirements
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: "REQUIREMENTS_EXTRACTED",
        extractedRequirements: requirementResult,
      },
    });

    // 11. Create Audit Event
    await prisma.auditEvent.create({
      data: {
        recommendationId: document.recommendationId || null,
        action: "REQUIREMENTS_EXTRACTED",
        details: `Document "${document.originalFilename || document.filename}" processed. Extracted product: "${requirementResult.product || "None"}", material: "${requirementResult.material || "None"}" (AI used: ${requirementResult.ai?.used ? "yes" : "no"}; ${extractionResult.extractionMethod}, quality: ${extractionResult.quality}).`,
      },
    });

    return {
      documentId,
      status: "REQUIREMENTS_EXTRACTED",
      filename: document.originalFilename || document.filename,
      pageCount: extractionResult.pageCount,
      extractionMethod: extractionResult.extractionMethod,
      quality: extractionResult.quality,
      ocrUsed: Boolean(extractionResult.ocrUsed),
      requirements: requirementResult,
    };
  } catch (err) {
    console.error(`[DocumentProcessingService] Processing failed for ${documentId}:`, err);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: "FAILED",
        processingError: err.message || "Document processing failed.",
      },
    });

    return {
      documentId,
      status: "FAILED",
      error: err.message || "Document processing failed.",
    };
  }
}
