import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NormWise demonstration database with rich standards metadata...");

  // Clean existing tables in proper foreign-key order
  await prisma.complianceEvaluation.deleteMany();
  await prisma.complianceEvidence.deleteMany();
  await prisma.complianceCondition.deleteMany();
  await prisma.complianceRule.deleteMany();
  await prisma.reviewChecklist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.recommendationStandard.deleteMany();
  await prisma.relatedStandard.deleteMany();
  await prisma.standardAmendment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.standard.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const officer = await prisma.user.create({
    data: {
      name: "R. K. Sharma",
      email: "officer@normwise.gov.in",
      role: "PROCUREMENT_OFFICER",
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      name: "Dr. Ananya Verma",
      email: "reviewer@normwise.gov.in",
      role: "TECHNICAL_REVIEWER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "NormWise Administrator",
      email: "admin@normwise.gov.in",
      role: "ADMIN",
    },
  });

  console.log("Seeded users (officer, reviewer, admin)");

  // 2. Seed Standards with structured metadata for retrieval and scoring
  const stdCookerCurrent = await prisma.standard.create({
    data: {
      standardNumber: "IS 2347:2023",
      title: "Pressure cookers — Specification",
      edition: "2023",
      revision: "Seventh Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Prescribes requirement for domestic and commercial pressure cookers made of aluminum alloys or stainless steel, covering design, material, proof pressure, and safety release mechanisms.",
      scope:
        "Specifies requirements for domestic and commercial pressure cookers intended for cooking food under steam pressure, including composite induction bases, dual safety valves, and nominal capacity ratings up to 25 litres.",
      keywords: [
        "pressure cooker",
        "pressure cooking",
        "stainless steel",
        "kitchen equipment",
        "safety valve",
        "gasket",
        "canteen",
        "institutional kitchen",
        "induction base",
      ],
      applicableProducts: [
        "Pressure Cooker",
        "Commercial Pressure Cooker",
        "Domestic Pressure Cooker",
        "Induction Pressure Cooker",
        "Steam Pressure Cooker",
      ],
      materials: [
        "Stainless Steel",
        "Stainless Steel Grade 304",
        "Aluminum Alloy",
        "Food-grade Silicone",
      ],
      applications: [
        "Institutional Kitchen",
        "Domestic Kitchen",
        "Catering Operations",
        "Commercial Pantry",
        "Mess Kitchen",
      ],
    },
  });

  const stdCookerSuperseded = await prisma.standard.create({
    data: {
      standardNumber: "IS 2347:2014",
      title: "Pressure cookers — Specification (Sixth Revision)",
      edition: "2014",
      revision: "Sixth Revision",
      status: "SUPERSEDED",
      description:
        "DEMO RECORD: Sixth revision of the domestic pressure cooker specification. Superseded by Seventh Revision (IS 2347:2023).",
      scope:
        "Earlier specification for pressure cookers prior to revised safety relief valve testing mandates.",
      keywords: ["pressure cooker", "superseded", "sixth revision"],
      applicableProducts: ["Pressure Cooker"],
      materials: ["Aluminum", "Stainless Steel"],
      applications: ["Domestic Kitchen"],
    },
  });

  const stdSteel = await prisma.standard.create({
    data: {
      standardNumber: "IS 6911:2017",
      title: "Stainless steel plate, sheet and strip — Specification",
      edition: "2017",
      revision: "Second Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies requirements for hot-rolled and cold-rolled stainless steel plates, sheets, and strips for utensils, kitchenware, and industrial vessels.",
      scope:
        "Covers flat stainless steel materials including Grade 304 austenitic alloy suitable for food-contact cooking vessels.",
      keywords: [
        "stainless steel",
        "steel plate",
        "steel sheet",
        "strip",
        "grade 304",
        "food grade",
        "utensils",
      ],
      applicableProducts: ["Stainless Steel Sheet", "Plate and Strip", "Raw Material"],
      materials: ["Stainless Steel Grade 304", "AISI 304", "Austenitic Stainless Steel"],
      applications: ["Kitchenware Manufacturing", "Pressure Cooker Fabrication", "Industrial Vessels"],
    },
  });

  const stdLED = await prisma.standard.create({
    data: {
      standardNumber: "IS 10322 (Part 5/Sec 3):2012",
      title: "Luminaires - Particular requirements - Luminaires for road and street lighting",
      edition: "2012",
      revision: "Reaffirmed 2018",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies requirements for luminaires for road, street, and other public outdoor lighting, including photometric performance, IP sealing, and electrical safety.",
      scope:
        "Applies to roadway and street lighting luminaires using electrical light sources on supply voltages up to 1000V. Covers ingress protection up to IP66 and surge threshold protection.",
      keywords: [
        "led street light",
        "street lighting",
        "roadway luminaire",
        "outdoor luminaire",
        "highway lighting",
        "ip66",
        "surge protection",
        "smart city",
      ],
      applicableProducts: [
        "LED Street Light",
        "Outdoor LED Street Light Luminaire",
        "Roadway Luminaire",
        "Public Street Light",
      ],
      materials: [
        "Die-cast Aluminum",
        "Toughened Glass",
        "Extruded Aluminum",
        "Polycarbonate",
      ],
      applications: [
        "Municipal Highway",
        "Urban Arterial Roads",
        "Public Street Lighting",
        "Smart City Infrastructure",
        "Expressway Illumination",
      ],
    },
  });

  const stdSafety = await prisma.standard.create({
    data: {
      standardNumber: "IS 302 (Part 1):2024",
      title: "Safety of household and similar electrical appliances — General requirements",
      edition: "2024",
      revision: "Sixth Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Deals with the safety of electrical appliances for household and similar commercial purposes whose rated voltage is not more than 250 V for single phase appliances.",
      scope:
        "Baseline electrical safety rules for commercial and domestic heating, cooking, and motor-driven appliances.",
      keywords: [
        "electrical safety",
        "induction cooking",
        "cooking hob",
        "household appliances",
        "heating appliances",
        "single phase",
      ],
      applicableProducts: [
        "Induction Cooktop",
        "Commercial Induction Cooking Hob",
        "Electric Cooking Range",
        "Electric Heating Appliance",
      ],
      materials: ["Ceramic Glass", "Stainless Steel Chassis", "Insulating Polymer"],
      applications: [
        "Railway Base Kitchens",
        "Commercial Catering",
        "Domestic Kitchen",
        "Pantry Operations",
      ],
    },
  });

  const stdFan = await prisma.standard.create({
    data: {
      standardNumber: "IS 374:2019",
      title: "Electric ceiling type fans and regulators — Specification",
      edition: "2019",
      revision: "Fourth Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies requirements for ceiling fans including AC and Brushless DC (BLDC) motor designs, air delivery ratings, and energy service values.",
      scope:
        "Covers electric ceiling fans of sweep sizes 600mm to 1500mm with emphasis on energy efficiency and BEE star labeling alignment.",
      keywords: [
        "ceiling fan",
        "bldc ceiling fan",
        "electric fan",
        "air delivery",
        "energy efficient",
        "bldc motor",
      ],
      applicableProducts: [
        "Ceiling Fan",
        "BLDC Ceiling Fan",
        "Electric Ceiling Fan",
      ],
      materials: ["Aluminum Blades", "Copper Winding", "Die-cast Aluminum Body"],
      applications: [
        "Educational Hostels",
        "Institutional Buildings",
        "Offices",
        "Residential Quarters",
      ],
    },
  });

  const stdWithdrawnPipes = await prisma.standard.create({
    data: {
      standardNumber: "IS 1239 (Part 2):1992",
      title: "Mild steel tubes, tubulars and other wrought steel fittings — Specification",
      edition: "1992",
      revision: "Fourth Revision",
      status: "WITHDRAWN",
      description:
        "DEMO RECORD: Withdrawn standard superseded by modernized piping norms. Not recommended for new procurement tenders.",
      scope: "Historical mild steel pipe fittings specification.",
      keywords: ["steel tubes", "mild steel", "pipe fittings", "withdrawn"],
      applicableProducts: ["Steel Tubes", "Fittings"],
      materials: ["Mild Steel"],
      applications: ["Low Pressure Gas", "Plumbing"],
    },
  });

  // Phase 12: Allied Standards for Knowledge Relationships
  const std5522 = await prisma.standard.create({
    data: {
      standardNumber: "IS 5522:2014",
      title: "Stainless steel sheets and strips for utensils — Specification",
      edition: "2014",
      revision: "Fourth Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies requirements for stainless steel sheet and strip used for utensil fabrication and cooking vessels.",
      scope: "Covers cold-rolled stainless steel sheets for food contact utensils.",
      keywords: ["stainless steel", "utensils", "sheet", "strip", "material"],
      applicableProducts: ["Stainless Steel Utensil Sheet", "Cookware Materials"],
      materials: ["Stainless Steel Grade 304", "AISI 304"],
      applications: ["Cookware Fabrication", "Utensils", "Pressure Cooker Bodies"],
    },
  });

  const std15997 = await prisma.standard.create({
    data: {
      standardNumber: "IS 15997:2012",
      title: "Low nickel austenitic stainless steel sheet and strip for utensils and appliances — Specification",
      edition: "2012",
      revision: "First Edition",
      status: "CURRENT",
      description:
        "DEMO RECORD: Covers low-nickel austenitic stainless steel alloys for culinary appliances and vessels.",
      scope: "Alternative alloy standard for economic utensil production.",
      keywords: ["low nickel", "austenitic", "stainless steel", "utensils", "appliances"],
      applicableProducts: ["Low Nickel Sheet", "Appliance Alloy"],
      materials: ["Low Nickel Austenitic Steel"],
      applications: ["Appliance Outer Body", "Cooking Vessels"],
    },
  });

  const std7466 = await prisma.standard.create({
    data: {
      standardNumber: "IS 7466:1994",
      title: "Rubber gaskets for domestic pressure cookers — Specification",
      edition: "1994",
      revision: "Second Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies requirements for rubber and elastomeric sealing gaskets used in domestic pressure cookers.",
      scope: "Covers food-grade vulcanized rubber gaskets resistant to heat and steam under pressure.",
      keywords: ["rubber gasket", "sealing ring", "component", "pressure cooker"],
      applicableProducts: ["Rubber Gaskets", "Sealing Rings"],
      materials: ["Food Grade Vulcanized Rubber", "Silicone Elastomer"],
      applications: ["Pressure Cooker Sealing", "Safety Assemblies"],
    },
  });

  const std2 = await prisma.standard.create({
    data: {
      standardNumber: "IS 2:2022",
      title: "Rules for rounding off numerical values",
      edition: "2022",
      revision: "Third Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: General standard for rounding numerical values cited in test result verifications and clause criteria.",
      scope: "Guidance on rounding of observed or calculated values in Indian Standards specifications.",
      keywords: ["rounding off", "numerical values", "normative reference", "calculations"],
      applicableProducts: ["General Engineering Calculations"],
      materials: [],
      applications: ["Mathematical Clause Thresholds", "Test Measurement Reporting"],
    },
  });

  const std16102 = await prisma.standard.create({
    data: {
      standardNumber: "IS 16102 (Part 1):2012",
      title: "Self-ballasted LED lamps for general lighting services — Part 1: Safety requirements",
      edition: "2012",
      revision: "First Edition",
      status: "CURRENT",
      description:
        "DEMO RECORD: Specifies safety and interchangeability requirements for self-ballasted LED lamps.",
      scope: "Safety testing for LED lamp fixtures operating on supply voltages up to 250V.",
      keywords: ["LED lamp", "safety", "ballasted", "lighting"],
      applicableProducts: ["Self-Ballasted LED Lamp", "Retrofit Lamps"],
      materials: ["Polycarbonate", "Aluminum Housing"],
      applications: ["General Illumination", "Street and Outdoor Lighting"],
    },
  });

  const std16103 = await prisma.standard.create({
    data: {
      standardNumber: "IS 16103 (Part 1):2012",
      title: "LED modules for general lighting — Part 1: Safety specifications",
      edition: "2012",
      revision: "First Edition",
      status: "CURRENT",
      description:
        "DEMO RECORD: Safety specifications for LED modules used in luminaires and street lighting equipment.",
      scope: "Requirements for general lighting LED modules without integrated controlgear.",
      keywords: ["LED module", "component", "safety", "street lighting"],
      applicableProducts: ["LED Module", "COB Light Engine"],
      materials: ["Metal Core PCB", "Semiconductor Array"],
      applications: ["Road Lighting Fixtures", "Industrial Luminaires"],
    },
  });

  // Amendments
  await prisma.standardAmendment.createMany({
    data: [
      {
        standardId: stdCookerCurrent.id,
        amendmentNumber: "Amendment No. 1",
        date: new Date("2024-03-15"),
        description: "DEMO RECORD: Clarification on testing procedures for secondary relief valves in induction-bottom models.",
        status: "ACTIVE",
      },
      {
        standardId: stdCookerCurrent.id,
        amendmentNumber: "Amendment No. 2",
        date: new Date("2024-10-01"),
        description: "DEMO RECORD: Editorial update to Annexure B reference standards for food-grade silicone gaskets.",
        status: "ACTIVE",
      },
      {
        standardId: stdLED.id,
        amendmentNumber: "Amendment No. 1",
        date: new Date("2021-08-10"),
        description: "DEMO RECORD: Updated surge protection threshold requirement from 4kV to 10kV for outdoor road installations.",
        status: "ACTIVE",
      },
    ],
  });

  // Related Standards Knowledge Relationships (Phase 12)
  await prisma.relatedStandard.createMany({
    data: [
      // IS 2347:2023 -> Allied Standards
      {
        standardId: stdCookerCurrent.id,
        relatedStandardId: stdSteel.id,
        relationshipType: "MATERIAL",
        notes: "Demo relationship — verify against authoritative BIS source: Stainless steel plate/sheet specification for vessel bodies.",
        status: "DEMO",
      },
      {
        standardId: stdCookerCurrent.id,
        relatedStandardId: std5522.id,
        relationshipType: "MATERIAL",
        notes: "Demo relationship — verify against authoritative BIS source: Dedicated stainless steel utensil material standard.",
        status: "DEMO",
      },
      {
        standardId: stdCookerCurrent.id,
        relatedStandardId: std15997.id,
        relationshipType: "MATERIAL",
        notes: "Demo relationship — verify against authoritative BIS source: Alternative low-nickel stainless steel specification.",
        status: "DEMO",
      },
      {
        standardId: stdCookerCurrent.id,
        relatedStandardId: std7466.id,
        relationshipType: "COMPONENT",
        notes: "Demo relationship — verify against authoritative BIS source: Sealing gasket specification mandatory for pressure retention.",
        status: "DEMO",
      },
      {
        standardId: stdCookerCurrent.id,
        relatedStandardId: std2.id,
        relationshipType: "NORMATIVE_REFERENCE",
        notes: "Demo relationship — verify against authoritative BIS source: Standard numerical rounding rules for clause tolerances.",
        status: "DEMO",
      },
      {
        standardId: stdCookerSuperseded.id,
        relatedStandardId: stdCookerCurrent.id,
        relationshipType: "SUPERSEDED_BY",
        notes: "Demo relationship — verify against authoritative BIS source: 2014 edition superseded by 2023 publication.",
        status: "DEMO",
      },
      {
        standardId: stdSafety.id,
        relatedStandardId: stdCookerCurrent.id,
        relationshipType: "SAFETY",
        notes: "Demo relationship — verify against authoritative BIS source: General electrical safety standard for electric pressure cookers.",
        status: "DEMO",
      },
      // IS 10322 (Part 5/Sec 3):2012 -> Allied Standards
      {
        standardId: stdLED.id,
        relatedStandardId: std16102.id,
        relationshipType: "SAFETY",
        notes: "Demo relationship — verify against authoritative BIS source: Safety requirements for self-ballasted LED light sources.",
        status: "DEMO",
      },
      {
        standardId: stdLED.id,
        relatedStandardId: std16103.id,
        relationshipType: "COMPONENT",
        notes: "Demo relationship — verify against authoritative BIS source: Subsystem LED module specifications for road fixtures.",
        status: "DEMO",
      },
      {
        standardId: stdLED.id,
        relatedStandardId: stdSafety.id,
        relationshipType: "SAFETY",
        notes: "Demo relationship — verify against authoritative BIS source: General electrical insulation and earth bonding requirements.",
        status: "DEMO",
      },
      // IS 374:2019 -> Allied Standards
      {
        standardId: stdFan.id,
        relatedStandardId: stdSafety.id,
        relationshipType: "SAFETY",
        notes: "Demo relationship — verify against authoritative BIS source: Electrical safety and insulation requirements for fan motors.",
        status: "DEMO",
      },
    ],
  });

  console.log("Seeded standards, amendments, and related standard knowledge graph.");

  // 3. Seed Existing 5 Recommendations
  const rec1 = await prisma.recommendation.create({
    data: {
      id: "REC-2026-0842",
      userId: officer.id,
      requirementText: "Procurement of 500 units of commercial grade Stainless Steel Pressure Cookers with 5 Litre capacity, suitable for induction and LPG burners in institutional canteen.",
      product: "Commercial Pressure Cooker",
      material: "Stainless Steel (AISI 304 / Grade 304)",
      capacity: "5 Litre",
      application: "Institutional Canteen Kitchen",
      technicalCharacteristics: "Food-grade stainless steel body, composite base for induction, dual safety valves, ISI mark mandatory under Domestic Pressure Cooker QCO.",
      confidence: 96,
      status: "ACCEPTED",
      saved: true,
      department: "Defence Canteen Stores (DGQA)",
      decisionNotes: "Approved for tender documentation. IS 2347:2023 with mandatory ISI mark compliance clause included in Section 4.2.",
    },
  });

  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec1.id,
      standardId: stdCookerCurrent.id,
      matchConfidence: 96,
      reason: "Direct specification match for stainless steel pressure cookers with safety valve requirements.",
      isPrimary: true,
    },
  });
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec1.id,
      standardId: stdSteel.id,
      matchConfidence: 89,
      reason: "Normative material reference for food-grade stainless steel strip and sheet.",
      isPrimary: false,
    },
  });

  await prisma.evidence.createMany({
    data: [
      {
        recommendationId: rec1.id,
        standardId: stdCookerCurrent.id,
        type: "SCOPE",
        reference: "IS 2347:2023 — Clause 1.1 (Demo Reference)",
        content: "Demonstration excerpt: Covers domestic and commercial pressure cookers intended for cooking foods under pressure.",
        source: "BIS Standard Catalog Record (Demo)",
        status: "Verified",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCookerCurrent.id,
        type: "CERTIFICATION",
        reference: "DPIIT Quality Control Order (Demo)",
        content: "Demonstration record: Domestic Pressure Cookers (Quality Control) Order mandates Scheme I ISI mark certification under IS 2347.",
        source: "Gazette Notification Index (Demo)",
        status: "Mandatory QCO",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCookerCurrent.id,
        type: "MATERIAL",
        reference: "IS 2347:2023 — Clause 4.2 Material Composition (Demo)",
        content: "Demonstration record: Stainless steel bodies shall conform to Grade 304 of IS 6911 with minimum chromium content of 18%.",
        source: "Standard Clause Table (Demo)",
        status: "Verified",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCookerCurrent.id,
        type: "CURRENTNESS",
        reference: "BIS Online Standardization Index (Demo)",
        content: "Demonstration record: IS 2347:2023 Seventh Revision is current and active with Amendment No. 1 & 2.",
        source: "BIS Catalog Status (Demo)",
        status: "Current",
      },
    ],
  });

  const rev1 = await prisma.review.create({
    data: {
      recommendationId: rec1.id,
      reviewerId: reviewer.id,
      status: "ACCEPTED",
      notes: "Technical verification complete. Grade 304 stainless steel specifications and dual relief valves align with GeM technical schedule.",
    },
  });
  await prisma.reviewChecklist.createMany({
    data: [
      { reviewId: rev1.id, itemKey: "scope", label: "Scope & product taxonomy match verified", completed: true },
      { reviewId: rev1.id, itemKey: "material", label: "Grade 304 stainless steel specification validated", completed: true },
      { reviewId: rev1.id, itemKey: "application", label: "Canteen induction/LPG operational profile checked", completed: true },
      { reviewId: rev1.id, itemKey: "currentness", label: "Current edition IS 2347:2023 confirmed", completed: true },
      { reviewId: rev1.id, itemKey: "certification", label: "Mandatory QCO ISI mark requirement verified", completed: true },
    ],
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        recommendationId: rec1.id,
        actorId: officer.id,
        action: "RECOMMENDATION_CREATED",
        details: "Recommendation generated for 500 units stainless steel pressure cooker requirement.",
        createdAt: new Date("2026-09-20T10:15:00Z"),
      },
      {
        recommendationId: rec1.id,
        actorId: reviewer.id,
        action: "EVIDENCE_REVIEWED",
        details: "Reviewed 4 evidence records: Scope, QCO certification order, material clause, and currentness.",
        createdAt: new Date("2026-09-21T14:30:00Z"),
      },
      {
        recommendationId: rec1.id,
        actorId: reviewer.id,
        action: "NOTE_ADDED",
        details: "Added verification note: Confirmed compliance with DPIIT mandatory certification.",
        createdAt: new Date("2026-09-21T15:00:00Z"),
      },
      {
        recommendationId: rec1.id,
        actorId: officer.id,
        action: "RECOMMENDATION_ACCEPTED",
        details: "Recommendation accepted into tender procurement schedule.",
        createdAt: new Date("2026-09-22T09:45:00Z"),
      },
    ],
  });

  // Recommendation 2: PENDING_REVIEW (LED Luminaire)
  const rec2 = await prisma.recommendation.create({
    data: {
      id: "REC-2026-0843",
      userId: officer.id,
      requirementText: "Supply of 120W Outdoor LED Street Light Luminaires with IP66 ingress protection and 10kV surge protection for Smart City Municipal highway project.",
      product: "Outdoor LED Street Light Luminaire",
      material: "Die-cast Aluminum Housing with Toughened Glass",
      capacity: "120 Watt, 140 lm/W",
      application: "Municipal Highway and Urban Arterial Roads",
      technicalCharacteristics: "IP66 ingress protection, IK08 impact resistance, CCT 4000K-5700K, internal 10kV surge suppressor.",
      confidence: 93,
      status: "PENDING_REVIEW",
      saved: false,
      department: "Smart Cities Mission / Municipal Works",
    },
  });
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec2.id,
      standardId: stdLED.id,
      matchConfidence: 93,
      reason: "Standard covers roadway and public outdoor street luminaires.",
      isPrimary: true,
    },
  });
  await prisma.evidence.createMany({
    data: [
      {
        recommendationId: rec2.id,
        standardId: stdLED.id,
        type: "SCOPE",
        reference: "IS 10322 (Part 5/Sec 3) — Clause 1.1 (Demo)",
        content: "Demonstration excerpt: Specifies requirements for road and street lighting luminaires.",
        source: "BIS Standard Catalog Record (Demo)",
        status: "Verified",
      },
      {
        recommendationId: rec2.id,
        standardId: stdLED.id,
        type: "REQUIREMENT",
        reference: "IS 10322 (Part 5/Sec 3) — Clause 7.2 Ingress Protection (Demo)",
        content: "Demonstration record: Luminaires for outdoor highway installation shall provide minimum IP65 protection.",
        source: "Standard Clause Table (Demo)",
        status: "Verified",
      },
    ],
  });
  await prisma.auditEvent.create({
    data: {
      recommendationId: rec2.id,
      actorId: officer.id,
      action: "RECOMMENDATION_CREATED",
      details: "Recommendation generated for 120W Outdoor LED Street Light Luminaire requirement.",
    },
  });

  // Recommendation 3: UNDER_TECHNICAL_REVIEW
  const rec3 = await prisma.recommendation.create({
    data: {
      id: "REC-2026-0844",
      userId: officer.id,
      requirementText: "Procurement of 3.5 kW Commercial Induction Cooking Range with electromagnetic safety shielding and continuous duty cycle for Railway Base Kitchens.",
      product: "Commercial Induction Cooking Hob",
      material: "Stainless steel chassis with ceramic glass top",
      capacity: "3500 Watt / 230V Single Phase",
      application: "Railway Base Kitchens Catering Operations",
      technicalCharacteristics: "Glass ceramic surface, IPX4 splash resistance, high-frequency induction coil, harmonic suppression.",
      confidence: 88,
      status: "UNDER_TECHNICAL_REVIEW",
      saved: true,
      department: "IRCTC Catering Infrastructure",
      decisionNotes: "Review requested to verify whether IS 302-2-6 or commercial catering equipment standard IS 302-2-36 governs 3.5kW duty.",
    },
  });
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec3.id,
      standardId: stdSafety.id,
      matchConfidence: 88,
      reason: "Applies to electrical safety of heating and cooking appliances.",
      isPrimary: true,
    },
  });

  // Recommendation 4: CLARIFICATION_REQUESTED
  const rec4 = await prisma.recommendation.create({
    data: {
      id: "REC-2026-0845",
      userId: officer.id,
      requirementText: "Procurement of 2000 units of energy-efficient 1200mm Brushless DC (BLDC) Ceiling Fans with RF remote control for Central University hostels.",
      product: "BLDC Ceiling Fan 1200mm",
      material: "Aluminum blades and motor body",
      capacity: "1200 mm sweep, 28W power consumption, 220 m³/min air delivery",
      application: "Educational Institution Hostels and Classrooms",
      technicalCharacteristics: "BLDC motor, 5-star BEE energy rating, RF remote, silent operation.",
      confidence: 84,
      status: "CLARIFICATION_REQUESTED",
      saved: false,
      department: "Central Public Works Department (CPWD)",
      decisionNotes: "Clarification requested from requesting officer: Please specify whether BEE Star Labeling compliance is required alongside IS 374.",
    },
  });
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec4.id,
      standardId: stdFan.id,
      matchConfidence: 84,
      reason: "Electric ceiling fans and regulators specification.",
      isPrimary: true,
    },
  });

  // Recommendation 5: NOT_APPLICABLE
  const rec5 = await prisma.recommendation.create({
    data: {
      id: "REC-2026-0846",
      userId: officer.id,
      requirementText: "Artisan handcrafted bespoke teak wood ornamental carved door panels for historical museum restoration gallery.",
      product: "Handcrafted Heritage Wooden Panels",
      material: "Reclaimed Aged Burma Teak Wood",
      capacity: "Non-standard custom architectural woodwork",
      application: "Museum Heritage Restoration",
      technicalCharacteristics: "Traditional manual relief carving, wax polish finish, artisan guild certification.",
      confidence: 32,
      status: "NOT_APPLICABLE",
      saved: false,
      department: "Archaeological Survey & Heritage Trust",
      decisionNotes: "Item is a custom artistic heritage artifact exempt from standardized factory industrial product norms.",
    },
  });

  // Demo Document metadata record
  await prisma.document.create({
    data: {
      recommendationId: rec1.id,
      filename: "Canteen_Pressure_Cooker_Tender_2026.pdf",
      fileType: "application/pdf",
      fileSize: "2457600",
      pageCount: 14,
      processingStatus: "COMPLETED",
    },
  });

  // ====================================================
  // 5. Seed Compliance & QCO Rules Engine (Phase 13)
  // ====================================================
  console.log("Seeding Phase 13 Compliance & QCO demonstration rules...");

  // Rule 1: Pressure Cooker QCO Demo Rule
  const ruleCooker = await prisma.complianceRule.create({
    data: {
      name: "Domestic Pressure Cooker Quality Control Order (Demo)",
      description: "Demo regulatory rule indicating potential Scheme-I / ISI mark compliance requirement for pressure cookers under Domestic Pressure Cooker QCO.",
      standardId: stdCookerCurrent.id,
      productCategory: "Kitchen Equipment & Pressure Cookers",
      applicability: "Applies to pressure cookers for domestic/institutional catering manufactured or imported for Indian procurement.",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "BIS / Department of Consumer Affairs (Demo Dataset)",
      sourceReference: "Demo Gazette Notification Ref: S.O. 1234(E) — Domestic Pressure Cookers (Quality Control) Order (Demo Data)",
      effectiveFrom: new Date("2021-02-01"),
      effectiveTo: null,
      status: "ACTIVE",
      notes: "Demo regulatory data — verify against current authoritative regulatory source before procurement use.",
      isDemo: true,
      conditions: {
        create: [
          {
            field: "product",
            operator: "CONTAINS",
            value: "pressure cooker",
          },
          {
            field: "standardNumber",
            operator: "EQUALS",
            value: "IS 2347:2023",
          },
        ],
      },
      evidences: {
        create: [
          {
            sourceTitle: "BIS Scheme-I Product Certification Directory (Demo)",
            sourceReference: "BIS Conformity Assessment Scheme-I (ISI Mark) Schedule (Demo Sample)",
            effectiveDate: new Date("2021-02-01"),
            notes: "Demonstration evidence reference for testing compliance engine linkages.",
          },
        ],
      },
    },
  });

  // Rule 2: LED Street Lighting Luminaire QCO Demo Rule
  const ruleLED = await prisma.complianceRule.create({
    data: {
      name: "LED Luminaires Safety & Compulsory Registration (Demo)",
      description: "Demo regulatory rule evaluating compulsory registration / safety requirements for road & street lighting luminaires.",
      standardId: stdLED.id,
      productCategory: "Outdoor Luminaires & Street Lighting",
      applicability: "Applies to fixed roadway lighting luminaires operating on AC supply voltages up to 1000V.",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "MeitY / BIS (Demo Dataset)",
      sourceReference: "Demo Notification: Electronics and Information Technology Goods (Compulsory Registration) Order (Demo Data)",
      effectiveFrom: new Date("2016-09-01"),
      effectiveTo: null,
      status: "ACTIVE",
      notes: "Demo regulatory data — verify against current authoritative regulatory source before procurement use.",
      isDemo: true,
      conditions: {
        create: [
          {
            field: "product",
            operator: "CONTAINS",
            value: "led",
          },
          {
            field: "standardNumber",
            operator: "CONTAINS",
            value: "10322",
          },
        ],
      },
    },
  });

  // Rule 3: Heritage Woodwork Exemption Demo Rule
  const ruleHeritage = await prisma.complianceRule.create({
    data: {
      name: "Custom Handcrafted Heritage Artifact Exemption (Demo)",
      description: "Demo rule identifying that non-industrial bespoke handcrafted heritage items typically do not have mandatory industrial QCO coverage.",
      productCategory: "Handcrafted Heritage & Artifacts",
      applicability: "Applies to bespoke non-standardized artisanal woodwork and museum restoration artifacts.",
      outcome: "NOT_IDENTIFIED",
      authority: "Ministry of Culture / Handicrafts Board (Demo Dataset)",
      sourceReference: "Demo Handicrafts Advisory (Demo Data)",
      effectiveFrom: new Date("2020-01-01"),
      effectiveTo: null,
      status: "ACTIVE",
      notes: "Demo regulatory data — verify against current authoritative regulatory source before procurement use.",
      isDemo: true,
      conditions: {
        create: [
          {
            field: "product",
            operator: "CONTAINS",
            value: "handcrafted",
          },
        ],
      },
    },
  });

  // Seed compliance evaluation on demo rec1 (Pressure Cooker)
  await prisma.complianceEvaluation.create({
    data: {
      recommendationId: rec1.id,
      complianceRuleId: ruleCooker.id,
      outcome: "POTENTIALLY_APPLICABLE",
      matchedConditions: [
        {
          field: "product",
          operator: "CONTAINS",
          expectedValue: "pressure cooker",
          actualValue: rec1.product,
        },
        {
          field: "standardNumber",
          operator: "EQUALS",
          expectedValue: "IS 2347:2023",
          actualValue: "IS 2347:2023",
        },
      ],
      explanation: "Potentially applicable because requirement matched active demo rule \"Domestic Pressure Cooker Quality Control Order (Demo)\" based on product category in current dataset.",
      requiresHumanReview: true,
      missingAttributes: [],
    },
  });

  await prisma.auditEvent.create({
    data: {
      recommendationId: rec1.id,
      actorId: officer.id,
      action: "COMPLIANCE_EVALUATED",
      details: `Compliance rules evaluated. Outcome: POTENTIALLY_APPLICABLE. Matched rule: ${ruleCooker.name}. Human review required: true.`,
    },
  });

  console.log("Database seeded successfully with standards, knowledge graph, recommendations, and compliance rules!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
