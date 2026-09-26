/**
 * NormWise Multilingual Normalization Service (Phase 16)
 * Pipeline:
 * 1. Receive original requirement text
 * 2. Detect language (or use verified user-selected language)
 * 3. Protect Indian Standard identifiers (IS XXXX) -> TOKEN_STANDARD_XXX
 * 4. Protect numbers and technical units (5 L, 230 V, IP66) -> TOKEN_UNIT_XXX
 * 5. Protect technical abbreviations (LED, BLDC, HDPE, ISI, etc.) -> TOKEN_TECH_XXX
 * 6. Normalize whitespace and punctuation
 * 7. Apply controlled technical terminology mappings (DB + verified in-memory dictionary)
 * 8. Apply connective translation
 * 9. Restore protected tokens
 * 10. Produce canonical English search representation
 * 11. Extract structured attributes using Phase 15 extraction
 */

import prisma from "../config/db.js";
import { normalizeLanguageCode, getLanguageName } from "../config/languages.js";
import { detectLanguage } from "./languageDetectionService.js";
import { normalizeUnits } from "./unitNormalizationService.js";
import { translateToSearchLanguage } from "./translationService.js";
import { normalizeRequirement } from "./requirementNormalizationService.js";

// Comprehensive verified multilingual technical terminology dictionary
const MULTILINGUAL_TECHNICAL_TERMS = [
  // --- Pressure Cooker (Kitchenware) ---
  {
    regex: /(?:प्रेशर\s*कुकर(?:ची|चे|चा)?|कुकर|कुकर्स)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:પ્રેશર\s*[કૂકુ]+કર|[કૂકુ]+કર)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:প্রেসার\s*কুকার|কুকার)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:பிரஷர்\s*குக்கர்|குக்கர்)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:ప్రెజర్\s*కుక్కర్|కుక్కర్)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಪ್ರೆಶರ್\s*ಕುಕ್ಕರ್|ಕುಕ್ಕರ್)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:പ്രഷർ\s*കുക്കർ|കുക്കർ)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਪ੍ਰੈਸ਼ਰ\s*ਕੁੱਕਰ|ਕੁੱਕਰ)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ପ୍ରେସର\s*କୁକର|କୁକର)/gi,
    canonical: "pressure cooker",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- LED Street Light Luminaire (Lighting) ---
  {
    regex: /(?:एलईडी\s+स्ट्रीट\s+लाइट(?:ची|चे)?|एलईडी\s+ल्यूमिनेयर|स्ट्रीट\s+लाइट|रस्त्यावरील\s+दिवे)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:એલઇડી\s+સ્ટ્રીટ\s+લાઇટ|સ્ટ્રીટ\s+લાઇટ)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:এলইডি\s+স্ট্রিট\s+লাইট|স্ট্রিট\s+লাইট)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:எல்இடி\s+தெரு\s+விளக்கு|தெரு\s+விளக்கு)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:ఎల్ఈడీ\s+వీధి\s+దీపాలు|వీధి\s+దీపం)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಎಲ್ಇಡಿ\s+ಬೀದಿ\s+ದೀಪ|ಬೀದಿ\s+ದೀಪ)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:എൽഇഡി\s+സ്ട്രീറ്റ്\s+ലൈറ്റ്|സ്ട്രീറ്റ്\s+ലൈറ്റ്)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਐਲਈਡੀ\s+ਸਟ੍ਰੀਟ\s+ਲਾਈਟ|ਸਟ੍ਰੀਟ\s+ਲਾਈਟ)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ଏଲଇଡି\s+ଷ୍ଟ୍ରିଟ\s+ଲାଇଟ|ଷ୍ଟ୍ରିଟ\s+ଲାଇଟ)/gi,
    canonical: "LED street light luminaire",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- Commercial Induction Cooking Hob ---
  {
    regex: /(?:इंडक्शन\s+कुकटॉप|इंडक्शन\s+चूल्हा|इंडक्शन\s+शेगडी)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:ઇન્ડક્શન\s+કૂકટોપ|ઇન્ડક્શન\s+ચૂલો)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:ইন্ডাকশন\s+কুকটপ|ইন্ডাকশন\s+চুলা)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:இண்டக்ஷன்\s+குக்கர்|இண்டக்ஷன்\s+அடுப்பு)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:ఇండక్షన్\s+కుక్‌టాప్|ఇండక్షన్\s+పొయ్యి)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಇಂಡಕ್ಷನ್\s+ಕುಕ್‌ಟಾಪ್|ಇಂಡಕ್ಷನ್\s+ಒಲೆ)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:ഇൻഡക്ഷൻ\s+കുക്ക്ടോപ്പ്|ഇൻഡക്ഷൻ\s+അടുപ്പ്)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਇੰਡਕਸ਼ਨ\s+ਕੁੱਕਟੌਪ|ਇੰਡਕਸ਼ਨ\s+ਚੁੱਲ੍ਹਾ)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ଇଣ୍ଡକସନ\s+କୁକଟପ|ଇଣ୍ଡକସନ\s+ଚୁଲା)/gi,
    canonical: "commercial induction cooking hob",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- BLDC Ceiling Fan ---
  {
    regex: /(?:बीएलडीसी\s+सीलिंग\s+फैन|छत\s+का\s+पंखा|सिलिंग\s+फॅन|छताचा\s+पंखा)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:બીએલડીસી\s+સીલિંગ\s+ફેન|સીલિંગ\s+પંખો|પંખો)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:বিএলডিসি\s+সিলিং\s+ফ্যান|সিলিং\s+ফ্যান|পাখা)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:பிஎல்டிசி\s+சீலிங்\s+ஃபேன்|மின்விசிறி)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:బీఎల్‌డీసీ\s+సీలింగ్\s+ఫ్యాన్|సీలింగ్\s+ఫ్యాన్)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಬಿಎಲ್‌ಡಿಸಿ\s+ಸೀಲಿಂಗ್\s+ಫ್ಯಾನ್|ಸೀಲಿಂಗ್\s+ಫ್ಯಾನ್)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:ബിഎൽഡിസി\s+സീലിംഗ്\s+ഫാൻ|സീലിംഗ്\s+ഫാൻ)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਬੀਐਲਡੀਸੀ\s+ਸੀਲਿੰਗ\s+ਫੈਨ|ਸੀਲਿੰਗ\s+ਪੱਖਾ)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ବିଏଲଡିସି\s+ସିଲିଂ\s+ଫ୍ୟାନ|ସିଲିଂ\s+ପଙ୍ଖା)/gi,
    canonical: "BLDC ceiling fan",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- Electrical Switches & Sockets ---
  {
    regex: /(?:सॉकेट\s+आउटलेट|विद्युत\s+स्विच|मॉड्यूलर\s+स्विच|इलेक्ट्रिकल\s+सॉकेट)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:સોકેટ\s+આઉટલેટ|ઇલેક્ટ્રિકલ\s+સ્વિચ)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:সকেট\s+আউটলেট|বৈদ্যুতিক\s+সুইচ)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:சாக்கெட்\s+அவுட்லெட்|மின்\s+சுவிட்ச்)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:సాకెట్\s+అవుట్‌లెట్|ఎలక్ట్రికల్\s+స్విచ్)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಸಾಕೆಟ್\s+ಔಟ್‌ಲೆಟ್|ವಿದ್ಯುತ್\s+ಸ್ವಿಚ್)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:സോക്കറ്റ്\s+ഔട്ട്ലെറ്റ്|ഇലക്ട്രിക്കൽ\s+സ്വിച്ച്)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਸਾਕਟ\s+ਆਊਟਲੈੱਟ|ਇਲੈਕਟ੍ਰੀਕਲ\s+ਸਵਿੱਚ)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ସକେଟ\s+ଆଉଟଲେଟ|ବୈଦ୍ୟୁତିକ\s+ସୁଇଚ)/gi,
    canonical: "electrical socket outlet",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- HDPE Pipes ---
  {
    regex: /(?:एचडीपीई\s+पाइप(?:लाइन)?|एचडीपीई\s+पाईप|पाणी\s+पुरवठा\s+पाईप)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:એચડીપીઇ\s+પાઇપ|પાણી\s+પુરવઠા\s+પાઇપ)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["GU"],
  },
  {
    regex: /(?:এইচডিপিই\s+পাইপ|জল\s+সরবরাহের\s+পাইপ)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["BN"],
  },
  {
    regex: /(?:எச்டிபிஇ\s+குழாய்|குடிநீர்\s+குழாய்)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["TA"],
  },
  {
    regex: /(?:హెచ్‌డీపీఈ\s+పైపులు|నీటి\s+సరఫరా\s+పైపులు)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["TE"],
  },
  {
    regex: /(?:ಎಚ್‌ಡಿಪಿಇ\s+ಪೈಪ್|ನೀರು\s+ಸರಬರಾಜು\s+ಪೈಪ್)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["KN"],
  },
  {
    regex: /(?:എച്ച്ഡിപിഇ\s+പൈപ്പ്|കുടിവെള്ള\s+പൈപ്പ്)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["ML"],
  },
  {
    regex: /(?:ਐਚਡੀਪੀਈ\s+ਪਾਈਪ|ਪਾਣੀ\s+ਸਪਲਾਈ\s+ਪਾਈਪ)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["PA"],
  },
  {
    regex: /(?:ଏଚଡିପିଇ\s+ପାଇପ|ଜଳ\s+ଯୋଗାଣ\s+ପାଇପ)/gi,
    canonical: "HDPE water pipe",
    termType: "PRODUCT",
    languages: ["OR"],
  },

  // --- Materials: Stainless Steel ---
  {
    regex: /(?:स्टेनलेस\s+स्टील(?:चे|चा|ची|का|की)?|एसएस\s*304)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:સ્ટેનલેસ\s+સ્ટીલ)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["GU"],
  },
  {
    regex: /(?:স্টেইনলেস\s+স্টিল|মরিচাহীন\s+ইস্পাত)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["BN"],
  },
  {
    regex: /(?:துருப்பிடிக்காத\s+எஃகு|ஸ்டெயின்லெஸ்\s+ஸ்டீல்)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["TA"],
  },
  {
    regex: /(?:స్టెయిన్‌లెస్\s+స్టీల్)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["TE"],
  },
  {
    regex: /(?:ಸ್ಟೇನ್‌ಲೆಸ್\s+ಸ್ಟೀಲ್)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["KN"],
  },
  {
    regex: /(?:സ്റ്റെയിൻലെസ്സ്\s+സ്റ്റീൽ)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["ML"],
  },
  {
    regex: /(?:ਸਟੇਨਲੈਸ\s+ਸਟੀਲ)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["PA"],
  },
  {
    regex: /(?:ଷ୍ଟେନଲେସ\s+ଷ୍ଟିଲ)/gi,
    canonical: "stainless steel",
    termType: "MATERIAL",
    languages: ["OR"],
  },

  // --- Application Domains ---
  {
    regex: /(?:संस्थागत\s+रसोई|संस्थागत\s+कॅन्टीन|कॅन्टीन|हॉस्टेल)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["HI", "MR"],
  },
  {
    regex: /(?:સંસ્થાકીય\s+રસોડું|કેન્ટીન)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["GU"],
  },
  {
    regex: /(?:প্রাতিষ্ঠানিক\s+রান্নাঘর|ক্যান্টিন)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["BN"],
  },
  {
    regex: /(?:நிறுவன\s+சமையலறை|உணவகம்)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["TA"],
  },
  {
    regex: /(?:సంస్థాగత\s+వంటగది|క్యాంటీన్)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["TE"],
  },
  {
    regex: /(?:ಸಾಂಸ್ಥಿಕ\s+ಅಡುಗೆಮನೆ|ಕ್ಯಾಂಟೀನ್)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["KN"],
  },
  {
    regex: /(?:സ്ഥാപന\s+അടുക്കള|കാന്റീൻ)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["ML"],
  },
  {
    regex: /(?:ਸੰਸਥਾਗਤ\s+ਰਸੋਈ|ਕੰਟੀਨ)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["PA"],
  },
  {
    regex: /(?:ସାଂସ୍ଥାଗତ\s+ରୋଷେଇ\s+ଘର|କ୍ୟାଣ୍ଟିନ)/gi,
    canonical: "institutional kitchen",
    termType: "APPLICATION",
    languages: ["OR"],
  },
];

