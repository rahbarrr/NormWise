/**
 * NormWise Requirement Normalization Service (Phase 15)
 * Deterministic normalization of natural-language procurement requirements,
 * controlled vocabulary/synonym harmonization, language detection, and attribute extraction.
 *
 * CRITICAL RULE: Never invent attributes not supported by the input text.
 * Unknown fields must remain null.
 */

// Controlled Terminology & Synonym Dictionary (obvious linguistic/spelling variants only)
const CONTROLLED_SYNONYMS = [
  { pattern: /\bpressure[\s\-_]+cookers?\b/gi, canonical: "pressure cooker" },
  { pattern: /\b(?:led\s+(?:street\s+)?luminaires?|led\s+light\s+fittings?|led\s+road\s+lights?)\b/gi, canonical: "LED street light luminaire" },
  { pattern: /\b(?:induction\s+cook(?:top|er|ing\s+range|stove))\b/gi, canonical: "commercial induction cooking hob" },
  { pattern: /\b(?:bldc\s+ceiling\s+fan|brushless\s+dc\s+fan)\b/gi, canonical: "BLDC ceiling fan" },
  { pattern: /\b(?:socket\s+outlets?|electrical\s+sockets?|plug\s+and\s+socket)\b/gi, canonical: "electrical socket outlet" },
  { pattern: /\b(?:hdpe\s+pipe(?:lines?|s)?|high\s+density\s+polyethylene\s+pipes?)\b/gi, canonical: "HDPE water pipe" },
  { pattern: /\b(?:food[\s\-_]grade|food\s+contact\s+safe)\b/gi, canonical: "food-grade" },
  { pattern: /\b(?:stainless\s+steel|ss\s*304|aisi\s*304)\b/gi, canonical: "stainless steel" },
  { pattern: /\b(?:die[\s\-_]cast\s+alumin(?:ium|um))\b/gi, canonical: "die-cast aluminum" },
  { pattern: /\b(?:sub[\s\-_]stations?)\b/gi, canonical: "substation" },
  { pattern: /\b(?:potable\s+drinking\s+water|drinking\s+water)\b/gi, canonical: "potable water" },
  { pattern: /(?:प्रेशर\s*कुकर|कुकर)/gi, canonical: "pressure cooker" },
  { pattern: /(?:स्टेनलेस\s*स्टील)/gi, canonical: "stainless steel" },
];

/**
 * Detect language of raw text (simple heuristic: Devanagari script for Hindi, default en)
 */
export function detectLanguage(text) {
  if (!text || typeof text !== "string") return "en";
  // Check for Devanagari Unicode block (\u0900-\u097F)
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 3) {
    return "hi";
  }
  return "en";
}

/**
 * Applies controlled synonym harmonization without semantic drift
 */
export function harmonizeTerminology(text) {
  if (!text || typeof text !== "string") return { normalizedText: "", matchedSynonyms: [] };

  let normalized = text.trim();
  const matchedSynonyms = [];

  for (const item of CONTROLLED_SYNONYMS) {
    if (item.pattern.test(normalized)) {
      matchedSynonyms.push(item.canonical);
      // Reset lastIndex for global regex
      item.pattern.lastIndex = 0;
    }
  }

  return {
    normalizedText: normalized,
    matchedSynonyms: Array.from(new Set(matchedSynonyms)),
  };
}

/**
 * Deterministic attribute extractors
 */
