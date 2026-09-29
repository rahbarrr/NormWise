/**
 * NormWise - Mock Results Data
 * Phase 4 - Recommendation Results Screen
 */

export const PRIMARY_MOCK_RESULT = {
  id: "REC-2026-IS2347",
  requirement: "Stainless steel pressure cooker, 5 litre, for institutional kitchen use",
  attributes: {
    product: "Pressure Cooker",
    material: "Stainless Steel",
    capacity: "5 litre",
    application: "Institutional Kitchen",
  },
  recommendedStandard: "IS 2347:2023",
  title: "Pressure cookers — Specification",
  edition: "Seventh Revision",
  amendment: "Amendment No. 1",
  amendmentDate: "October 2024",
  status: "Current", // 'Current' | 'Review' | 'Accepted' | 'Under Review'
  confidence: 94,
  confidenceLabel: "94% Match",
  confidenceType: "high", // 'high' | 'moderate' | 'low'
  scopeMatched: true,
  amendmentChecked: true,
  reviewRequired: false,

  whyThisStandard: [
    {
      id: "why-1",
      attribute: "Product",
      value: "Pressure cooker",
      matchText: "Matches the standard scope for closed domestic and commercial pressure cooking vessels.",
      evidenceRef: "Scope Clause 1.1",
    },
    {
      id: "why-2",
      attribute: "Material",
      value: "Stainless steel",
      matchText: "Stainless-steel construction is considered in the relevant standard context (Austenitic grade SS 304).",
      evidenceRef: "Material Clause 6.1",
    },
    {
      id: "why-3",
      attribute: "Application",
      value: "Institutional kitchen",
      matchText: "Intended institutional use was included in the recommendation analysis for high-volume safety criteria.",
      evidenceRef: "Operating Pressure Clause 7.2",
    },
    {
      id: "why-4",
      attribute: "Capacity",
      value: "5 litre",
      matchText: "Nominal capacity context considered within standard vessel volume classification (up to 22L).",
      evidenceRef: "Capacity Clause 5.3",
    },
    {
      id: "why-5",
      attribute: "Scope",
      value: "Operating Safety",
      matchText: "Standard scope appears directly relevant with secondary thermal fusible safety pressure relief mechanism.",
      evidenceRef: "Safety Relief Clause 7.4",
    },
  ],

  currentness: {
    timeline: [
      { label: "Previous", version: "Older edition (Sixth Revision)" },
      { label: "Current", version: "IS 2347:2023 (Seventh Revision)" },
      { label: "Amendment", version: "Amendment No. 1 (October 2024)" },
    ],
    currentEdition: "IS 2347:2023",
    revision: "Seventh Revision",
    amendment: "Amendment No. 1",
    validationStatus: "Checked",
    notice: "Status information shown here is demonstration data and should be verified against the applicable authorized source before procurement use.",
  },

  certification: {
    scheme: "Scheme I / ISI",
    status: "Potentially applicable",
    description: "Certification requirements can depend on the applicable product, order, scope and current regulatory requirements.",
    regulatoryBody: "Bureau of Indian Standards / Line Ministry Notification",
    evidenceAvailable: true,
    evidenceSnippet: "Domestic pressure cookers are covered under statutory Quality Control Order requiring valid ISI mark certification before commercial sale or procurement.",
  },

  alliedStandards: [
    {
      code: "IS 5522",
      title: "Stainless steel sheets and strip for utensils",
      relationship: "MATERIAL",
      desc: "Deep drawing austenitic stainless steel sheet specifications.",
    },
    {
      code: "IS 6911",
      title: "Stainless steel plate, sheet and strip",
      relationship: "MATERIAL",
      desc: "Chemical composition and mechanical properties for food grade steel.",
    },
    {
      code: "IS 7466",
      title: "Rubber gaskets for pressure cookers",
      relationship: "COMPONENT",
      desc: "Food-grade elastomer sealing ring heat endurance requirements.",
    },
    {
      code: "IS 2:2022",
      title: "Rules for rounding off numerical values",
      relationship: "GENERAL",
      desc: "Conformity assessment tolerance rounding rules.",
    },
  ],

  evidenceItems: [
    {
      id: "ev-1",
      source: "Standard document (IS 2347:2023)",
      reference: "Clause reference — demo (Clause 1.1 Scope)",
      evidenceType: "Scope",
      evidenceSnippet: "Demonstration content: Specifies requirements for domestic and commercial pressure cookers made from stainless steel or aluminum alloy operating at nominal gauge pressure.",
      sourceStatus: "Demo dataset",
      lastValidated: "October 2026",
    },
    {
      id: "ev-2",
      source: "Standard document (IS 2347:2023)",
      reference: "Clause reference — demo (Clause 6.1 Raw Material)",
      evidenceType: "Requirement",
      evidenceSnippet: "Demonstration content: Austenitic stainless steel conforming to food grade standards with non-corrosive properties under prolonged steam exposure.",
      sourceStatus: "Demo dataset",
      lastValidated: "October 2026",
    },
    {
      id: "ev-3",
      source: "Official Gazette Notification",
      reference: "Statutory Order reference — demo",
      evidenceType: "Certification",
      evidenceSnippet: "Demonstration content: Quality Control Order mandates that pressure cookers conform to Indian Standards and bear the Standard Mark under Scheme-I license.",
      sourceStatus: "Demo dataset",
      lastValidated: "October 2026",
    },
  ],

  procurementClause: {
    statusNote: "DRAFT — REVIEW BEFORE USE",
    text: "The supplied pressure cooker shall comply with the applicable requirements of IS 2347:2023, subject to verification of the current applicable edition, amendments and regulatory requirements.",
  },
};