// Protected token patterns (Sections 6 & 7)
export const PROTECTED_PATTERNS = {
  // Indian Standard Numbers: IS XXXX, IS 10322 (Part 5/Sec 3):2012, etc.
  STANDARD_ID: /\bIS\s*(?:[A-Z0-9\/\(\)\:\s\-]+)?\d{3,5}(?::\d{4})?(?:\s*\([^\)]+\))?\b/gi,
  // Technical abbreviations
  ABBREVIATIONS: /\b(?:LED|BLDC|HDPE|ISI|CRS|QCO|AISI|SS\s*304|PE[\s\-_]*100)\b/gi,
  // Engineering units & ratings
  UNITS_RATINGS: /\b\d+(?:\.\d+)?\s*(?:L|mL|kV|V|kW|W|A|Hz|mm|cm|m|kg)\b|\b(?:IP[56][45678]|IK(?:0[6789]|10)|PN\s*\d+)\b/gi,
};

/**
 * Protects standard identifiers, units, and technical abbreviations using opaque tokens
 * @param {string} text - Input text
 * @returns {{ protectedText: string, tokenMap: Map<string, { type: string, value: string, original: string }> }}
 */
export function protectTokens(text) {
  const tokenMap = new Map();
  let tokenCounter = 0;
  let workingText = text || "";

  // Standardize unit formatting first
  workingText = normalizeUnits(workingText);

  // A. Protect Standard Identifiers
  workingText = workingText.replace(PROTECTED_PATTERNS.STANDARD_ID, (match) => {
    tokenCounter++;
    const placeholder = `TOKEN_STANDARD_${String(tokenCounter).padStart(3, "0")}`;
    tokenMap.set(placeholder, { type: "STANDARD", value: match.trim(), original: match.trim() });
    return placeholder;
  });

  // B. Protect Units & Numerical Ratings
  workingText = workingText.replace(PROTECTED_PATTERNS.UNITS_RATINGS, (match) => {
    tokenCounter++;
    const placeholder = `TOKEN_UNIT_${String(tokenCounter).padStart(3, "0")}`;
    tokenMap.set(placeholder, { type: "UNIT", value: match.trim(), original: match.trim() });
    return placeholder;
  });

  // C. Protect Technical Abbreviations
  workingText = workingText.replace(PROTECTED_PATTERNS.ABBREVIATIONS, (match) => {
    tokenCounter++;
    const placeholder = `TOKEN_TECH_${String(tokenCounter).padStart(3, "0")}`;
    tokenMap.set(placeholder, { type: "ABBREVIATION", value: match.trim(), original: match.trim() });
    return placeholder;
  });

  return { protectedText: workingText, tokenMap };
}

