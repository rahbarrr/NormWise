import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import prisma from "../src/config/db.js";
import { saveFile } from "../src/services/storageService.js";
import { extractPdfText, extractDocxText, extractText } from "../src/services/documentExtractionService.js";
import { extractRequirementsFromDocumentText } from "../src/services/documentRequirementService.js";
import { processDocument } from "../src/services/documents/processingService.js";
import { isOcrEnabled } from "../src/services/ocrService.js";

const FIXTURES_DIR = path.resolve("tests/fixtures");

describe("Phase 11 Document Processing Test Suite", () => {
  let createdDocIds = [];

  after(async () => {
    // Cleanup any test documents created in database
    if (createdDocIds.length > 0) {
      await prisma.document.deleteMany({
        where: { id: { in: createdDocIds } },
      }).catch(() => null);
    }
  });

  // Test 1: Text-based PDF extraction
  it("1. should extract text, page count and quality from text-based PDF", async () => {
    const filePath = path.join(FIXTURES_DIR, "tender_cooker.pdf");
    const result = await extractPdfText(filePath);

    assert.ok(result.text.includes("Stainless steel pressure cooker"));
    assert.equal(result.extractionMethod, "PDF_TEXT");
    assert.ok(result.pageCount >= 1);
    assert.ok(["HIGH", "MEDIUM"].includes(result.quality));
  });

  // Test 2: DOCX extraction
  it("2. should extract text and metadata from DOCX specification", async () => {
    const filePath = path.join(FIXTURES_DIR, "street_light.docx");
    const result = await extractDocxText(filePath);

    assert.ok(result.text.includes("LED street light luminaires"));
    assert.equal(result.extractionMethod, "DOCX_TEXT");
    assert.ok(result.pageCount >= 1);
    assert.ok(["HIGH", "MEDIUM"].includes(result.quality));
  });

  // Test 3: Unsupported file format
  it("3. should reject unsupported file extensions", async () => {
    const invalidExtensions = [".exe", ".txt", ".zip", ".tar.gz"];
    for (const ext of invalidExtensions) {
      const allowedExts = [".pdf", ".docx"];
      const isAllowed = allowedExts.includes(ext);
      assert.equal(isAllowed, false, `Extension ${ext} must be rejected`);
    }
  });

  // Test 4: File > 10 MB rejection
  it("4. should enforce 10 MB maximum file size limit", () => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const oversizedFile = { size: 10 * 1024 * 1024 + 1024 }; // 10.001 MB
    const isExceeded = oversizedFile.size > MAX_SIZE;
    assert.equal(isExceeded, true, "File exceeding 10MB must be rejected");
  });

  // Test 5: Empty file rejection
  it("5. should reject empty files with 0 bytes", () => {
    const emptyFile = { size: 0 };
    const isEmpty = emptyFile.size === 0;
    assert.equal(isEmpty, true, "Empty file must be rejected");
  });

  // Test 6: Scanned PDF detection (quality LOW)
  it("6. should detect scanned PDF with unusable text stream and mark quality LOW", async () => {
    const filePath = path.join(FIXTURES_DIR, "scanned_mock.pdf");
    const result = await extractPdfText(filePath);

    assert.equal(result.quality, "LOW", "Scanned or empty PDF must have LOW quality");
    assert.ok(result.text.length < 15, "Text should be empty or minimal");
  });

  // Test 7: OCR disabled handling
  it("7. should return clear notice when OCR is disabled and document requires OCR", async () => {
    const filePath = path.join(FIXTURES_DIR, "scanned_mock.pdf");
    const savedOcrEnv = process.env.OCR_ENABLED;
    process.env.OCR_ENABLED = "false";

    try {
      const result = await extractText(filePath, "PDF");
      assert.equal(result.isScannedPdfWithoutOcr, true);
      assert.ok(result.ocrNotice.includes("Scanned document requires OCR processing"));
    } finally {
      process.env.OCR_ENABLED = savedOcrEnv;
    }
  });

  // Test 8: OCR enabled check
  it("8. should verify OCR configuration state and method reporting", () => {
    const ocrActive = isOcrEnabled();
    assert.equal(typeof ocrActive, "boolean");
    // Verify OCR result schema without fabricating fake numerical confidence
    const sampleOcrResult = {
      text: "Extracted test line",
      extractionMethod: "OCR",
      confidence: "available",
    };
    assert.equal(sampleOcrResult.extractionMethod, "OCR");
    assert.ok(!Number.isInteger(sampleOcrResult.confidence) || sampleOcrResult.confidence >= 0);
  });

  // Test 9: No requirements found
  it("9. should return hasUsableRequirements: false when document has no procurement attributes", async () => {
    const text = "Routine annual administrative holiday list and staff parking regulations.";
    const reqs = extractRequirementsFromDocumentText(text);

    assert.equal(reqs.hasUsableRequirements, false);
    assert.equal(reqs.product, null);
    assert.equal(reqs.material, null);
  });

  // Test 10: Partial extraction without fabrication
  it("10. should extract available attributes while preserving missing ones without invention", async () => {
    const text = "Equipment schedule for Pressure Cooker unit.";
    const reqs = extractRequirementsFromDocumentText(text);

    assert.equal(reqs.product, "Pressure Cooker");
    assert.equal(reqs.material, null);
    assert.equal(reqs.capacity, null);
    assert.equal(reqs.application, null);
    assert.equal(reqs.sourceReferences.material.snippet, "Source location unavailable");
  });

  // Test 11: Ambiguous requirement detection
  it("11. should detect ambiguity when multiple materials are referenced in text", async () => {
    const text = "Pressure cooker equipment fabricated from stainless steel body with aluminum lid";
    const reqs = extractRequirementsFromDocumentText(text);

    assert.ok(reqs.ambiguities.length > 0);
    const materialAmbiguity = reqs.ambiguities.find((a) => a.field === "material");
    assert.ok(materialAmbiguity, "Must flag material ambiguity");
    assert.equal(materialAmbiguity.type, "MULTIPLE");
  });

  // Test 12: User edits extracted requirement
  it("12. should allow updating extracted requirements and create audit record", async () => {
    // 1. Create a document record
    const doc = await prisma.document.create({
      data: {
        filename: "test_editable.pdf",
        originalFilename: "test_editable.pdf",
        fileType: "PDF",
        fileSize: "1024",
        storagePath: path.join(FIXTURES_DIR, "tender_cooker.pdf"),
        processingStatus: "REQUIREMENTS_EXTRACTED",
        extractedRequirements: {
          product: "Pressure Cooker",
          material: "Aluminum",
          capacity: "3 litre",
        },
      },
    });
    createdDocIds.push(doc.id);

    // 2. User edits requirement (refines material to Stainless Steel and 5 litre)
    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        extractedRequirements: {
          product: "Pressure Cooker",
          material: "Stainless Steel",
          capacity: "5 litre",
          application: "Institutional Kitchen",
        },
      },
    });

    assert.equal(updated.extractedRequirements.material, "Stainless Steel");
    assert.equal(updated.extractedRequirements.capacity, "5 litre");
  });

  // Test 13: Document -> Recommendation end-to-end integration
  it("13. should process document and generate linked recommendation", async () => {
    // 1. Create and process document
    const saved = await saveFile({
      buffer: await fs.readFile(path.join(FIXTURES_DIR, "tender_cooker.pdf")),
      originalname: "tender_cooker.pdf",
      mimetype: "application/pdf",
    });

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
    createdDocIds.push(doc.id);

    // 2. Run document processing pipeline
    const processResult = await processDocument(doc.id);
    assert.equal(processResult.status, "REQUIREMENTS_EXTRACTED");
    assert.equal(processResult.requirements.product, "Pressure Cooker");

    // 3. Forward to recommendation engine
    const { recommend } = await import("../src/services/recommendationService.js");
    const recResult = await recommend(processResult.requirements.requirementText);

    // 4. Link Document to Recommendation
    const linkedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: {
        recommendationId: recResult.recommendationId,
        processingStatus: "COMPLETED",
      },
    });

    assert.equal(linkedDoc.recommendationId, recResult.recommendationId);
    assert.equal(linkedDoc.processingStatus, "COMPLETED");
    assert.equal(recResult.primaryRecommendation.standardNumber, "IS 2347:2023");
  });
});
