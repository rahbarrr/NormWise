/**
 * NormWise Document Extraction Service
 * Native text extraction for PDF and DOCX documents with quality inspection
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { normalizeDocumentText, evaluateExtractionQuality } from "./textNormalizationService.js";
import { extractTextWithOCR, isOcrEnabled } from "./ocrService.js";

/**
 * Extract text from PDF buffer or file path
 */
export async function extractPdfText(bufferOrPath) {
  const buffer = Buffer.isBuffer(bufferOrPath)
    ? bufferOrPath
    : await fs.readFile(bufferOrPath);

  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  const rawText = data.text || "";
  const pageCount = data.total || data.pages?.length || 1;
  const normalized = normalizeDocumentText(rawText);
  const quality = evaluateExtractionQuality(normalized);

  return {
    text: normalized,
    rawText,
    pageCount,
    pages: data.pages || [],
    extractionMethod: "PDF_TEXT",
    quality,
  };
}

/**
 * Extract text from DOCX buffer or file path
 */
export async function extractDocxText(bufferOrPath) {
  const buffer = Buffer.isBuffer(bufferOrPath)
    ? bufferOrPath
    : await fs.readFile(bufferOrPath);

  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || "";
  const normalized = normalizeDocumentText(rawText);
  const quality = evaluateExtractionQuality(normalized);

  // Estimate page count for DOCX based on ~400 words/page (minimum 1)
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 400));

  return {
    text: normalized,
    rawText,
    pageCount: estimatedPages,
    extractionMethod: "DOCX_TEXT",
    quality,
  };
}

/**
 * High-level extractor dispatcher
 */
export async function extractText(filePath, fileType = "PDF") {
  const ext = path.extname(filePath).toLowerCase();
  const isDocx = fileType.toUpperCase() === "DOCX" || ext === ".docx";

  let extracted;
  if (isDocx) {
    extracted = await extractDocxText(filePath);
  } else {
    extracted = await extractPdfText(filePath);
  }

  // Scanned PDF detection: if text quality is LOW in a PDF, attempt OCR fallback
  if (!isDocx && extracted.quality === "LOW") {
    if (isOcrEnabled()) {
      console.log(`[DocumentExtractionService] Low quality text detected. Running OCR on ${filePath}...`);
      const ocrResult = await extractTextWithOCR(filePath);
      if (ocrResult.text && ocrResult.text.length > extracted.text.length) {
        return {
          text: normalizeDocumentText(ocrResult.text),
          pageCount: extracted.pageCount,
          extractionMethod: "OCR",
          quality: evaluateExtractionQuality(ocrResult.text),
          ocrUsed: true,
        };
      }
    } else {
      console.log("[DocumentExtractionService] Scanned PDF detected, but OCR is disabled.");
      return {
        ...extracted,
        ocrNotice: "Scanned document requires OCR processing.",
        isScannedPdfWithoutOcr: true,
      };
    }
  }

  return {
    ...extracted,
    ocrUsed: false,
  };
}