/**
 * Alternate mock dataset for Moderate / Low confidence simulation
 */
export const LOW_CONFIDENCE_MOCK_RESULT = {
  id: "REC-2026-LOWCONF",
  requirement: "LED luminaires for street and road lighting, outdoor municipal project",
  attributes: {
    product: "LED Luminaire",
    material: "Die-cast Aluminum",
    capacity: "Unspecified Wattage",
    application: "Street & Road Lighting",
  },
  confidence: 87,
  confidenceLabel: "87% Match",
  confidenceType: "moderate",
  bannerTitle: "Additional clarification may improve this recommendation.",
  bannerDesc: "NormWise identified more than one potentially applicable standard based on the technical parameters provided.",
  options: [
    {
      code: "IS 10322 (Part 5/Sec 3):2012",
      title: "Luminaires — Particular requirements — Luminaires for road and street lighting",
      focus: "General luminaire fixtures for highway and municipal street illumination.",
      status: "Review",
    },
    {
      code: "IS 16107 (Part 2/Sec 1):2012",
      title: "Luminaires performance — Particular requirements — General LED luminaires",
      focus: "Performance, luminous efficacy, and color rendering metrics of LED sources.",
      status: "Current",
    },
  ],
};

/**
 * Resolver function to get mock results matching query or state
 */
export function getMockResultForQuery(query = "", customAttributes = null) {
  const lower = query.toLowerCase();

  // If empty or test keyword for no result
  if (lower.includes("unknown") || lower.includes("random gibberish")) {
    return null;
  }

  // If LED or low-confidence query
  if (lower.includes("led") || lower.includes("lighting") || lower.includes("street")) {
    return {
      ...PRIMARY_MOCK_RESULT,
      id: "REC-2026-LED",
      requirement: query || LOW_CONFIDENCE_MOCK_RESULT.requirement,
      attributes: customAttributes || LOW_CONFIDENCE_MOCK_RESULT.attributes,
      recommendedStandard: "IS 10322 (Part 5/Sec 3):2012",
      title: "Luminaires — Particular requirements — Road and street lighting",
      edition: "First Revision",
      amendment: "Amendment No. 2",
      amendmentDate: "June 2024",
      status: "Review",
      confidence: 87,
      confidenceLabel: "87% Match",
      confidenceType: "moderate",
      reviewRequired: true,
      lowConfidenceData: LOW_CONFIDENCE_MOCK_RESULT,
    };
  }

  // Default to primary Pressure Cooker result
  return {
    ...PRIMARY_MOCK_RESULT,
    requirement: query || PRIMARY_MOCK_RESULT.requirement,
    attributes: customAttributes || PRIMARY_MOCK_RESULT.attributes,
  };
}
