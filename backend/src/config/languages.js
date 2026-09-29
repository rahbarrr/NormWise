/**
 * NormWise Supported Indian Languages Specification (Phase 16)
 * Controlled language model and canonical metadata for multilingual procurement.
 */

export const SUPPORTED_LANGUAGES = Object.freeze({
  EN: Object.freeze({
    code: "EN",
    name: "English",
    nativeName: "English",
    script: "Latin",
    isIndic: false,
  }),
  HI: Object.freeze({
    code: "HI",
    name: "Hindi",
    nativeName: "हिन्दी",
    script: "Devanagari",
    isIndic: true,
  }),
  MR: Object.freeze({
    code: "MR",
    name: "Marathi",
    nativeName: "मराठी",
    script: "Devanagari",
    isIndic: true,
  }),
  BN: Object.freeze({
    code: "BN",
    name: "Bengali",
    nativeName: "বাংলা",
    script: "Bengali",
    isIndic: true,
  }),
  GU: Object.freeze({
    code: "GU",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    script: "Gujarati",
    isIndic: true,
  }),
  TA: Object.freeze({
    code: "TA",
    name: "Tamil",
    nativeName: "தமிழ்",
    script: "Tamil",
    isIndic: true,
  }),
  TE: Object.freeze({
    code: "TE",
    name: "Telugu",
    nativeName: "తెలుగు",
    script: "Telugu",
    isIndic: true,
  }),
  KN: Object.freeze({
    code: "KN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    script: "Kannada",
    isIndic: true,
  }),
  ML: Object.freeze({
    code: "ML",
    name: "Malayalam",
    nativeName: "മലയാളം",
    script: "Malayalam",
    isIndic: true,
  }),
  PA: Object.freeze({
    code: "PA",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    script: "Gurmukhi",
    isIndic: true,
  }),
  OR: Object.freeze({
    code: "OR",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    script: "Odia",
    isIndic: true,
  }),
  UNKNOWN: Object.freeze({
    code: "UNKNOWN",
    name: "Unknown",
    nativeName: "Unknown",
    script: "Unknown",
    isIndic: false,
  }),
});

export const LANGUAGE_CODES = Object.freeze(Object.keys(SUPPORTED_LANGUAGES));

/**
 * Normalizes input language string into controlled uppercase code
 */
export function normalizeLanguageCode(code) {
  if (!code || typeof code !== "string") return "UNKNOWN";
  const upper = code.trim().toUpperCase();

  if (SUPPORTED_LANGUAGES[upper]) return upper;

  // Map lowercase ISO codes or full names
  const lower = code.trim().toLowerCase();
  switch (lower) {
    case "en":
    case "english":
      return "EN";
    case "hi":
    case "hindi":
      return "HI";
    case "mr":
    case "marathi":
      return "MR";
    case "bn":
    case "bengali":
    case "bangla":
      return "BN";
    case "gu":
    case "gujarati":
      return "GU";
    case "ta":
    case "tamil":
      return "TA";
    case "te":
    case "telugu":
      return "TE";
    case "kn":
    case "kannada":
      return "KN";
    case "ml":
    case "malayalam":
      return "ML";
    case "pa":
    case "punjabi":
      return "PA";
    case "or":
    case "odia":
    case "oriya":
      return "OR";
    default:
      return "UNKNOWN";
  }
}

/**
 * Returns human-readable name for a language code
 */
export function getLanguageName(code) {
  const norm = normalizeLanguageCode(code);
  return SUPPORTED_LANGUAGES[norm]?.name || "Unknown";
}

/**
 * Returns native script name for a language code
 */
export function getNativeLanguageName(code) {
  const norm = normalizeLanguageCode(code);
  return SUPPORTED_LANGUAGES[norm]?.nativeName || "Unknown";
}

/**
 * Checks whether language code is an official supported language (excluding UNKNOWN)
 */
export function isSupportedLanguage(code) {
  const norm = normalizeLanguageCode(code);
  return norm !== "UNKNOWN" && Boolean(SUPPORTED_LANGUAGES[norm]);
}
