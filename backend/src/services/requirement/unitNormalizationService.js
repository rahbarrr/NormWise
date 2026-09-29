/**
 * NormWise Unit Normalization Service (Phase 16)
 * Normalizes typographical and linguistic formatting variants of technical units.
 * STRICT SAFETY RULE: Does not perform physical cross-unit conversions (e.g. 5 L is NOT converted to m³).
 */

const UNIT_RULES = [
  // 1. Capacity & Volume
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:litres?|liters?|ltrs?|ltr|l)\b/gi,
    replacement: "$1 L",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:millilitres?|milliliters?|mls?|ml)\b/gi,
    replacement: "$1 mL",
  },

  // 2. Electrical Ratings
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:kilovolts?|kilovolt|kvs?|kv)\b/gi,
    replacement: "$1 kV",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:volts?|volt|v)\b/gi,
    replacement: "$1 V",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:kilowatts?|kilowatt|kws?|kw)\b/gi,
    replacement: "$1 kW",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:watts?|watt|w)\b/gi,
    replacement: "$1 W",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:amperes?|ampere|amps?|a)\b/gi,
    replacement: "$1 A",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:hertz|hz)\b/gi,
    replacement: "$1 Hz",
  },

  // 3. Dimensional & Mass
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:millimetres?|millimeters?|mms?|mm)\b/gi,
    replacement: "$1 mm",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:centimetres?|centimeters?|cms?|cm)\b/gi,
    replacement: "$1 cm",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:metres?|meters?|m)\b/gi,
    replacement: "$1 m",
  },
  {
    regex: /\b(\d+(?:\.\d+)?)\s*(?:kilograms?|kilogram|kgs?|kg)\b/gi,
    replacement: "$1 kg",
  },

  // 4. Ingress Protection & Pressure
  {
    regex: /\bip[\s\-_]*([56][45678])\b/gi,
    replacement: "IP$1",
  },
  {
    regex: /\bik[\s\-_]*(0[6789]|10)\b/gi,
    replacement: "IK$1",
  },
  {
    regex: /\bpn[\s\-_]*(\d+)\b/gi,
    replacement: "PN $1",
  },
];

/**
 * Normalizes units in text according to official procurement conventions
 * @param {string} text - Input text
 * @returns {string} Text with normalized unit notations
 */
export function normalizeUnits(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;
  for (const rule of UNIT_RULES) {
    result = result.replace(rule.regex, rule.replacement);
  }

  return result;
}

/**
 * Extracts and canonicalizes recognized technical units from text
 * @param {string} text - Input text
 * @returns {Array<string>} List of canonical unit strings found (e.g. ["5 L", "230 V"])
 */
export function extractCanonicalUnits(text) {
  if (!text || typeof text !== "string") return [];

  const found = [];
  const normalized = normalizeUnits(text);

  const unitPatterns = [
    /\b\d+(?:\.\d+)?\s*(?:L|mL|kV|V|kW|W|A|Hz|mm|cm|m|kg)\b/g,
    /\b(?:IP[56][45678]|IK(?:0[6789]|10)|PN\s*\d+)\b/g,
  ];

  for (const pattern of unitPatterns) {
    const matches = normalized.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }

  return Array.from(new Set(found));
}

// Aliases for convenience across consumers
export const normalizeUnitFormatting = normalizeUnits;
export function extractUnitMentions(text) {
  const canonical = extractCanonicalUnits(text);
  return canonical.map((u) => ({ raw: u, standardized: u }));
}
