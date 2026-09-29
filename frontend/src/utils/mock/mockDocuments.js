/**
 * NormWise - Mock Document Intelligence Data
 * Phase 8 - Specification & Tender Document Extraction Dataset
 */

export const MOCK_DOCUMENTS = [
  {
    id: "DOC-DEMO-001",
    filename: "pressure_cooker_specification.pdf",
    type: "PDF",
    size: "2.4 MB",
    pages: 8,
    status: "Processed",
    uploadTime: "Just now (Demo)",
    extractedTextSample:
      "Tender Specification Section 4.2: Closed pressure cooking equipment constructed from food-grade austenitic stainless steel sheet with nominal operating capacity of 5 litres. Must include multi-tier spring safety valves and heat-resistant handles for institutional pantry and commercial kitchen installation.",

    extractedRequirements: [
      {
        id: "product",
        label: "Product",
        value: "Pressure Cooker",
        originalValue: "Pressure Cooker",
        confidence: "High",
        source: "Page 2 — Demo",
        description: "Identified primary product classification and chamber type.",
      },
      {
        id: "material",
        label: "Material",
        value: "Stainless Steel",
        originalValue: "Stainless Steel",
        confidence: "High",
        source: "Page 3 — Demo",
        description: "Food contact safety grade austenitic stainless steel sheet specified.",
      },
      {
        id: "capacity",
        label: "Capacity",
        value: "5 litre",
        originalValue: "5 litre",
        confidence: "Medium",
        source: "Page 3 — Demo",
        description: "Nominal volume specified in schedule of quantities.",
      },
      {
        id: "application",
        label: "Application",
        value: "Institutional Kitchen",
        originalValue: "Institutional Kitchen",
        confidence: "High",
        source: "Page 4 — Demo",
        description: "Intended for heavy duty catering and public pantry dining halls.",
      },
      {
        id: "technical_characteristics",
        label: "Technical characteristics",
        value: "Pressure cooking equipment for institutional use with safety relief valve and proof hydraulic pressure test threshold",
        originalValue:
          "Pressure cooking equipment for institutional use with safety relief valve and proof hydraulic pressure test threshold",
        confidence: "High",
        source: "Page 5 — Demo",
        description: "Hydraulic pressure testing and safety valve release parameters.",
      },
    ],

    missingInformation: [
      {
        id: "lid_mechanism",
        field: "Lid locking mechanism",
        issue: "Lid closure mechanism (inner-lid vs outer-lid) is not explicitly specified.",
        suggestedValues: ["Inner lid", "Outer lid", "Clamp locking"],
      },
    ],

    ambiguousInformation: [
      {
        id: "commercial_duty",
        field: "Duty Cycle",
        issue: "Tender mentions 'intermittent heavy duty' which may imply commercial or institutional rating.",
        options: ["Commercial rating", "Domestic standard"],
      },
    ],
  },
  {
    id: "DOC-DEMO-002",
    filename: "led_street_lighting_tender.pdf",
    type: "PDF",
    size: "4.1 MB",
    pages: 14,
    status: "Processed",
    uploadTime: "Demo timestamp",
    extractedTextSample:
      "Municipal Corporation NIT Schedule C: High-efficiency roadway and street lighting LED luminaires, 120W system wattage, IP66 ingress protection, secondary 10kV surge arrester, powder-coated die-cast aluminium housing with lens array.",

    extractedRequirements: [
      {
        id: "product",
        label: "Product",
        value: "LED Luminaires",
        originalValue: "LED Luminaires",
        confidence: "High",
        source: "Page 1 — Demo",
        description: "Roadway luminaire with solid-state LED light source.",
      },
      {
        id: "material",
        label: "Material",
        value: "Die-cast Aluminium Housing",
        originalValue: "Die-cast Aluminium Housing",
        confidence: "High",
        source: "Page 4 — Demo",
        description: "Corrosion-resistant LM6 alloy enclosure with powder coat.",
      },
      {
        id: "capacity",
        label: "Capacity / Rating",
        value: "120W, IP66, 10kV Surge",
        originalValue: "120W, IP66, 10kV Surge",
        confidence: "High",
        source: "Page 5 — Demo",
        description: "Electrical wattage and ingress protection rating.",
      },
      {
        id: "application",
        label: "Application",
        value: "Street and Roadway Lighting",
        originalValue: "Street and Roadway Lighting",
        confidence: "High",
        source: "Page 2 — Demo",
        description: "Urban arterial highway and municipal street lighting.",
      },
      {
        id: "technical_characteristics",
        label: "Technical characteristics",
        value: "System efficacy > 120 lm/W with thermal management and driver safety cut-off",
        originalValue: "System efficacy > 120 lm/W with thermal management and driver safety cut-off",
        confidence: "Medium",
        source: "Page 7 — Demo",
        description: "Luminous efficacy and electronic driver conformity.",
      },
    ],

    missingInformation: [],
    ambiguousInformation: [
      {
        id: "cct_tolerance",
        field: "Correlated Colour Temperature (CCT)",
        issue: "CCT specified as '4000K to 5700K' without preferred MacAdam ellipse tolerance.",
        options: ["4000K Neutral White", "5000K Cool Daylight", "5700K"],
      },
    ],
  },
  {
    id: "DOC-DEMO-003",
    filename: "electrical_accessories_spec.docx",
    type: "DOCX",
    size: "1.2 MB",
    pages: 6,
    status: "Processed",
    uploadTime: "Demo timestamp",
    extractedTextSample:
      "CPWD Schedule of Rates: 6A / 16A modular flush switches and 3-pin shuttered sockets for domestic and residential quarters electrical installations. Polycarbonate fire retardant front plates.",

    extractedRequirements: [
      {
        id: "product",
        label: "Product",
        value: "Flush Switches & Sockets",
        originalValue: "Flush Switches & Sockets",
        confidence: "High",
        source: "Page 2 — Demo",
        description: "Modular electrical switchgear for fixed installations.",
      },
      {
        id: "material",
        label: "Material",
        value: "Polycarbonate Fire Retardant",
        originalValue: "Polycarbonate Fire Retardant",
        confidence: "High",
        source: "Page 3 — Demo",
        description: "Self-extinguishing engineering thermoplastic.",
      },
      {
        id: "capacity",
        label: "Capacity",
        value: "6A / 16A, 240V AC",
        originalValue: "6A / 16A, 240V AC",
        confidence: "High",
        source: "Page 2 — Demo",
        description: "Single pole switch current rating.",
      },
      {
        id: "application",
        label: "Application",
        value: "Residential & Building Installation",
        originalValue: "Residential & Building Installation",
        confidence: "High",
        source: "Page 1 — Demo",
        description: "Fixed indoor electrical distribution wiring.",
      },
      {
        id: "technical_characteristics",
        label: "Technical characteristics",
        value: "Silver cadmium oxide contacts with shuttered safety socket aperture",
        originalValue: "Silver cadmium oxide contacts with shuttered safety socket aperture",
        confidence: "Medium",
        source: "Page 4 — Demo",
        description: "Endurance switching cycles and contact resistance.",
      },
    ],

    missingInformation: [
      {
        id: "gang_box_depth",
        field: "Concealed mounting box depth",
        issue: "Metal flush box gauge and depth not clearly stated in schedule.",
        suggestedValues: ["50mm depth", "35mm depth"],
      },
    ],
    ambiguousInformation: [],
  },
];
