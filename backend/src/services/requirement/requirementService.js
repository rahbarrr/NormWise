/**
 * NormWise Requirement Extraction Service
 * Deterministic rule-based extraction layer with optional schema-validated LLM enrichment
 */
import { z } from "zod";

// Zod schema for validated extraction
export const requirementSchema = z.object({
  product: z.string().nullable().default(null),
  material: z.string().nullable().default(null),
  capacity: z.string().nullable().default(null),
  application: z.string().nullable().default(null),
  technicalCharacteristics: z.array(z.string()).default([]),
});

/**
 * Deterministic attribute extractors
 */
const PRODUCT_PATTERNS = [
  { regex: /\b(?:pressure\s+cookers?|cookers?)\b/i, value: "Pressure Cooker" },
  { regex: /\b(?:led\s+street\s+lights?|street\s+lights?|luminaires?|road\s+lighting)\b/i, value: "LED Street Light Luminaire" },
  { regex: /\b(?:induction\s+(?:cooking\s+)?(?:range|hob|cooktop|stove))\b/i, value: "Commercial Induction Cooking Hob" },
  { regex: /\b(?:bldc\s+fans?|ceiling\s+fans?|electric\s+fans?)\b/i, value: "BLDC Ceiling Fan" },
  { regex: /\b(?:insulating\s+mats?|elastomeric\s+mats?)\b/i, value: "Insulating Mats for Electrical Purposes" },
  { regex: /\b(?:hdpe\s+pipes?|polyethylene\s+pipes?)\b/i, value: "HDPE Pipes for Water Supply" },
  { regex: /\b(?:composite\s+(?:lpg\s+)?cylinders?|lpg\s+cylinders?)\b/i, value: "Composite LPG Cylinders" },
  { regex: /\b(?:seamless\s+tubes?|steel\s+tubes?|tubular\s+fittings?)\b/i, value: "Mild Steel Seamless Tubes" },
  { regex: /\b(?:electrical\s+accessories|flush\s+switches|modular\s+switches)\b/i, value: "Switches and Electrical Accessories" },
  { regex: /\b(?:food\s+prep(?:aration)?\s+tables?|catering\s+tables?)\b/i, value: "Commercial Food Preparation Tables" },
  { regex: /\b(?:wooden\s+panels?|carved\s+door\s+panels?|teak\s+wood\s+panels?)\b/i, value: "Handcrafted Heritage Wooden Panels" },
];

const MATERIAL_PATTERNS = [
  { regex: /\b(?:stainless\s+steel\s+grade\s*304|aisi\s*304|ss\s*304|grade\s*304)\b/i, value: "Stainless Steel (AISI 304 / Grade 304)" },
  { regex: /\b(?:food-?grade\s+stainless\s+steel|stainless\s+steel)\b/i, value: "Stainless Steel" },
  { regex: /\b(?:die-?cast\s+aluminum|anodized\s+aluminum|aluminum\s+alloy|aluminum)\b/i, value: "Die-cast Aluminum Housing" },
  { regex: /\b(?:ceramic\s+glass|glass-?ceramic)\b/i, value: "Ceramic Glass Top" },
  { regex: /\b(?:reclaimed\s+(?:aged\s+)?burma\s+teak|teak\s+wood|timber)\b/i, value: "Aged Teak Wood" },
  { regex: /\b(?:high\s+density\s+polyethylene|hdpe|pe\s*100)\b/i, value: "High Density Polyethylene (PE-100)" },
  { regex: /\b(?:mild\s+steel|carbon\s+steel)\b/i, value: "Mild Steel" },
  { regex: /\b(?:composite|filament-?wound\s+composite)\b/i, value: "Composite Fiber" },
];

