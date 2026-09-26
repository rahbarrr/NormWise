import { Router } from "express";
import {
  handleDetectLanguage,
  handleNormalizeLanguage,
  handleTranslateLanguage,
  handleGetSupportedLanguages,
} from "../controllers/language.controller.js";

const router = Router();

router.post("/detect", handleDetectLanguage);
router.post("/normalize", handleNormalizeLanguage);
router.post("/translate", handleTranslateLanguage);
router.get("/supported", handleGetSupportedLanguages);

export default router;
