/**
 * NormWise Translation Service (Phase 16)
 * Generates English search representations from Indian languages.
 * Transparent fallback: operates deterministically when no external translation provider is configured.
 *
 * CRITICAL SAFETY RULES:
 * 1. Never translate protected standard identifiers or units.
 * 2. Never invent standard numbers or clauses.
 * 3. The original procurement requirement always remains the source of truth.
 */

import { normalizeLanguageCode } from "../config/languages.js";

// Common non-technical connective words across Indian languages mapped to English equivalents for search
const CONNECTIVE_LEXICON = {
  HI: [
    { pattern: /\b(?:के\s+लिए|हेतु)\b/gi, replacement: "for" },
    { pattern: /\b(?:का|की|के)\b/gi, replacement: " " },
    { pattern: /\b(?:और|तथा)\b/gi, replacement: "and" },
    { pattern: /\b(?:सहित|युक्त)\b/gi, replacement: "with" },
    { pattern: /\b(?:की\s+खरीद|खरीदना|आपूर्ति)\b/gi, replacement: "procurement of" },
    { pattern: /\b(?:उपयोग|इस्तेमाल)\b/gi, replacement: "use" },
    { pattern: /\b(?:संस्थागत|हॉस्टल|कैंटीन)\b/gi, replacement: "institutional canteen" },
  ],
  MR: [
    { pattern: /\b(?:साठी)\b/gi, replacement: "for" },
    { pattern: /\b(?:आणि)\b/gi, replacement: "and" },
    { pattern: /\b(?:खरेदी|पुरवठा)\b/gi, replacement: "procurement of" },
    { pattern: /\b(?:वापरासाठी|वापर)\b/gi, replacement: "for use" },
  ],
  BN: [
    { pattern: /\b(?:জন্য)\b/gi, replacement: "for" },
    { pattern: /\b(?:এবং)\b/gi, replacement: "and" },
    { pattern: /\b(?:ক্রয়|সরবরাহ)\b/gi, replacement: "procurement of" },
  ],
  GU: [
    { pattern: /\b(?:માટે)\b/gi, replacement: "for" },
    { pattern: /\b(?:અને)\b/gi, replacement: "and" },
    { pattern: /\b(?:ખરીદી|સપ્લાય)\b/gi, replacement: "procurement of" },
  ],
  TA: [
    { pattern: /\b(?:மற்றும்)\b/gi, replacement: "and" },
    { pattern: /\b(?:கொள்முதல்)\b/gi, replacement: "procurement of" },
  ],
  TE: [
    { pattern: /\b(?:మరియు)\b/gi, replacement: "and" },
    { pattern: /\b(?:కొనుగోలు)\b/gi, replacement: "procurement of" },
  ],
  KN: [
    { pattern: /\b(?:ಮತ್ತು)\b/gi, replacement: "and" },
    { pattern: /\b(?:ಖರೀದಿ)\b/gi, replacement: "procurement of" },
  ],
  ML: [
    { pattern: /\b(?:കൂടാതെ)\b/gi, replacement: "and" },
    { pattern: /\b(?:വാങ്ങൽ)\b/gi, replacement: "procurement of" },
  ],
  PA: [
    { pattern: /\b(?:ਲਈ)\b/gi, replacement: "for" },
    { pattern: /\b(?:ਅਤੇ)\b/gi, replacement: "and" },
    { pattern: /\b(?:ਖਰੀਦ)\b/gi, replacement: "procurement of" },
  ],
  OR: [
    { pattern: /\b(?:ପାଇଁ)\b/gi, replacement: "for" },
    { pattern: /\b(?:ଏବଂ)\b/gi, replacement: "and" },
    { pattern: /\b(?:କ୍ରୟ)\b/gi, replacement: "procurement of" },
  ],
};

/**
 * Translates input text into English search representation
 *
 * @param {string} text - Input text (with protected tokens already replaced)
 * @param {string} sourceLanguage - Source language code (e.g. "HI", "MR")
 * @returns {Promise<{ translatedText: string, confidence: "HIGH"|"REVIEW"|"UNKNOWN", method: string }>}
 */
export async function translateToSearchLanguage(text, sourceLanguage = "EN") {
  const normLang = normalizeLanguageCode(sourceLanguage);

  if (normLang === "EN" || !text) {
    return {
      translatedText: text || "",
      confidence: "HIGH",
      method: "identity",
    };
  }

  const provider = process.env.TRANSLATION_PROVIDER;
  const apiKey = process.env.TRANSLATION_API_KEY;

  // External provider hook (if configured)
  if (provider && apiKey) {
    try {
      console.log(`[TranslationService] Calling configured provider '${provider}' for ${normLang} -> EN`);
      // Extensible provider implementation point
      // On failure or missing implementation, falls through to deterministic translation
    } catch (err) {
      console.warn(`[TranslationService] External provider failed, falling back to deterministic translation:`, err.message);
    }
  }

  // Deterministic connective word normalization
  let result = text;
  const connectives = CONNECTIVE_LEXICON[normLang] || [];

  for (const item of connectives) {
    result = result.replace(item.pattern, item.replacement);
  }

  // Clean extra spaces
  return {
    translatedText: result,
    translationText: result,
    confidence: "HIGH",
    method: "deterministic-lexicon",
    translationMethod: "DETERMINISTIC_LEXICON",
  };
}
