/**
 * NormWise - Mock Requirements Data
 * Phase 2 - Requirement Input & Extraction simulation
 */

export const EXAMPLE_REQUIREMENTS_PHASE2 = [
  {
    id: "pressure_cooker",
    title: "Pressure Cooker",
    text: "Stainless steel pressure cooker, 5 litre, for institutional kitchen use",
    attributes: {
      product: "Pressure Cooker",
      material: "Stainless Steel",
      capacity: "5 litre",
      application: "Institutional Kitchen",
    },
  },
  {
    id: "led_street_lighting",
    title: "LED Street Lighting",
    text: "LED luminaires for street and road lighting, outdoor municipal project",
    attributes: {
      product: "LED Street Luminaire",
      material: "Die-cast Aluminum",
      capacity: "120W / 14,000 lm",
      application: "Municipal Road & Highway",
    },
  },
  {
    id: "electrical_accessories",
    title: "Electrical Accessories",
    text: "Electrical accessories for a building installation",
    attributes: {
      product: "Modular Switches & Sockets",
      material: "Polycarbonate (Flame Retardant)",
      capacity: "16A, 250V AC",
      application: "Commercial Building Electrical",
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
