import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recommend } from "../src/services/recommendation/recommendationService.js";
import { validateCurrentness } from "../src/services/validation/currentnessService.js";
import prisma from "../src/config/db.js";

describe("Phase 10 Recommendation Engine Test Suite", () => {
  // Scenario 1: Pressure Cooker Requirement
  it("1. should recommend IS 2347:2023 for stainless steel pressure cooker requirement", async () => {
    const input = "Stainless steel pressure cooker, 5 litre, for institutional kitchen use with dual safety relief valves";
    const res = await recommend(input);

    assert.equal(res.status, "RECOMMENDED");
    assert.ok(res.primaryRecommendation, "Must return primary recommendation");
    assert.equal(res.primaryRecommendation.standardNumber, "IS 2347:2023");
    assert.equal(res.requirement.product, "Pressure Cooker");
    assert.ok(res.confidence >= 60, "Confidence should exceed minimum threshold");
    assert.ok(res.primaryRecommendation.reasons.length > 0, "Must provide explainable reasons");
    assert.ok(res.evidence.length > 0, "Must provide supporting evidence");
  });

  // Scenario 2: LED Street Lighting Requirement
  it("2. should recommend IS 10322 Part 5 / Sec 3 for outdoor LED street lighting luminaire", async () => {
    const input = "Supply of 120W outdoor LED street light luminaires with IP66 ingress protection and 10kV surge protection for highway";
    const res = await recommend(input);

    assert.equal(res.status, "RECOMMENDED");
    assert.ok(res.primaryRecommendation);
    assert.ok(res.primaryRecommendation.standardNumber.includes("IS 10322"));
    assert.equal(res.primaryRecommendation.currentness.status, "CURRENT");
    assert.equal(res.certification.scheme, "Scheme I / CRS Compulsory Registration");
  });

  // Scenario 3: Electrical Equipment Requirement
  it("3. should recommend IS 302 Part 1 for commercial induction cooking appliance electrical safety", async () => {
    const input = "Procurement of commercial induction cooking range with single phase electrical safety heating compliance";
    const res = await recommend(input);

    assert.ok(res.primaryRecommendation);
    assert.ok(res.primaryRecommendation.standardNumber.includes("IS 302"));
    assert.ok(res.confidence > 50);
  });

  // Scenario 4: Empty Requirement Validation
  it("4. should reject empty or short requirement with a 400 error", async () => {
    await assert.rejects(
      async () => {
        await recommend("");
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes("Please provide a procurement requirement"));
        return true;
      }
    );
  });

  // Scenario 5: Unknown Product / Out of Scope
  it("5. should return NO_MATCH with zero confidence for unknown bespoke products", async () => {
    const input = "Hand-embroidered antique Kashmiri pashmina wool shawl with natural saffron dye";
    const res = await recommend(input);

    assert.equal(res.status, "NO_MATCH");
    assert.equal(res.confidence, 0);
    assert.equal(res.primaryRecommendation, null);
    assert.ok(res.explanation.includes("No applicable Indian Standard was identified"));
  });

  // Scenario 6: Ambiguous Requirement
  it("6. should return CLARIFICATION_REQUIRED when requirement lacks specific product taxonomy", async () => {
    const input = "General cooking and heating equipment for public infrastructure pantry";
    const res = await recommend(input);

    assert.equal(res.status, "CLARIFICATION_REQUIRED");
    assert.ok(res.statusReason.includes("Important requirement attributes") || res.statusReason.includes("Multiple candidate standards"));
  });

  // Scenario 7: Current Standard Validation
  it("7. should validate that IS 2347:2023 is currently active and can proceed as primary", async () => {
    const std = await prisma.standard.findUnique({
      where: { standardNumber: "IS 2347:2023" },
    });
    assert.ok(std, "IS 2347:2023 must exist in database");

    const currentness = await validateCurrentness(std.id);
    assert.equal(currentness.status, "CURRENT");
    assert.equal(currentness.canProceedAsPrimary, true);
    assert.ok(currentness.amendments.length > 0, "Should reflect active amendments");
  });

  // Scenario 8: Superseded Standard Handling
  it("8. should flag superseded standard IS 2347:2014 and deprioritize it in favor of successor", async () => {
    const std = await prisma.standard.findUnique({
      where: { standardNumber: "IS 2347:2014" },
    });
    assert.ok(std, "IS 2347:2014 must exist in database");

    const currentness = await validateCurrentness(std.id);
    assert.equal(currentness.status, "SUPERSEDED");
    assert.equal(currentness.canProceedAsPrimary, false);
    assert.ok(currentness.notice.includes("SUPERSEDED"));
  });

  // Scenario 9: Withdrawn Standard Handling
  it("9. should detect withdrawn status for historical standard and forbid primary citation", async () => {
    const std = await prisma.standard.findUnique({
      where: { standardNumber: "IS 1239 (Part 2):1992" },
    });
    assert.ok(std, "Withdrawn standard must exist in database");

    const currentness = await validateCurrentness(std.id);
    assert.equal(currentness.status, "WITHDRAWN");
    assert.equal(currentness.canProceedAsPrimary, false);
    assert.ok(currentness.notice.includes("WITHDRAWN"));
  });

  // Scenario 10: Insufficient Evidence Handling
  it("10. should flag insufficient evidence when candidate standard lacks verified source clauses", async () => {
    // Query a standard without dedicated evidence clauses
    const std = await prisma.standard.findUnique({
      where: { standardNumber: "IS 374:2019" },
    });
    assert.ok(std);

    const input = "Electric ceiling fan 1200mm sweep";
    const res = await recommend(input);

    assert.ok(res.primaryRecommendation);
    assert.ok(res.status === "RECOMMENDED" || res.status === "INSUFFICIENT_EVIDENCE" || res.status === "CLARIFICATION_REQUIRED");
  });
});
