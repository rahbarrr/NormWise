/**
 * NormWise - Mock Analysis Data
 * Phase 3 - Analysis & Processing simulation
 */

export const DEFAULT_ANALYSIS_DATA = {
  requirement: "Stainless steel pressure cooker, 5 litre, for institutional kitchen use",
  attributes: {
    product: "Pressure Cooker",
    material: "Stainless Steel",
    capacity: "5 litre",
    application: "Institutional Kitchen",
  },
  potentialMatches: 6,
  relatedStandards: 3,
  relatedStandardsList: ["IS 5522", "IS 6911", "IS 7466"],
  recommendedStandard: "IS 2347:2023",
  currentEdition: "IS 2347:2023",
  status: "Current",
  amendmentChecked: "Yes",
};

export const MOCK_ANALYSIS_PRESETS = {
  pressure_cooker: {
    recommendedStandard: "IS 2347:2023",
    currentEdition: "IS 2347:2023",
    status: "Current",
    amendmentChecked: "Yes",
    potentialMatches: 6,
    relatedStandards: 3,
    relatedStandardsList: [
      { code: "IS 5522", title: "Stainless steel sheets for utensils" },
      { code: "IS 6911", title: "Stainless steel plate, sheet and strip" },
      { code: "IS 7466", title: "Rubber gaskets for pressure cookers" },
    ],
  },
  led_street_lighting: {
    recommendedStandard: "IS 10322 (Part 5/Sec 3):2012",
    currentEdition: "IS 10322 (Part 5/Sec 3):2012",
    status: "Review",
    amendmentChecked: "Yes (ETD 35 draft review)",
    potentialMatches: 8,
    relatedStandards: 4,
    relatedStandardsList: [
      { code: "IS 15885 (Part 2/Sec 13)", title: "Safety of electronic LED controlgear" },
      { code: "IS 16102 (Part 2)", title: "Self-ballasted LED lamps performance" },
      { code: "IS 16107 (Part 2/Sec 1)", title: "Luminaires performance general" },
      { code: "IS/IEC 60529", title: "Degrees of protection (IP66 rating)" },
    ],
  },
  electrical_accessories: {
    recommendedStandard: "IS 3854:1988",
    currentEdition: "IS 3854:1988 (Reaffirmed 2021)",
    status: "Current",
    amendmentChecked: "Yes (6 amendments incorporated)",
    potentialMatches: 5,
    relatedStandards: 3,
    relatedStandardsList: [
      { code: "IS 1293:2019", title: "Plugs and socket-outlets up to 250V" },
      { code: "IS 9537 (Part 3)", title: "Conduits for electrical installations" },
      { code: "IS 11000", title: "Fire hazard glow wire testing" },
    ],
  },
};

/**
 * Determine preset data based on query text or fallback to pressure cooker.
 */
export function getAnalysisDataForQuery(query = "", customAttributes = null) {
  const lower = query.toLowerCase();
  let presetKey = "pressure_cooker";

  if (lower.includes("led") || lower.includes("street") || lower.includes("luminaire") || lower.includes("light")) {
    presetKey = "led_street_lighting";
  } else if (lower.includes("switch") || lower.includes("socket") || lower.includes("electrical") || lower.includes("modular")) {
    presetKey = "electrical_accessories";
  }

  const preset = MOCK_ANALYSIS_PRESETS[presetKey] || MOCK_ANALYSIS_PRESETS.pressure_cooker;

  return {
    requirement: query || DEFAULT_ANALYSIS_DATA.requirement,
    attributes: customAttributes || DEFAULT_ANALYSIS_DATA.attributes,
    potentialMatches: preset.potentialMatches,
    relatedStandards: preset.relatedStandards,
    relatedStandardsList: preset.relatedStandardsList,
    recommendedStandard: preset.recommendedStandard,
    currentEdition: preset.currentEdition,
    status: preset.status,
    amendmentChecked: preset.amendmentChecked,
  };
}
