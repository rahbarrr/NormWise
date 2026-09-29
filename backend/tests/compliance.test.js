import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/db.js";
import {
  complianceRuleService,
  validateCondition,
  evaluateSingleCondition,
} from "../src/services/complianceRuleService.js";
import { complianceController } from "../src/controllers/compliance.controller.js";
import { recommend } from "../src/services/recommendation/recommendationService.js";

describe("Phase 13 Compliance & QCO Rules Engine Test Suite", () => {
  let createdRuleIds = [];
  let testRecId = null;

  before(async () => {
    // Ensure test user exists
    const user = await prisma.user.upsert({
      where: { email: "officer@normwise.gov.in" },
      update: {},
      create: {
        name: "Test Officer",
        email: "officer@normwise.gov.in",
        role: "PROCUREMENT_OFFICER",
      },
    });

    // Create a dummy recommendation for compliance evaluation tests
    const rec = await prisma.recommendation.create({
      data: {
        userId: user.id,
        requirementText: "Heavy-duty commercial electric pressure cooker for naval ship mess galley.",
        product: "Electric Pressure Cooker",
        status: "PENDING_REVIEW",
      },
    });
    testRecId = rec.id;
  });

  after(async () => {
    // Cleanup any temporary rules created during testing
    if (createdRuleIds.length > 0) {
      await prisma.complianceEvaluation.deleteMany({
        where: { complianceRuleId: { in: createdRuleIds } },
      });
      await prisma.complianceCondition.deleteMany({
        where: { complianceRuleId: { in: createdRuleIds } },
      });
      await prisma.complianceEvidence.deleteMany({
        where: { complianceRuleId: { in: createdRuleIds } },
      });
      await prisma.complianceRule.deleteMany({
        where: { id: { in: createdRuleIds } },
      });
    }

    if (testRecId) {
      await prisma.complianceEvaluation.deleteMany({
        where: { recommendationId: testRecId },
      });
      await prisma.auditEvent.deleteMany({
        where: { recommendationId: testRecId },
      });
      await prisma.recommendation.delete({
        where: { id: testRecId },
      });
    }
  });

  test("1. should evaluate exact product match correctly", () => {
    const resTrue = evaluateSingleCondition("EQUALS", "Pressure Cooker", "pressure cooker");
    const resFalse = evaluateSingleCondition("EQUALS", "Pressure Cooker", "LED light");

    assert.equal(resTrue.matches, true);
    assert.equal(resFalse.matches, false);
  });

  test("2. should evaluate contains match for partial strings", () => {
    const res = evaluateSingleCondition("CONTAINS", "pressure cooker", "Commercial 10L Stainless Steel Pressure Cooker");
    assert.equal(res.matches, true);

    const resFail = evaluateSingleCondition("CONTAINS", "pressure cooker", "Ceiling Fan 1200mm");
    assert.equal(resFail.matches, false);
  });

  test("3. should evaluate multiple conditions in a single rule", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "Stainless Steel Pressure Cooker",
      },
      standardNumber: "IS 2347:2023",
    });

    assert.equal(evalRes.outcome, "POTENTIALLY_APPLICABLE");
    assert.ok(evalRes.matchedRules.length > 0);
    assert.equal(evalRes.isDemoDataset, true);
  });

  test("4. should return INSUFFICIENT_EVIDENCE when required attributes are missing", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "",
      },
      standardNumber: "",
    });

    assert.equal(evalRes.outcome, "INSUFFICIENT_EVIDENCE");
    assert.equal(evalRes.requiresHumanReview, true);
    assert.ok(evalRes.missingAttributes.includes("product"));
  });

  test("5. should return NOT_IDENTIFIED when no regulatory rule matches", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "Non-standard artisan bamboo decorative basket",
        material: "Natural Cane",
      },
      standardNumber: "IS 99999",
    });

    assert.equal(evalRes.outcome, "NOT_IDENTIFIED");
    assert.equal(evalRes.matchedRules.length, 0);
  });

  test("6. should match and evaluate an active rule", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "Outdoor 120W LED Street Lighting Luminaire",
      },
      standardNumber: "IS 10322",
    });

    assert.equal(evalRes.outcome, "POTENTIALLY_APPLICABLE");
    assert.ok(evalRes.matchedRules.some((r) => r.name.includes("LED")));
  });

  test("7. should ignore expired rule whose effectiveTo date has passed", async () => {
    const expiredRule = await complianceRuleService.createRule({
      name: "Temporary Expired Emergency Rule (Test)",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "Test Authority",
      sourceReference: "Expired Notification Ref",
      effectiveFrom: new Date("2020-01-01"),
      effectiveTo: new Date("2021-01-01"), // Expired
      status: "ACTIVE",
      isDemo: true,
      conditions: [
        {
          field: "product",
          operator: "EQUALS",
          value: "unique-expired-widget-xyz",
        },
      ],
    });
    createdRuleIds.push(expiredRule.id);

    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "unique-expired-widget-xyz",
      },
      evaluationDate: new Date("2026-01-01"),
    });

    assert.equal(evalRes.outcome, "NOT_IDENTIFIED");
  });

  test("8. should ignore future rule whose effectiveFrom date is in future", async () => {
    const futureRule = await complianceRuleService.createRule({
      name: "Upcoming 2028 Future Regulation (Test)",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "Test Authority",
      sourceReference: "Draft 2028 Order",
      effectiveFrom: new Date("2028-01-01"), // Future
      effectiveTo: null,
      status: "ACTIVE",
      isDemo: true,
      conditions: [
        {
          field: "product",
          operator: "EQUALS",
          value: "unique-future-solar-gadget-abc",
        },
      ],
    });
    createdRuleIds.push(futureRule.id);

    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "unique-future-solar-gadget-abc",
      },
      evaluationDate: new Date("2026-01-01"),
    });

    assert.equal(evalRes.outcome, "NOT_IDENTIFIED");
  });

  test("9. should detect conflicting rules and return REQUIRES_REVIEW", async () => {
    // Create rule A: POTENTIALLY_APPLICABLE
    const ruleA = await complianceRuleService.createRule({
      name: "Conflicting Rule A (Test)",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "Agency A",
      sourceReference: "Gazette A",
      status: "ACTIVE",
      isDemo: true,
      conditions: [
        {
          field: "product",
          operator: "CONTAINS",
          value: "conflict-product-test",
        },
      ],
    });
    createdRuleIds.push(ruleA.id);

    // Create rule B: NOT_IDENTIFIED
    const ruleB = await complianceRuleService.createRule({
      name: "Conflicting Rule B (Test)",
      outcome: "NOT_IDENTIFIED",
      authority: "Agency B",
      sourceReference: "Exemption B",
      status: "ACTIVE",
      isDemo: true,
      conditions: [
        {
          field: "product",
          operator: "CONTAINS",
          value: "conflict-product-test",
        },
      ],
    });
    createdRuleIds.push(ruleB.id);

    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "conflict-product-test device",
      },
    });

    assert.equal(evalRes.outcome, "REQUIRES_REVIEW");
    assert.equal(evalRes.requiresHumanReview, true);
    assert.ok(evalRes.explanation.toLowerCase().includes("conflicting"));
  });

  test("10. should safely reject invalid condition operator", () => {
    assert.throws(
      () => {
        validateCondition({
          field: "product",
          operator: "EXECUTE_ARBITRARY_CODE",
          value: "val",
        });
      },
      /Invalid condition operator/
    );
  });

  test("11. should safely reject invalid condition field", () => {
    assert.throws(
      () => {
        validateCondition({
          field: "arbitraryNonExistentField",
          operator: "EQUALS",
          value: "val",
        });
      },
      /Invalid condition field/
    );
  });

  test("12. should set outcome to REQUIRES_REVIEW if rule has missing source reference", async () => {
    const unsourcedRule = await complianceRuleService.createRule({
      name: "Unsourced Rule (Test)",
      outcome: "POTENTIALLY_APPLICABLE",
      authority: "Unknown Authority",
      sourceReference: "", // Empty source
      status: "ACTIVE",
      isDemo: true,
      conditions: [
        {
          field: "product",
          operator: "EQUALS",
          value: "unsourced-test-device",
        },
      ],
    });
    createdRuleIds.push(unsourcedRule.id);

    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "unsourced-test-device",
      },
    });

    assert.equal(evalRes.outcome, "REQUIRES_REVIEW");
    assert.equal(evalRes.requiresHumanReview, true);
    assert.ok(evalRes.explanation.toLowerCase().includes("source"));
  });

  test("13. should clearly flag demo rule evaluation as isDemoDataset", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "Handcrafted Heritage Artifact",
      },
    });

    assert.equal(evalRes.isDemoDataset, true);
  });

  test("14. should retrieve recommendation compliance via API endpoint", async () => {
    let statusCode = 200;
    let jsonResult = null;
    const req = { params: { id: testRecId } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await complianceController.getRecommendationCompliance(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    assert.ok(jsonResult.data);
    assert.ok(jsonResult.data.outcome);
  });

  test("15. should create COMPLIANCE_EVALUATED audit event when evaluated", async () => {
    await complianceRuleService.evaluateCompliance({
      recommendationId: testRecId,
      attributes: {
        product: "Commercial Pressure Cooker",
      },
      standardNumber: "IS 2347:2023",
    });

    const auditEvents = await prisma.auditEvent.findMany({
      where: {
        recommendationId: testRecId,
        action: "COMPLIANCE_EVALUATED",
      },
    });

    assert.ok(auditEvents.length > 0);
  });

  test("16. should set requiresHumanReview to true for regulatory decisions", async () => {
    const evalRes = await complianceRuleService.evaluateCompliance({
      attributes: {
        product: "Pressure Cooker",
      },
      standardNumber: "IS 2347:2023",
    });

    assert.equal(evalRes.requiresHumanReview, true);
  });

  test("17. should ensure recommendation engine includes compliance evaluation in output", async () => {
    const recResult = await recommend("Stainless steel 5 litre pressure cooker for school canteen");

    assert.ok(recResult.compliance);
    assert.ok(recResult.compliance.outcome);
    assert.equal(recResult.compliance.outcome, "POTENTIALLY_APPLICABLE");
    assert.equal(recResult.primaryRecommendation.standardNumber, "IS 2347:2023");
  });
});