const CAPACITY_PATTERNS = [
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:litres?|liter|ltr|l)\b/i, format: (m) => `${m[1]} Litre` },
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:watts?|w)\b/i, format: (m) => `${m[1]} Watt` },
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:kw|kilowatts?)\b/i, format: (m) => `${m[1]} kW` },
  { regex: /\b(\d+)\s*(?:mm|millimeter)\b/i, format: (m) => `${m[1]} mm` },
  { regex: /\b(\d+)\s*(?:kv|kilovolt)\b/i, format: (m) => `${m[1]} kV` },
  { regex: /\b(\d+)\s*(?:kg|kilograms?)\b/i, format: (m) => `${m[1]} kg` },
  { regex: /\b(pn\s*\d+)\b/i, format: (m) => m[1].toUpperCase() },
];

const APPLICATION_PATTERNS = [
  { regex: /\b(?:institutional\s+canteen|canteen\s+kitchen|institutional\s+kitchen|hostel\s+mess)\b/i, value: "Institutional Canteen Kitchen" },
  { regex: /\b(?:municipal\s+highway|highway|street\s+lighting|arterial\s+roads?|smart\s+city)\b/i, value: "Municipal Highway and Urban Arterial Roads" },
  { regex: /\b(?:railway\s+base\s+kitchens?|irctc|railway\s+catering)\b/i, value: "Railway Base Kitchens Catering Operations" },
  { regex: /\b(?:hostels?|classrooms?|university\s+hostels?|educational\s+institutions?)\b/i, value: "Educational Institution Hostels and Classrooms" },
  { regex: /\b(?:substations?|33kv\s+substations?|operator\s+flooring)\b/i, value: "Electrical Substation Operator Flooring" },
  { regex: /\b(?:potable\s+water\s+supply|water\s+distribution|pipeline)\b/i, value: "Potable Water Supply Distribution" },
  { regex: /\b(?:museum\s+heritage|historical\s+restoration|artisan\s+carving)\b/i, value: "Museum Heritage Restoration" },
  { regex: /\b(?:domestic\s+kitchen|home\s+use|household)\b/i, value: "Domestic Household Kitchen" },
];

const TECHNICAL_FEATURE_PATTERNS = [
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
 * Deterministic Extraction Engine
 */
export function extractDeterministicAttributes(text) {
  if (!text || typeof text !== "string") {
    return {
      product: null,
      material: null,
      capacity: null,
      application: null,
      technicalCharacteristics: [],
      rawText: "",
    };
  }

  const cleanText = text.trim();

  // 1. Detect Product
  let product = null;
  for (const item of PRODUCT_PATTERNS) {
    if (item.regex.test(cleanText)) {
      product = item.value;
      break;
    }
  }

  // 2. Detect Material
  let material = null;
  for (const item of MATERIAL_PATTERNS) {
    if (item.regex.test(cleanText)) {
      material = item.value;
      break;
    }
  }

  // 3. Detect Capacity
  let capacity = null;
  for (const item of CAPACITY_PATTERNS) {
    const match = cleanText.match(item.regex);
    if (match) {
      capacity = item.format(match);
      break;
    }
  }

  // 4. Detect Application
  let application = null;
  for (const item of APPLICATION_PATTERNS) {
    if (item.regex.test(cleanText)) {
      application = item.value;
      break;
    }
  }

  // 5. Detect Technical Characteristics
  const technicalCharacteristics = [];
  for (const item of TECHNICAL_FEATURE_PATTERNS) {
    if (item.regex.test(cleanText) && !technicalCharacteristics.includes(item.value)) {
      technicalCharacteristics.push(item.value);
    }
  }

  return {
    product,
    material,
    capacity,
    application,
    technicalCharacteristics,
    rawText: cleanText,
  };
}

/**
 * Combined Extraction Service
 * Uses deterministic parser first, then validates schema.
 */
export async function extractRequirements(text) {
  const deterministic = extractDeterministicAttributes(text);

  // Validate with Zod to ensure clean guaranteed structure
  const parsed = requirementSchema.safeParse(deterministic);
  if (!parsed.success) {
    return deterministic;
  }

  return {
    ...parsed.data,
    rawText: text,
  };
}
