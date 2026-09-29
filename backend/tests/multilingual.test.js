/**
 * Phase 16 Test Suite: Multilingual Input, Translation & Technical Terminology Normalization
 * Strictly implements all 25 test specifications outlined in Section 30 of Phase 16.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import { detectLanguage } from "../src/services/languageDetectionService.js";
import { normalizeUnitFormatting, extractUnitMentions } from "../src/services/unitNormalizationService.js";
import { translateToSearchLanguage } from "../src/services/translationService.js";
import {
  normalizeRequirementMultilingual,
  protectTokens,
  restoreTokens,
} from "../src/services/requirement/multilingualService.js";
import { recommend } from "../src/services/recommendation/recommendationService.js";
import { processDocument } from "../src/services/documents/processingService.js";
import { SUPPORTED_LANGUAGES } from "../src/config/languages.js";

describe("Phase 16: Multilingual Input, Translation & Terminology Normalization", () => {
  // 1. English input
  it("1. should properly process English input", async () => {
    const input = "Stainless steel pressure cooker 5 L capacity IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "EN");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 2. Hindi input
  it("2. should detect and normalize Hindi input", async () => {
    const input = "स्टेनलेस स्टील का 5 litre प्रेशर कुकर घरेलू उपयोग के लिए IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "HI");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.ok(res.searchText.toLowerCase().includes("stainless steel"));
    assert.equal(res.originalText, input);
  });

  // 3. Marathi input
  it("3. should detect and normalize Marathi input", async () => {
    const input = "घरगुती स्वयंपाकासाठी स्टेनलेस स्टीलचे 5 litre प्रेशर कुकर IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "MR");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 4. Gujarati input
  it("4. should detect and normalize Gujarati input", async () => {
    const input = "ઘરેલું રસોઈ માટે સ્ટેનલેસ સ્ટીલનું 5 litre પ્રેશર કુકર IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "GU");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 5. Tamil input
  it("5. should detect and normalize Tamil input", async () => {
    const input = "வீட்டு சமையலுக்கு ஸ்டெயின்லெஸ் ஸ்டீல் 5 litre பிரஷர் குக்கர் IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "TA");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 6. Telugu input
  it("6. should detect and normalize Telugu input", async () => {
    const input = "గృహ వంట కోసం స్టెయిన్‌లెస్ స్టీల్ 5 litre ప్రెజర్ కుక్కర్ IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "TE");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 7. Bengali input
  it("7. should detect and normalize Bengali input", async () => {
    const input = "গার্হস্থ্য রান্নার জন্য স্টেইনলেস স্টিলের 5 litre প্রেসার কুকার IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "BN");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 8. Kannada input
  it("8. should detect and normalize Kannada input", async () => {
    const input = "ಮನೆಯ ಅಡುಗೆಗಾಗಿ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ 5 litre ಪ್ರೆಶರ್ ಕುಕ್ಕರ್ IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "KN");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 9. Malayalam input
  it("9. should detect and normalize Malayalam input", async () => {
    const input = "ഗാർഹിക പാചകത്തിന് സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ 5 litre പ്രഷർ കുക്കർ IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "ML");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 10. Punjabi input
  it("10. should detect and normalize Punjabi input", async () => {
    const input = "ਘਰੇਲੂ ਰਸੋਈ ਲਈ ਸਟੇਨਲੈਸ ਸਟੀਲ 5 litre ਪ੍ਰੈਸ਼ਰ ਕੁੱਕਰ IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "PA");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 11. Odia input
  it("11. should detect and normalize Odia input", async () => {
    const input = "ଘରୋଇ ରୋଷେଇ ପାଇଁ ଷ୍ଟେନଲେସ୍ ଷ୍ଟିଲ୍ 5 litre ପ୍ରେସର କୁକର IS 2347:2023";
    const res = await normalizeRequirementMultilingual(input);
    assert.equal(res.detectedLanguage, "OR");
    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.equal(res.originalText, input);
  });

  // 12. Auto language detection
  it("12. should perform automatic script-based language detection accurately", () => {
    assert.equal(detectLanguage("Commercial induction cooker for kitchen").language, "EN");
    assert.equal(detectLanguage("घरेलू उपयोग के लिए एलईडी बल्ब").language, "HI");
    assert.equal(detectLanguage("വീട്ടുപകരണങ്ങൾ").language, "ML");
    assert.equal(detectLanguage("શેરી લાઇટિંગ માટે").language, "GU");
  });

  // 13. Unknown language detection
  it("13. should return UNKNOWN when confidence is too low without guessing silently", () => {
    const emptyRes = detectLanguage("");
    assert.equal(emptyRes.language, "UNKNOWN");
    assert.equal(emptyRes.isUncertain, true);

    const punctuationRes = detectLanguage("??? 12345 !!!");
    assert.equal(punctuationRes.language, "UNKNOWN");
    assert.equal(punctuationRes.isUncertain, true);
  });

  // 14. Protected IS number
  it("14. should protect IS standard identifiers from translation mutation", () => {
    const text = "Specification according to IS 2347:2023 and IS 10322 (Part 5/Sec 3):2012";
    const { protectedText, tokenMap } = protectTokens(text);

    assert.ok(!protectedText.includes("IS 2347:2023"));
    assert.ok(protectedText.includes("TOKEN_STANDARD_"));

    const restored = restoreTokens(protectedText, tokenMap);
    assert.ok(restored.includes("IS 2347:2023"));
    assert.ok(restored.includes("IS 10322 (Part 5/Sec 3):2012"));
  });

  // 15. Protected units
  it("15. should normalize unit representations without physical unit conversion", () => {
    assert.equal(normalizeUnitFormatting("5 litre"), "5 L");
    assert.equal(normalizeUnitFormatting("230 volt"), "230 V");
    assert.equal(normalizeUnitFormatting("100 watts"), "100 W");
    assert.equal(normalizeUnitFormatting("10 bar pressure"), "10 bar pressure");

    const mentions = extractUnitMentions("50 mm diameter 10 kg weight 230 V");
    assert.ok(mentions.some((m) => m.standardized === "230 V"));
  });

  // 16. Protected abbreviations
  it("16. should protect technical abbreviations like ISI, CRS, LED, IP65", () => {
    const text = "Mandatory ISI mark and CRS registration for LED street luminaire with IP65";
    const { protectedText, tokenMap } = protectTokens(text);

    assert.ok(!protectedText.includes("IP65"));
    const restored = restoreTokens(protectedText, tokenMap);
    assert.ok(restored.includes("ISI"));
    assert.ok(restored.includes("CRS"));
    assert.ok(restored.includes("LED"));
    assert.ok(restored.includes("IP65"));
  });

  // 17. Technical terminology normalization
  it("17. should normalize known technical terminology from Indic variants to standard English", async () => {
    const hindiInput = "स्टेनलेस स्टील प्रेशर कुकर";
    const res = await normalizeRequirementMultilingual(hindiInput);

    assert.ok(res.searchText.toLowerCase().includes("pressure cooker"));
    assert.ok(res.searchText.toLowerCase().includes("stainless steel"));
  });

  // 18. Translation fallback
  it("18. should gracefully utilize deterministic fallback when no external translation provider is present", async () => {
    const result = await translateToSearchLanguage("घरेलू उपयोग के लिए प्रेशर कुकर", "HI");

    assert.ok(result.translationText);
    assert.equal(result.translationMethod, "DETERMINISTIC_LEXICON");
    assert.equal(result.confidence, "HIGH");
  });

  // 19. Missing translation provider
  it("19. should not break the application if TRANSLATION_PROVIDER is unset", async () => {
    delete process.env.TRANSLATION_PROVIDER;
    const res = await normalizeRequirementMultilingual("घरेलू उपयोग 5 L");

    assert.ok(res.searchText);
    assert.equal(res.detectedLanguage, "HI");
  });

  // 20. Multilingual recommendation
  it("20. should execute hybrid recommendation seamlessly on non-English requirement", async () => {
    const reqText = "स्टेनलेस स्टील का 5 litre प्रेशर कुकर IS 2347:2023";
    const rec = await recommend(reqText, { debug: true });

    assert.ok(rec.primaryRecommendation);
    assert.equal(rec.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.equal(rec.provenance.originalLanguage, "HI");
    assert.equal(rec.originalText, reqText);
    assert.ok(rec.searchText);
  });

  // 21. Original text preservation
  it("21. should preserve original natural language requirement as permanent source of truth", async () => {
    const originalText = "గృహ వంట కోసం స్టెయిన్‌లెస్ స్టీల్ 5 litre ప్రెజర్ కుక్కర్";
    const rec = await recommend(originalText);

    assert.equal(rec.originalText, originalText);
    assert.notEqual(rec.originalText, rec.searchText);

    if (rec.id) {
      const dbRec = await prisma.recommendation.findUnique({ where: { id: rec.id } });
      if (dbRec) {
        assert.equal(dbRec.originalText, originalText);
        assert.equal(dbRec.detectedLanguage, "TE");
      }
    }
  });

  // 22. Normalized text generation
  it("22. should generate an explicit normalized search representation for retrieval", async () => {
    const input = "ಘರೇಲು 5 litre ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ ಪ್ರೆಶರ್ ಕುಕ್ಕರ್";
    const res = await normalizeRequirementMultilingual(input);

    assert.ok(res.searchText);
    assert.ok(res.normalizedText);
    assert.ok(res.searchText.includes("pressure cooker") || res.searchText.includes("5 L"));
  });

  // 23. Ambiguous terminology
  it("23. should flag ambiguity and require clarification for ambiguous terms", async () => {
    const ambiguousInput = "industrial cooker for commercial kitchen";
    const rec = await recommend(ambiguousInput);

    assert.ok(
      rec.state === "CLARIFICATION_REQUIRED" ||
      rec.extractedAttributes?.isAmbiguous ||
      rec.clarificationQuestions?.length > 0
    );
  });

  // 24. Missing product information
  it("24. should request clarification when product taxonomy cannot be determined", async () => {
    const missingProduct = "high quality heavy duty 230 V 50 Hz";
    const res = await normalizeRequirementMultilingual(missingProduct);

    assert.equal(res.extractedAttributes?.product, null);
    assert.equal(res.extractedAttributes?.isAmbiguous, true);
  });

  // 25. Existing Phase 1–15 functionality
  it("25. should preserve all Phase 1–15 core recommendation, compliance, and allied capabilities", async () => {
    const engInput = "Stainless steel pressure cooker, 5 litre, for institutional kitchen use.";
    const rec = await recommend(engInput);

    assert.ok(rec.primaryRecommendation);
    assert.equal(rec.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.ok(rec.matchScore >= 0.7);
    assert.ok(rec.provenance);

    const auditEvents = await prisma.auditEvent.findMany({
      where: { recommendationId: rec.recommendationId },
    });
    assert.ok(auditEvents.length > 0);
  });
});
