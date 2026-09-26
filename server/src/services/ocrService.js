/**
 * NormWise OCR Service
 * Configurable OCR extraction for scanned or image-based PDF documents
 * 
 * IMPORTANT:
 * - If OCR is disabled and a scanned document is detected, the service returns a clear notice:
 *   "Scanned document requires OCR processing."
 * - Does NOT fabricate extracted text.
 * - Does NOT return fake numerical confidence numbers unless provided by the OCR engine.
 */
import fs from "node:fs/promises";

export function isOcrEnabled() {
  return process.env.OCR_ENABLED === "true";
}

/**
 * Extract text using OCR engine (when enabled)
 */
export async function extractTextWithOCR(filePath) {
  if (!isOcrEnabled()) {
    return {
      text: "",
      extractionMethod: "OCR",
      confidence: "unavailable",
      isOcrConfigured: false,
      error: "Scanned document requires OCR processing.",
    };
  }

  try {
    // Dynamic import of tesseract.js to avoid loading native worker unless OCR enabled
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    
    const ret = await worker.recognize(filePath);
    await worker.terminate();

    const rawText = ret.data?.text || "";
    const confidence = typeof ret.data?.confidence === "number" ? `${Math.round(ret.data.confidence)}%` : "available";

    return {
      text: rawText,
      extractionMethod: "OCR",
      confidence,
      isOcrConfigured: true,
      error: null,
    };
  } catch (err) {
    console.warn("[OcrService] OCR recognition failed:", err.message);
    return {
      text: "",
      extractionMethod: "OCR",
      confidence: "unavailable",
      isOcrConfigured: true,
      error: `OCR processing failed: ${err.message}`,
    };
  }
}
