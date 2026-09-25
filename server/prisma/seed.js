import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NormWise demonstration database in PostgreSQL...");

  // Clean existing tables in proper order
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

  // 2. Seed Standards
  const stdCooker = await prisma.standard.create({
    data: {
      standardNumber: "IS 2347:2023",
      title: "Pressure cookers — Specification",
      edition: "2023",
      revision: "Seventh Revision",
      status: "CURRENT",
      description:
        "DEMO RECORD: Prescribes requirement for domestic and commercial pressure cookers made of aluminum alloys or stainless steel, covering design, material, proof pressure, and safety release mechanisms.",
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
    },
  });

  // Amendments
  await prisma.standardAmendment.createMany({
    data: [
      {
        standardId: stdCooker.id,
        amendmentNumber: "Amendment No. 1",
        date: new Date("2024-03-15"),
        description: "DEMO RECORD: Clarification on testing procedures for secondary relief valves in induction-bottom models.",
        status: "ACTIVE",
      },
      {
        standardId: stdCooker.id,
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

  // Related Standards
  await prisma.relatedStandard.create({
    data: {
      standardId: stdCooker.id,
      relatedStandardId: stdSteel.id,
      relationshipType: "MATERIAL",
    },
  });

  console.log("Seeded standards, amendments, and relationships");

  // 3. Seed 5 Recommendations with different statuses
  // Recommendation 1: ACCEPTED
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

  // Link Rec 1 standards
  await prisma.recommendationStandard.create({
    data: {
      recommendationId: rec1.id,
      standardId: stdCooker.id,
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

  // Rec 1 Evidences
  await prisma.evidence.createMany({
    data: [
      {
        recommendationId: rec1.id,
        standardId: stdCooker.id,
        type: "SCOPE",
        reference: "IS 2347:2023 — Clause 1.1 (Demo Reference)",
        content: "Demonstration excerpt: Covers domestic and commercial pressure cookers intended for cooking foods under pressure.",
        source: "BIS Standard Catalog Record (Demo)",
        status: "Verified",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCooker.id,
        type: "CERTIFICATION",
        reference: "DPIIT Quality Control Order (Demo)",
        content: "Demonstration record: Domestic Pressure Cookers (Quality Control) Order mandates Scheme I ISI mark certification under IS 2347.",
        source: "Gazette Notification Index (Demo)",
        status: "Mandatory QCO",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCooker.id,
        type: "MATERIAL",
        reference: "IS 2347:2023 — Clause 4.2 Material Composition (Demo)",
        content: "Demonstration record: Stainless steel bodies shall conform to Grade 304 of IS 6911 with minimum chromium content of 18%.",
        source: "Standard Clause Table (Demo)",
        status: "Verified",
      },
      {
        recommendationId: rec1.id,
        standardId: stdCooker.id,
        type: "CURRENTNESS",
        reference: "BIS Online Standardization Index (Demo)",
        content: "Demonstration record: IS 2347:2023 Seventh Revision is current and active with Amendment No. 1 & 2.",
        source: "BIS Catalog Status (Demo)",
        status: "Current",
      },
    ],
  });

  // Rec 1 Review & Checklist
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

  // Rec 1 Audit Events
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

  // Recommendation 2: PENDING_REVIEW
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
  await prisma.evidence.createMany({
    data: [
      {
        recommendationId: rec3.id,
        standardId: stdSafety.id,
        type: "SCOPE",
        reference: "IS 302 (Part 1):2024 — Clause 1 Scope (Demo)",
        content: "Demonstration excerpt: General safety rules for household and similar electrical cooking equipment.",
        source: "BIS Standard Catalog Record (Demo)",
        status: "Verified",
      },
    ],
  });
  const rev3 = await prisma.review.create({
    data: {
      recommendationId: rec3.id,
      reviewerId: reviewer.id,
      status: "TECHNICAL_REVIEW",
      notes: "Flagged for Electrical Division review regarding industrial commercial continuous ratings.",
    },
  });
  await prisma.reviewChecklist.createMany({
    data: [
      { reviewId: rev3.id, itemKey: "scope", label: "Scope & product taxonomy match verified", completed: true },
      { reviewId: rev3.id, itemKey: "material", label: "Chassis & ceramic surface checked", completed: false },
      { reviewId: rev3.id, itemKey: "currentness", label: "Current edition IS 302 checked", completed: true },
    ],
  });
  await prisma.auditEvent.createMany({
    data: [
      {
        recommendationId: rec3.id,
        actorId: officer.id,
        action: "RECOMMENDATION_CREATED",
        details: "Recommendation generated for 3.5kW Commercial Induction Range.",
      },
      {
        recommendationId: rec3.id,
        actorId: reviewer.id,
        action: "REVIEW_REQUESTED",
        details: "Requested technical review: Clarify distinction between domestic and commercial catering duty cycles.",
      },
    ],
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
      standardId: stdSafety.id,
      matchConfidence: 84,
      reason: "General electrical safety baseline standard for ceiling fans.",
      isPrimary: true,
    },
  });
  await prisma.auditEvent.createMany({
    data: [
      {
        recommendationId: rec4.id,
        actorId: officer.id,
        action: "RECOMMENDATION_CREATED",
        details: "Recommendation generated for BLDC Ceiling Fan procurement.",
      },
      {
        recommendationId: rec4.id,
        actorId: reviewer.id,
        action: "CLARIFICATION_REQUESTED",
        details: "Requested clarification on whether BEE Star Labeling schedule is mandatory for this batch.",
      },
    ],
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
  await prisma.auditEvent.createMany({
    data: [
      {
        recommendationId: rec5.id,
        actorId: officer.id,
        action: "RECOMMENDATION_CREATED",
        details: "Initial analysis attempted for handcrafted heritage door panels.",
      },
      {
        recommendationId: rec5.id,
        actorId: reviewer.id,
        action: "MARKED_NOT_APPLICABLE",
        details: "Marked NOT_APPLICABLE: Bespoke artistic craft does not fall under mandatory industrial product standards.",
      },
    ],
  });

  // Demo Document metadata record
  await prisma.document.create({
    data: {
      recommendationId: rec1.id,
      filename: "Canteen_Pressure_Cooker_Tender_2026.pdf",
      fileType: "application/pdf",
      fileSize: "2457600",
      pageCount: 14,
      processingStatus: "PROCESSED",
    },
  });

  console.log("Seeded 5 diverse recommendations with evidence, reviews, audit events, and document metadata.");
  console.log("Database seed complete!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