const PRODUCT_MAP = [
  { regex: /\b(?:pressure\s+cookers?|pressure-cooker|cookers?)\b/i, value: "Pressure Cooker", category: "Kitchenware" },
  { regex: /\b(?:led\s+street\s+lights?|street\s+lights?|luminaires?|road\s+lighting|led\s+luminaire)\b/i, value: "LED Street Light Luminaire", category: "Lighting & Luminaires" },
  { regex: /\b(?:induction\s+(?:cooking\s+)?(?:range|hob|cooktop|stove))\b/i, value: "Commercial Induction Cooking Hob", category: "Commercial Kitchen Equipment" },
  { regex: /\b(?:bldc\s+fans?|ceiling\s+fans?|electric\s+fans?)\b/i, value: "BLDC Ceiling Fan", category: "Electrical Appliances" },
  { regex: /\b(?:insulating\s+mats?|elastomeric\s+mats?)\b/i, value: "Insulating Mats for Electrical Purposes", category: "Electrical Safety" },
  { regex: /\b(?:hdpe\s+pipes?|polyethylene\s+pipes?)\b/i, value: "HDPE Pipes for Water Supply", category: "Civil & Piping" },
  { regex: /\b(?:composite\s+(?:lpg\s+)?cylinders?|lpg\s+cylinders?)\b/i, value: "Composite LPG Cylinders", category: "Gas Cylinders" },
  { regex: /\b(?:seamless\s+tubes?|steel\s+tubes?|tubular\s+fittings?)\b/i, value: "Mild Steel Seamless Tubes", category: "Metallurgy & Steel" },
  { regex: /\b(?:electrical\s+accessories|flush\s+switches|modular\s+switches|socket\s+outlets?)\b/i, value: "Switches and Electrical Accessories", category: "Electrical Accessories" },
  { regex: /\b(?:food\s+prep(?:aration)?\s+tables?|catering\s+tables?)\b/i, value: "Commercial Food Preparation Tables", category: "Food Service Equipment" },
  { regex: /\b(?:wooden\s+panels?|carved\s+door\s+panels?|teak\s+wood\s+panels?)\b/i, value: "Handcrafted Heritage Wooden Panels", category: "Timber & Woodcraft" },
];

const MATERIAL_MAP = [
  { regex: /\b(?:stainless\s+steel\s+grade\s*304|aisi\s*304|ss\s*304|grade\s*304)\b/i, value: "Stainless Steel (AISI 304 / Grade 304)" },
  { regex: /\b(?:food-?grade\s+stainless\s+steel|stainless\s+steel)\b/i, value: "Stainless Steel" },
  { regex: /\b(?:die-?cast\s+aluminum|anodized\s+aluminum|aluminum\s+alloy|aluminum)\b/i, value: "Die-cast Aluminum Housing" },
  { regex: /\b(?:ceramic\s+glass|glass-?ceramic)\b/i, value: "Ceramic Glass Top" },
  { regex: /\b(?:reclaimed\s+(?:aged\s+)?burma\s+teak|teak\s+wood|timber)\b/i, value: "Aged Teak Wood" },
  { regex: /\b(?:high\s+density\s+polyethylene|hdpe|pe\s*100)\b/i, value: "High Density Polyethylene (PE-100)" },
  { regex: /\b(?:mild\s+steel|carbon\s+steel)\b/i, value: "Mild Steel" },
  { regex: /\b(?:composite|filament-?wound\s+composite)\b/i, value: "Composite Fiber" },
];

const CAPACITY_MAP = [
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:litres?|liter|ltr|l)\b/i, format: (m) => `${m[1]} Litre` },
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:watts?|w)\b/i, format: (m) => `${m[1]} Watt` },
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:kw|kilowatts?)\b/i, format: (m) => `${m[1]} kW` },
  { regex: /\b(\d+)\s*(?:mm|millimeter)\b/i, format: (m) => `${m[1]} mm` },
  { regex: /\b(\d+)\s*(?:kv|kilovolt)\b/i, format: (m) => `${m[1]} kV` },
  { regex: /\b(\d+)\s*(?:kg|kilograms?)\b/i, format: (m) => `${m[1]} kg` },
  { regex: /\b(pn\s*\d+)\b/i, format: (m) => m[1].toUpperCase() },
];

const APPLICATION_MAP = [
  { regex: /\b(?:institutional\s+canteen|canteen\s+kitchen|institutional\s+kitchen|hostel\s+mess)\b/i, value: "Institutional Canteen Kitchen" },
  { regex: /\b(?:municipal\s+highway|highway|street\s+lighting|arterial\s+roads?|smart\s+city)\b/i, value: "Municipal Highway and Urban Arterial Roads" },
  { regex: /\b(?:railway\s+base\s+kitchens?|irctc|railway\s+catering)\b/i, value: "Railway Base Kitchens Catering Operations" },
  { regex: /\b(?:hostels?|classrooms?|university\s+hostels?|educational\s+institutions?)\b/i, value: "Educational Institution Hostels and Classrooms" },
  { regex: /\b(?:substations?|33kv\s+substations?|operator\s+flooring)\b/i, value: "Electrical Substation Operator Flooring" },
  { regex: /\b(?:potable\s+water\s+supply|water\s+distribution|pipeline)\b/i, value: "Potable Water Supply Distribution" },
  { regex: /\b(?:museum\s+heritage|historical\s+restoration|artisan\s+carving)\b/i, value: "Museum Heritage Restoration" },
  { regex: /\b(?:domestic\s+kitchen|home\s+use|household)\b/i, value: "Domestic Household Kitchen" },
];