/**
 * Restores protected tokens back to their original values
 * @param {string} text - Text containing token placeholders
 * @param {Map<string, { value: string }>} tokenMap - Mapping of placeholders to original values
 * @returns {string} Restored text
 */
export function restoreTokens(text, tokenMap) {
  if (!text || !tokenMap) return text || "";
  let restored = text;
  for (const [placeholder, meta] of tokenMap.entries()) {
    restored = restored.replace(new RegExp(placeholder, "g"), meta.value);
  }
  return restored;
}

/**
 * Normalizes input text across all 11 Indian languages, protects technical tokens,
 * applies terminology harmonization, and generates clean English search representation.
 *
 * @param {string} rawInput - Natural language requirement
 * @param {string} userLanguageOverride - Optional manual language selection from user
 * @returns {Promise<Object>} Normalized multilingual requirement payload
 */
export async function normalizeRequirementMultilingual(rawInput, userLanguageOverride = null) {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      originalText: "",
      detectedLanguage: "UNKNOWN",
      originalLanguage: "UNKNOWN",
      normalizedText: "",
      searchText: "",
      protectedTerms: [],
      extractedAttributes: {},
      isAmbiguous: true,
      ambiguityReason: "No requirement text provided.",
      clarifyingQuestions: ["Please provide a procurement requirement."],
    };
  }

  const originalText = rawInput.trim();

  // 1. Language Detection / Override
  let detectedLanguage = "UNKNOWN";
  let detectionConfidence = 0.0;
  let detectionMethod = "manual-selection";

  if (userLanguageOverride && userLanguageOverride !== "AUTO" && userLanguageOverride !== "Auto Detect") {
    detectedLanguage = normalizeLanguageCode(userLanguageOverride);
    detectionConfidence = 1.0;
  } else {
    const det = detectLanguage(originalText);
    detectedLanguage = det.language;
    detectionConfidence = det.confidence;
    detectionMethod = det.method;
  }

  // 2. Protect Standard Identifiers and Units
  const { protectedText, tokenMap } = protectTokens(originalText);
  let workingText = protectedText;

  // 3. Normalize Terminology using DB verified terms + in-memory verified lexicon
  const matchedTerms = [];

  // Query database for custom verified terminology (if database is accessible)
  let dbTerms = [];
  try {
    if (detectedLanguage !== "EN" && detectedLanguage !== "UNKNOWN") {
      dbTerms = await prisma.standardTerm.findMany({
        where: {
          language: detectedLanguage,
          isVerified: true,
        },
      });
    }
  } catch (err) {
    // Database query resilience
    dbTerms = [];
  }

  // Apply DB terms first
  for (const termRecord of dbTerms) {
    const escaped = termRecord.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`\\b${escaped}\\b`, "gi");
    if (reg.test(workingText)) {
      workingText = workingText.replace(reg, termRecord.normalizedTerm);
      matchedTerms.push(termRecord.normalizedTerm);
    }
  }

  // Apply in-memory multilingual terminology
  for (const item of MULTILINGUAL_TECHNICAL_TERMS) {
    if (item.languages.includes(detectedLanguage) || detectedLanguage === "UNKNOWN") {
      if (item.regex.test(workingText)) {
        workingText = workingText.replace(item.regex, item.canonical);
        matchedTerms.push(item.canonical);
      }
    }
  }

  // 4. Translate connective words to English search language
  const translationRes = await translateToSearchLanguage(workingText, detectedLanguage);
  workingText = translationRes.translatedText;

  // 5. Restore Protected Tokens
  for (const [placeholder, meta] of tokenMap.entries()) {
    workingText = workingText.replace(new RegExp(placeholder, "g"), meta.value);
  }

  // Clean extra spaces & punctuation
  const searchText = workingText.replace(/\s+/g, " ").trim();

  // 6. Extract structured attributes using Phase 15 normalization engine
  const extracted = normalizeRequirement(searchText);

  // Preserve original text and language attributes
  const normalizedText = searchText;
  const isAmbiguous = extracted.isAmbiguous || detectedLanguage === "UNKNOWN";
  const ambiguityReason = detectedLanguage === "UNKNOWN"
    ? "Requirement language could not be determined with high confidence. Please specify requirement language."
    : extracted.ambiguityReason;

  const protectedTerms = Array.from(tokenMap.values());

  return {
    originalText,
    detectedLanguage,
    originalLanguage: detectedLanguage,
    languageConfidence: detectionConfidence,
    languageName: getLanguageName(detectedLanguage),
    normalizedText,
    searchText,
    protectedTerms,
    extractedAttributes: {
      ...extracted,
      language: detectedLanguage,
    },
    normalizationMethod: dbTerms.length > 0 ? "HYBRID_DB_LEXICON" : "DETERMINISTIC_LEXICON",
    translationMethod: translationRes.method,
    isAmbiguous,
    ambiguityReason,
    clarifyingQuestions: extracted.clarifyingQuestions || [],
  };
}
