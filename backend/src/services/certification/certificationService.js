/**
 * NormWise Certification Service
 * Deterministic rule-based evaluation of statutory Quality Control Orders (QCO)
 * and BIS Conformity Assessment Schemes (Scheme I ISI / Scheme II CRS)
 * 
 * IMPORTANT: These certification rules represent demonstration records structured for the MVP.
 * They do NOT replace official Ministry Gazette notifications or legal counsel.
 */

const DEMO_CERTIFICATION_RULES = {
  "IS 2347:2023": {
    standardNumber: "IS 2347:2023",
    scheme: "Scheme I (ISI Mark)",
    mandateStatus: "Mandatory Quality Control Order",
    legalOrder: "Domestic Pressure Cooker (Quality Control) Order, DPIIT",
    effectiveDate: "2020-08-01 (Continuous)",
    requirementSummary: "Mandatory Scheme I certification with standard mark. Production or import without ISI license is legally prohibited under BIS Act 2016.",
    exemptionNotes: "Exports exempt upon specific order documentation.",
    sourceStatus: "Demo Regulatory Rule",
  },
  "IS 10322 (Part 5/Sec 3):2012": {
    standardNumber: "IS 10322 (Part 5/Sec 3):2012",
    scheme: "Scheme I / CRS Compulsory Registration",
    mandateStatus: "Mandatory Public Lighting Standard",
    legalOrder: "Electronics and IT Goods (Requirement for Compulsory Registration) Order / MoP Guidelines",
    effectiveDate: "2018-05-23",
    requirementSummary: "Outdoor luminaires for public highways require registered BIS type test report and proof of IP66 sealing.",
    exemptionNotes: "Temporary emergency lighting exempt.",
    sourceStatus: "Demo Regulatory Rule",
  },
  "IS 302 (Part 1):2024": {
    standardNumber: "IS 302 (Part 1):2024",
    scheme: "Scheme I (ISI Mark)",
    mandateStatus: "Mandatory Electrical Safety Order",
    legalOrder: "Electrical Appliances (Quality Control) Order",
    effectiveDate: "2023-01-01",
    requirementSummary: "Baseline electrical safety compliance mandatory for household and commercial single-phase cooking appliances.",
    exemptionNotes: "None.",
    sourceStatus: "Demo Regulatory Rule",
  },
  "IS 374:2019": {
    standardNumber: "IS 374:2019",
    scheme: "Scheme I + BEE Mandatory Star Labeling",
    mandateStatus: "Mandatory BIS & Energy Conservation Act",
    legalOrder: "Bureau of Energy Efficiency (BEE) Ceiling Fans S&L Schedule",
    effectiveDate: "2023-01-01",
    requirementSummary: "Ceiling fans must comply with IS 374 air delivery standards and bear 1-star to 5-star BEE energy labels.",
    exemptionNotes: "Custom industrial exhaust fans not classified as ceiling type.",
    sourceStatus: "Demo Regulatory Rule",
  },
};

export function getCertificationDetails(standardNumber) {
  if (!standardNumber) return null;

  const found = DEMO_CERTIFICATION_RULES[standardNumber];
  if (found) {
    return found;
  }

  // Safe generic fallback for unlisted standards
  return {
    standardNumber,
    scheme: "Standard Voluntary Conformity",
    mandateStatus: "Voluntary Certification",
    legalOrder: "Tender Specific Additional Terms and Conditions (ATC)",
    effectiveDate: "N/A",
    requirementSummary: "BIS certification is voluntary unless specifically mandated by the requisitioning department in tender specifications.",
    exemptionNotes: "N/A",
    sourceStatus: "Demo Regulatory Rule",
  };
}