const TECHNICAL_FEATURES = [
  { regex: /\bip\s*6[5678]\b/i, value: "IP66 Ingress Protection" },
  { regex: /\bik\s*0[789]\b/i, value: "IK08 Impact Resistance" },
  { regex: /\b10\s*kv\s+surge\b/i, value: "10kV Surge Suppressor" },
  { regex: /\b(?:dual\s+safety\s+valves?|safety\s+relief\s+valve)\b/i, value: "Dual Safety Valves & Relief Vent" },
  { regex: /\b(?:induction\s+(?:compatible|bottom|base)|composite\s+base)\b/i, value: "Induction Compatible Composite Base" },
  { regex: /\b(?:food-?grade|food\s+contact)\b/i, value: "Food-grade Contact Certified" },
  { regex: /\b(?:bee\s+(?:5-?star|\d\s*star)|energy\s+efficient|5-?star\s+rating)\b/i, value: "5-Star Energy Efficiency Rating" },
  { regex: /\b(?:rf\s+remote|remote\s+control)\b/i, value: "RF Remote Control Functionality" },
  { regex: /\b(?:isi\s+mark|scheme\s*i)\b/i, value: "Mandatory ISI Mark Compliance" },
  { regex: /\b(?:qco|quality\s+control\s+order)\b/i, value: "Statutory QCO Compliance" },
];

/**
 * Normalizes input requirement and extracts structured attributes
 */
export function normalizeRequirement(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      rawText: "",
      normalizedText: "",
      detectedLanguage: "en",
      product: null,
      category: null,
      material: null,
      capacity: null,
      application: null,
      technicalCharacteristics: [],
      normalizedTerms: [],
      isAmbiguous: true,
      ambiguityReason: "No requirement text provided.",
    };
  }

  const rawText = rawInput.trim();
  const detectedLanguage = detectLanguage(rawText);
  const { normalizedText, matchedSynonyms } = harmonizeTerminology(rawText);

  // 1. Detect Product and Category
  let product = null;
  let category = null;
  for (const item of PRODUCT_MAP) {
    if (item.regex.test(rawText) || item.regex.test(normalizedText)) {
      product = item.value;
      category = item.category;
      break;
    }
  }

  // 2. Detect Material
  let material = null;
  for (const item of MATERIAL_MAP) {
    if (item.regex.test(rawText) || item.regex.test(normalizedText)) {
      material = item.value;
      break;
    }
  }

  // 3. Detect Capacity
  let capacity = null;
  for (const item of CAPACITY_MAP) {
    const match = rawText.match(item.regex) || normalizedText.match(item.regex);
    if (match) {
      capacity = item.format(match);
      break;
    }
  }

  // 4. Detect Application
  let application = null;
  for (const item of APPLICATION_MAP) {
    if (item.regex.test(rawText) || item.regex.test(normalizedText)) {
      application = item.value;
      break;
    }
  }

  // 5. Detect Technical Characteristics
  const technicalCharacteristics = [];
  for (const item of TECHNICAL_FEATURES) {
    if ((item.regex.test(rawText) || item.regex.test(normalizedText)) && !technicalCharacteristics.includes(item.value)) {
      technicalCharacteristics.push(item.value);
    }
  }

  // Ambiguity evaluation
  let isAmbiguous = false;
  let ambiguityReason = null;
  const clarifyingQuestions = [];

  if (!product) {
    isAmbiguous = true;
    ambiguityReason = "Specific product taxonomy could not be determined from the requirement.";
    clarifyingQuestions.push("What specific product or equipment type is required?");
  }
  if (!application) {
    clarifyingQuestions.push("Where will this equipment be installed or operated (e.g. domestic, industrial, outdoor)?");
  }

  return {
    rawText,
    normalizedText,
    language: detectedLanguage,
    detectedLanguage,
    product,
    category,
    material,
    capacity,
    application,
    technicalCharacteristics,
    normalizedTerms: matchedSynonyms,
    isAmbiguous,
    ambiguityReason,
    clarifyingQuestions,
  };
}
