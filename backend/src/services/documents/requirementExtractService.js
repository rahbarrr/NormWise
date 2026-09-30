/**
 * NormWise Document Requirement Service
 * Extracts structured procurement requirements from parsed document text,
 * detects contextual source references, and identifies ambiguity warnings.
 */
import { extractDeterministicAttributes } from "../requirement/requirementService.js";

/**
 * Locate source text snippet surrounding a matched value
 */
function findSourceReference(fullText, value, pages = []) {
  if (!fullText || !value || typeof value !== "string" || !value.trim()) {
    return {
      snippet: "Source location unavailable",
      page: null,
      available: false,
    };
  }

  const cleanVal = value.split(/\s+/)[0] || value;
  const idx = fullText.toLowerCase().indexOf(cleanVal.toLowerCase());

  if (idx === -1) {
    return {
      snippet: "Source location unavailable",
      page: null,
      available: false,
    };
  }

  // Find actual page if pages array is present
  let matchedPage = null;
  if (Array.isArray(pages) && pages.length > 0) {
    const pMatch = pages.find((p) => p.text && p.text.toLowerCase().includes(cleanVal.toLowerCase()));
    if (pMatch) {
      matchedPage = pMatch.num || pMatch.pageNumber || null;
    }
  }

  // Extract a 120-char snippet around the match
  const start = Math.max(0, idx - 40);
  const end = Math.min(fullText.length, idx + cleanVal.length + 60);
  const snippet = fullText.slice(start, end).replace(/\n+/g, " ").trim();

  return {
    snippet: `"...${snippet}..."`,
    page: matchedPage, // null if exact page is unavailable
    available: true,
  };
}

/**
 * Ambiguity detector
 */
function detectAmbiguities(extracted, fullText = "") {
  const ambiguities = [];

  // Check 1: Missing Application
  if (!extracted.application) {
    ambiguities.push({
      field: "application",
      type: "MISSING",
      severity: "WARNING",
      message: "Intended application is not clearly specified in the document text.",
    });
  }

  // Check 2: Missing or unclear Product
  if (!extracted.product) {
    ambiguities.push({
      field: "product",
      type: "MISSING",
      severity: "CRITICAL",
      message: "Primary product classification could not be confidently identified.",
    });
  }

  // Check 3: Multiple materials mentioned
  const materialMatches = (fullText.match(/\b(stainless\s+steel|aluminum|polyethylene|mild\s+steel|copper|brass)\b/gi) || []);
  const uniqueMaterials = [...new Set(materialMatches.map((m) => m.toLowerCase()))];
  if (uniqueMaterials.length > 1) {
    ambiguities.push({
      field: "material",
      type: "MULTIPLE",
      severity: "NOTICE",
      message: `Multiple materials referenced in specification (${uniqueMaterials.slice(0, 3).join(", ")}). Please verify intended primary alloy.`,
    });
  }

  // Check 4: Unclear capacity
  if (!extracted.capacity) {
    ambiguities.push({
      field: "capacity",
      type: "MISSING",
      severity: "NOTICE",
      message: "Nominal capacity or rating could not be confidently identified.",
    });
  }

  return ambiguities;
}

/**
 * Extract structured requirements from document text
 */
export function extractRequirementsFromDocumentText(text, metadata = {}) {
  const { pages = [] } = metadata;
  const extracted = extractDeterministicAttributes(text);

  // Extract source references where possible
  const sourceReferences = {
    product: findSourceReference(text, extracted.product, pages),
    material: findSourceReference(text, extracted.material, pages),
    capacity: findSourceReference(text, extracted.capacity, pages),
    application: findSourceReference(text, extracted.application, pages),
  };

  const ambiguities = detectAmbiguities(extracted, text);

  // Determine requirement summary sentence
  const summaryParts = [
    extracted.product || "Unclassified procurement item",
    extracted.material ? `made of ${extracted.material}` : null,
    extracted.capacity ? `(${extracted.capacity})` : null,
    extracted.application ? `for ${extracted.application}` : null,
  ].filter(Boolean);

  const requirementText = summaryParts.join(" ");

  return {
    requirementText,
    product: extracted.product,
    material: extracted.material,
    capacity: extracted.capacity,
    application: extracted.application,
    technicalCharacteristics: extracted.technicalCharacteristics || [],
    sourceReferences,
    ambiguities,
    hasUsableRequirements: Boolean(extracted.product || extracted.material || extracted.technicalCharacteristics.length > 0),
  };
}
