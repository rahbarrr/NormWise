/**
 * NormWise - Mock Requirements Data
 * Phase 2 - Requirement Input & Extraction simulation
 */

export const EXAMPLE_REQUIREMENTS_PHASE2 = [
  {
    id: "case_1_clear",
    title: "Case 1: Clear Recommendation",
    badge: "Clear Match (IS 2347)",
    text: "Procurement of 5 litre capacity stainless steel pressure cookers for commercial canteen kitchens conforming to applicable Indian Standards.",
    attributes: {
      product: "Pressure Cooker",
      material: "Stainless Steel",
      capacity: "5 Litre",
      application: "Commercial Canteen Kitchen",
    },
  },
  {
    id: "case_2_allied",
    title: "Case 2: Allied & Related Standards",
    badge: "Knowledge Graph (IS 10322)",
    text: "Outdoor LED road lighting luminaires conforming to IS 10322 with internal electronic controlgear and LED modules.",
    attributes: {
      product: "LED Street Luminaire",
      material: "Die-cast Aluminum",
      capacity: "90W / IP66",
      application: "Municipal Road & Highway",
    },
  },
  {
    id: "case_3_ambiguous",
    title: "Case 3: Ambiguous / Missing Specs",
    badge: "Clarification Required",
    text: "Need standard for a pressure cooker.",
    attributes: {
      product: "Pressure Cooker",
      material: null,
      capacity: null,
      application: null,
    },
  },
];

/**
 * Helper to simulate attribute extraction based on user text or file.
 */
export function extractSimulatedAttributes(text = "", filename = "") {
  const lower = (text + " " + filename).toLowerCase();

  if (lower.includes("pressure") || lower.includes("cooker") || lower.includes("stainless")) {
    return {
      product: "Pressure Cooker",
      material: lower.includes("aluminum") ? "Aluminum Alloy" : "Stainless Steel",
      capacity: lower.includes("litre") || lower.includes("liter") ? (lower.match(/\d+\s*(?:litre|liter|l)\b/i)?.[0] || "5 litre") : "5 litre",
      application: "Institutional Kitchen",
    };
  }

  if (lower.includes("led") || lower.includes("street") || lower.includes("luminaire") || lower.includes("light")) {
    return {
      product: "LED Street Luminaire",
      material: "Die-cast Aluminum Housing",
      capacity: lower.includes("w") ? (lower.match(/\d+\s*w\b/i)?.[0] || "120W") : "120W",
      application: "Municipal Road & Highway Lighting",
    };
  }

  if (lower.includes("switch") || lower.includes("socket") || lower.includes("electrical") || lower.includes("modular")) {
    return {
      product: "Modular Switches & Sockets",
      material: "Fire-Retardant Polycarbonate",
      capacity: "16A / 250V AC",
      application: "Building Electrical Installation",
    };
  }

  if (lower.includes("steel") || lower.includes("tmt") || lower.includes("rebar")) {
    return {
      product: "TMT Steel Rebars",
      material: "Fe 500D Grade High Ductility Steel",
      capacity: "16mm / 20mm Diameter",
      application: "Civil & RCC Infrastructure",
    };
  }

  // Fallback generic extraction for custom text
  return {
    product: text.split(",")[0]?.trim() || (filename ? filename.replace(/\.[^/.]+$/, "") : "Custom Equipment"),
    material: "Specification Grade",
    capacity: "Standard Rating",
    application: "Public Procurement Schedule",
  };
}
