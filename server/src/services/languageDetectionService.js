/**
 * NormWise Language Detection Service (Phase 16)
 * Deterministic Unicode script analysis and vocabulary heuristics for Indian languages.
 * Never guesses silently when confidence is low; flags UNKNOWN for user clarification.
 */

import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from "../config/languages.js";

// Distinctive script Unicode block definitions
const SCRIPT_RANGES = [
  { code: "BN", name: "Bengali", regex: /[\u0980-\u09FF]/g },
  { code: "GU", name: "Gujarati", regex: /[\u0A80-\u0AFF]/g },
  { code: "PA", name: "Punjabi", regex: /[\u0A00-\u0A7F]/g },
  { code: "OR", name: "Odia", regex: /[\u0B00-\u0B7F]/g },
  { code: "TA", name: "Tamil", regex: /[\u0B80-\u0BFF]/g },
  { code: "TE", name: "Telugu", regex: /[\u0C00-\u0C7F]/g },
  { code: "KN", name: "Kannada", regex: /[\u0C80-\u0CFF]/g },
  { code: "ML", name: "Malayalam", regex: /[\u0D00-\u0D7F]/g },
  { code: "DEV", name: "Devanagari", regex: /[\u0900-\u097F]/g }, // Shared between HI & MR
  { code: "EN", name: "Latin", regex: /[a-zA-Z]/g },
];

// Distinctive Marathi markers within Devanagari script (unique letters, suffixes, vocabulary)
const MARATHI_MARKERS = [
  /\u0933/gu, // Marathi letter LLA (ळ)
  /साठी/gu,   // Suffix/word for 'for' (e.g. स्वयंपाकासाठी, पाण्यासाठी)
  /घरगुती/gu, // Domestic / household
  /रस्त्यावरील/gu, // On-the-road
  /दिव्यांसाठी/gu, // For lights
  /शेतीच्या/gu,   // For agriculture
  /(?:^|\s)संच(?:\s|$|[.,!?])/u, // Set (पंप संच)
  /(?:स्टीलचे|भांडी|नळ|करावे|केले|होते|पाहिजे|आहेत|आहे)/gu,
];

/**
 * Detect language of raw text
 * @param {string} text - Input natural language procurement requirement
 * @returns {{ language: string, confidence: number, method: string, isUncertain?: boolean }}
 */
export function detectLanguage(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      language: "UNKNOWN",
      confidence: 0.0,
      method: "deterministic-script",
      isUncertain: true,
      reason: "No input text provided.",
    };
  }

  const clean = text.trim();
  const totalChars = clean.replace(/[\s\d\p{P}]/gu, "").length;

  if (totalChars < 2) {
    return {
      language: "UNKNOWN",
      confidence: 0.2,
      method: "deterministic-script",
      isUncertain: true,
      reason: "Input text is too short for reliable language detection.",
    };
  }

  // Count occurrences across known script ranges
  const counts = {};
  for (const script of SCRIPT_RANGES) {
    const matches = clean.match(script.regex);
    counts[script.code] = matches ? matches.length : 0;
  }

  // Find dominant script
  let dominantScript = null;
  let maxCount = 0;

  for (const [code, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantScript = code;
    }
  }

  if (maxCount === 0 || !dominantScript) {
    return {
      language: "UNKNOWN",
      confidence: 0.0,
      method: "deterministic-script",
      isUncertain: true,
      reason: "No recognizable linguistic script characters identified.",
    };
  }

  const scriptRatio = maxCount / totalChars;

  // Ambiguity check: if script ratio is weak and split between scripts
  if (scriptRatio < 0.45 && maxCount < 4) {
    return {
      language: "UNKNOWN",
      confidence: parseFloat(scriptRatio.toFixed(2)),
      method: "deterministic-script",
      isUncertain: true,
      reason: "Mixed script or low character confidence. Manual selection recommended.",
    };
  }

  // Distinguish Devanagari between Marathi and Hindi
  if (dominantScript === "DEV") {
    let marathiMatches = 0;
    for (const marker of MARATHI_MARKERS) {
      if (marker.test(clean)) {
        marathiMatches++;
        marker.lastIndex = 0;
      }
    }

    if (marathiMatches > 0) {
      return {
        language: "MR",
        confidence: Math.min(0.96, parseFloat((0.85 + marathiMatches * 0.05).toFixed(2))),
        method: "deterministic-script",
      };
    }

    return {
      language: "HI",
      confidence: Math.min(0.98, parseFloat(Math.max(0.85, scriptRatio).toFixed(2))),
      method: "deterministic-script",
    };
  }

  const confidence = Math.min(0.99, parseFloat(Math.max(0.80, scriptRatio).toFixed(2)));

  return {
    language: dominantScript,
    confidence,
    method: "deterministic-script",
  };
}
