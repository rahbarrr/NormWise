import test from "node:test";
import assert from "node:assert/strict";
import { createSprint2Recommendation, extractAttributes, rankCandidates } from "../src/services/recommendation/sprint2RecommendationService.js";
import supabase from "../src/config/supabase.js";

test("deterministic extraction and weighting are transparent", () => {
  const attributes = extractAttributes("stainless steel pressure cooker for domestic kitchenware");
  assert.equal(attributes.product, "pressure cooker");
  assert.equal(attributes.material, "stainless steel");
  const ranked = rankCandidates("stainless steel pressure cooker", [{ id: "1", is_number: "IS X", product: "pressure cooker", material: "stainless steel", application: "domestic kitchenware", title: "Pressure cooker", scope: "pressure cookers" }], attributes);
  assert.equal(ranked[0].score > 0.5, true);
});

test("remote Supabase pipeline persists a domestic recommendation", async () => {
  const result = await createSprint2Recommendation("stainless steel pressure cooker");
  assert.equal(result.primary_standard.is_number, "IS 2347:2023");
  assert.ok(result.recommendation_id);
  assert.equal(result.confidence.state, "high_confidence");
  const [rec, candidates, audit] = await Promise.all([
    supabase.from("recommendations").select("id").eq("id", result.recommendation_id).single(),
    supabase.from("recommendation_standards").select("id").eq("recommendation_id", result.recommendation_id),
    supabase.from("audit_events").select("id").eq("recommendation_id", result.recommendation_id),
  ]);
  assert.equal(rec.error, null); assert.equal(candidates.error, null); assert.equal(audit.error, null);
  assert.ok(candidates.data.length > 0); assert.equal(audit.data.length, 1);
});

for (const query of ["electrical accessory for low voltage installation", "steel nuts and bolts", "PVC pipe for water supply", "vehicle component specification"]) {
  test(`remote retrieval handles ${query}`, async () => {
    const result = await createSprint2Recommendation(query);
    assert.ok(result.recommendation_id);
    assert.ok(result.candidates.length > 0);
    assert.ok(["high_confidence", "review_required", "no_confident_match"].includes(result.confidence.state));
  });
}

test("empty input is rejected", async () => {
  await assert.rejects(() => createSprint2Recommendation(""), /at least 5 characters/);
});
