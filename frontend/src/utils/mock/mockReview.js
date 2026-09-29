/**
 * NormWise - Mock Human Review & Decision Workflow Data
 * Phase 6 - Governance & Assurance Dataset
 */

export const MOCK_REVIEW_DATA = {
  recommendationId: "REC-DEMO-001",
  standard: "IS 2347:2023",
  title: "Pressure cookers — Specification",
  confidence: 94,
  status: "Pending Review",
  edition: "Seventh Revision",
  amendment: "Amendment No. 1",
  application: "Institutional kitchen / Public procurement",
  requirementSummary:
    "Stainless steel pressure cooker with safety relief valve and food contact grade material for institutional dining service.",
};

export const MOCK_REVIEWER = {
  name: "Demo User",
  role: "Procurement / Technical Reviewer",
  organization: "Central Evaluation Committee (Demo)",
  status: "Active",
};

export const MOCK_CHECKLIST = [
  {
    id: "scope",
    label: "Product scope appears relevant",
    description:
      "Scope encompasses closed domestic and commercial pressure cookers operating above atmospheric pressure.",
    completed: false,
    evidenceId: "EV-001",
  },
  {
    id: "material",
    label: "Material / construction requirements considered",
    description:
      "Austenitic stainless steel grade and wall thickness thresholds meet food-grade criteria.",
    completed: false,
    evidenceId: "EV-002",
  },
  {
    id: "application",
    label: "Intended application considered",
    description:
      "Design parameters and safety valves conform to high-frequency institutional culinary usage.",
    completed: false,
    evidenceId: "EV-006",
  },
  {
    id: "currentness",
    label: "Current edition/status reviewed",
    description:
      "IS 2347:2023 Seventh Revision with Amendment No. 1 is verified in the national digital standards index.",
    completed: false,
    evidenceId: "EV-004",
  },
  {
    id: "related",
    label: "Related standards reviewed",
    description:
      "Auxiliary component and material standards (IS 7466, IS 5522, IS 6911) cross-referenced.",
    completed: false,
    evidenceId: "EV-005",
  },
  {
    id: "certification",
    label: "Certification information reviewed",
    description:
      "Scheme-I (ISI mark) identified as potentially applicable statutory conformity scheme.",
    completed: false,
    evidenceId: "EV-003",
  },
  {
    id: "evidence",
    label: "Supporting evidence reviewed",
    description:
      "Demonstration evidence citations, normative clause references, and catalogue items inspected.",
    completed: false,
    evidenceId: "EV-001",
  },
  {
    id: "compliance_verified",
    label: "Certification / regulatory applicability verified",
    description:
      "Statutory compliance rules, QCO Orders, and conformity assessment schemes verified by human reviewer.",
    completed: false,
    evidenceId: "EV-003",
    complianceDecision: null,
  },
];

export const MOCK_INITIAL_AUDIT_EVENTS = [
  {
    id: "evt-1",
    action: "Recommendation generated",
    actor: "NormWise Engine",
    time: "09:42 (Demo timestamp)",
    details: "IS 2347:2023 matched at 94% confidence for institutional pressure cooker requirement.",
  },
  {
    id: "evt-2",
    action: "Evidence reviewed",
    actor: "Demo User",
    time: "09:43 (Demo timestamp)",
    details: "6 supporting demonstration evidence records inspected.",
  },
];

export const MOCK_RELATED_STANDARDS_REVIEW = [
  {
    code: "IS 5522",
    title: "Stainless steel sheets and strip for utensils",
    relationship: "Material",
    status: "Active",
    evidenceId: "EV-002",
  },
  {
    code: "IS 6911",
    title: "Stainless steel plate, sheet and strip",
    relationship: "Material",
    status: "Active",
    evidenceId: "EV-002",
  },
  {
    code: "IS 7466",
    title: "Rubber gaskets for pressure cookers",
    relationship: "Component",
    status: "Active",
    evidenceId: "EV-005",
  },
  {
    code: "IS 2:2022",
    title: "Rules for rounding off numerical values",
    relationship: "General / Supporting",
    status: "Active",
    evidenceId: "EV-004",
  },
];
