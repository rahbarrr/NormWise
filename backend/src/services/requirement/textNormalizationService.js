/**
 * NormWise Text Normalization Service
 * Sanitizes and cleans raw extracted document text while strictly preserving
 * technical numbers, units, standards citations (IS xxxx), and section references.
 */

export function normalizeDocumentText(rawText = "") {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  let text = rawText;

  // 1. Replace Windows CRLF and CR with LF
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 1b. Strip PDF extraction pagination artifacts like "-- 1 of 1 --"
  text = text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "");

  // 2. Fix hyphenated word breaks across newlines (e.g. "certifi-\ncation" -> "certification")
  // Only where preceded by letters and followed by lower case letters
  text = text.replace(/([a-zA-Z]{2,})-\n\s*([a-z]{2,})/g, "$1$2");

  // 3. Replace non-breaking spaces and unusual whitespace with regular space
  text = text.replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ");

  // 4. Collapse multiple spaces and tabs on the same line into a single space
  text = text.replace(/[ \t]{2,}/g, " ");

  // 5. Collapse excessive blank lines (more than 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, "\n\n");

  // 6. Clean up line-by-line whitespace
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line, idx, arr) => {
      // Avoid isolated single punctuation marks or header/footer garbage
      if (line.length === 1 && !/[a-zA-Z0-9]/.test(line)) return false;
      return true;
    });

  return lines.join("\n").trim();
}

/**
 * Assess extraction quality of text
 * Returns: "HIGH" | "MEDIUM" | "LOW"
 */
export function evaluateExtractionQuality(text = "") {
  if (!text || typeof text !== "string") {
    return "LOW";
  }

  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  // If fewer than 15 words or mostly non-alphanumeric, likely scanned or empty
  if (wordCount < 15) {
    return "LOW";
  }

  const alphaNumericChars = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  const ratio = alphaNumericChars / (trimmed.length || 1);

  if (ratio < 0.35 || wordCount < 30) {
    return "MEDIUM";
  }

  return "HIGH";
}
