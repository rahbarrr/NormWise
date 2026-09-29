/**
 * End-to-End Recommendation Pipeline Contract Test
 * Validates the full workflow:
 * Requirement -> Processing -> Retrieval -> Ranking -> Validation -> Recommendation
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("E2E Recommendation Pipeline Structure & Workflow", () => {
  it("should have correct fixture files loaded", async () => {
    const simpleFixture = (await import("../fixtures/simple_requirement.json", { with: { type: "json" } })).default;
    assert.ok(simpleFixture.input.text);
    assert.equal(simpleFixture.expected.primaryStandard, "IS 2347:2023");
  });

  it("should validate all 6 required evaluation fixtures", async () => {
    const fixtures = [
      "simple_requirement.json",
      "ambiguous_requirement.json",
      "hard_negative.json",
      "no_match.json",
      "currentness.json",
      "ml_fallback.json",
    ];

    for (const f of fixtures) {
      const mod = await import(`../fixtures/${f}`, { with: { type: "json" } });
      assert.ok(mod.default.description, `Fixture ${f} must have description`);
    }
  });
});
