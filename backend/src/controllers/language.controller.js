/**
 * NormWise Language Controller (Phase 16)
 * REST endpoints for language detection, multilingual normalization, and translation.
 */

import { detectLanguage } from "../services/languageDetectionService.js";
import { normalizeRequirementMultilingual } from "../services/multilingualNormalizationService.js";
import { translateToSearchLanguage } from "../services/translationService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from "../config/languages.js";

/**
 * POST /api/language/detect
 */
export async function handleDetectLanguage(req, res, next) {
  try {
    const text = req.body.text || req.body.requirementText;
    if (!text || typeof text !== "string") {
      return sendError(res, "Please provide text for language detection.", 400);
    }

    const detection = detectLanguage(text);
    return sendSuccess(res, detection, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/language/normalize
 */
export async function handleNormalizeLanguage(req, res, next) {
  try {
    const text = req.body.text || req.body.requirementText;
    const language = req.body.language || req.body.sourceLanguage;

    if (!text || typeof text !== "string") {
      return sendError(res, "Please provide requirement text for normalization.", 400);
    }

    const normalized = await normalizeRequirementMultilingual(text, language);
    return sendSuccess(res, normalized, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/language/translate
 */
export async function handleTranslateLanguage(req, res, next) {
  try {
    const text = req.body.text || req.body.requirementText;
    const sourceLanguage = req.body.sourceLanguage || req.body.language || "EN";

    if (!text || typeof text !== "string") {
      return sendError(res, "Please provide text to translate.", 400);
    }

    const translation = await translateToSearchLanguage(text, sourceLanguage);
    return sendSuccess(res, translation, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/language/supported
 */
export function handleGetSupportedLanguages(req, res) {
  return sendSuccess(res, Object.values(SUPPORTED_LANGUAGES), 200);
}
