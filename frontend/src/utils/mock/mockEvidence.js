/**
 * NormWise - Mock Evidence & Traceability Data
 * Phase 5 - Grounding & Source Verification Dataset
 *
 * NOTE: All evidence content here is explicitly identified as demonstration data
 * in accordance with NormWise data honesty principles.
 */

export const MOCK_EVIDENCE_RECORDS = [
  {
    id: "EV-001",
    type: "Scope",
    standard: "IS 2347:2023",
    source: "Standard document",
    documentTitle: "Pressure cookers — Specification",
    reference: "Clause / Section — Demo (Clause 1 Scope)",
    supports: "Product match (Pressure Cooker)",
    relationship: "Supports recommendation",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Specifies requirements for closed domestic and commercial pressure cookers operating above atmospheric pressure. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Standard document",
    edition: "Seventh Revision",
    amendment: "Amendment No. 1",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
  {
    id: "EV-002",
    type: "Material",
    standard: "IS 2347:2023",
    source: "Standard document",
    documentTitle: "Pressure cookers — Specification",
    reference: "Clause / Section — Demo (Clause 6 Materials)",
    supports: "Material match (Stainless Steel)",
    relationship: "Supports material specification",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Details material suitability for stainless steel sheet and strip conforming to food contact safety grades. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Standard document",
    edition: "Seventh Revision",
    amendment: "Amendment No. 1",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
  {
    id: "EV-003",
    type: "Certification",
    standard: "IS 2347:2023",
    source: "Official Gazette Notification",
    documentTitle: "Quality Control Order Registry",
    reference: "Gazette Order Reference — Demo",
    supports: "Certification information (Scheme I / ISI)",
    relationship: "Supports compliance requirement",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Statutory notification designating Scheme-I (ISI mark) as potentially applicable for public and commercial supply. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Statutory Order",
    edition: "Gazette Publication",
    amendment: "Current Order",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
  {
    id: "EV-004",
    type: "Currentness",
    standard: "IS 2347:2023",
    source: "BIS National Standards Catalogue",
    documentTitle: "Standards Status Index",
    reference: "Gazette Corrigendum — Demo",
    supports: "Current edition verification",
    relationship: "Supports validity check",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Corroborates that IS 2347:2023 is the current active edition with Amendment No. 1 incorporated. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Catalogue Index",
    edition: "Seventh Revision",
    amendment: "Amendment No. 1",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
  {
    id: "EV-005",
    type: "Related Standard",
    standard: "IS 7466",
    source: "Cross-referenced Component Standard",
    documentTitle: "Rubber gaskets for pressure cookers — Specification",
    reference: "Clause / Section — Demo (Normative Reference)",
    supports: "Related standard (IS 7466 Component)",
    relationship: "Supports allied component specification",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Cross-reference establishing sealing gasket heat endurance and food-grade vulcanizate properties. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Component Standard",
    edition: "Second Revision",
    amendment: "Reaffirmed 2021",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
  {
    id: "EV-006",
    type: "Requirement",
    standard: "IS 2347:2023",
    source: "Standard document",
    documentTitle: "Pressure cookers — Specification",
    reference: "Clause / Section — Demo (Clause 7 Safety)",
    supports: "Safety relief & proof pressure test",
    relationship: "Supports testing criteria",
    status: "Available",
    evidenceText:
      "Demonstration evidence content. Specifies proof hydraulic pressure testing at 3.0 times operating pressure and secondary fusible valve release threshold. Replace with authorized source text when the real evidence pipeline is connected.",
    sourceType: "Standard document",
    edition: "Seventh Revision",
    amendment: "Amendment No. 1",
    sourceStatus: "Demo dataset",
    lastValidated: "Demo date (October 2026)",
  },
];

export const MOCK_RELATED_STANDARDS_EVIDENCE = [
  {
    code: "IS 7466",
    title: "Rubber gaskets for pressure cookers",
    relationship: "Component",
    evidenceSummary: "Demonstration relationship data: Normative specification for elastomeric lid sealing rings.",
    status: "Available",
    reference: "Clause 4.1 Component Reference — Demo",
  },
  {
    code: "IS 5522",
    title: "Stainless steel sheets and strip for utensils",
    relationship: "Material",
    evidenceSummary: "Demonstration relationship data: Chemical composition of cold-rolled deep-drawing austenitic steel.",
    status: "Available",
    reference: "Clause 6.1 Raw Material — Demo",
  },
  {
    code: "IS 6911",
    title: "Stainless steel plate, sheet and strip",
    relationship: "Material",
    evidenceSummary: "Demonstration relationship data: Mechanical tensile yield and elongation parameters.",
    status: "Available",
    reference: "Material Grade Cross-Reference — Demo",
  },
  {
    code: "IS 2:2022",
    title: "Rules for rounding off numerical values",
    relationship: "General",
    evidenceSummary: "Demonstration relationship data: Test result precision and significant digit tolerances.",
    status: "Available",
    reference: "General Testing Guidelines — Demo",
  },
];

export const MOCK_AUDIT_INFO = {
  recommendationId: "REC-DEMO-001",
  createdDate: "25 Sep 2026 (Demo date)",
  evidenceRecordsCount: 5,
  reviewStatus: "Not reviewed",
  validatedBy: "NormWise Demonstration Engine",
};
