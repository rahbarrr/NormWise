import test from "node:test";
import assert from "node:assert/strict";
import supabase from "../src/config/supabase.js";
import { retrieveSprint1Candidates } from "../src/services/retrieval/sprint1CandidateRetrieval.js";

const requiredTables = ["users", "standards", "recommendations", "recommendation_standards", "related_standards", "evidence", "documents", "audit_events"];

test("Supabase exposes the eight Sprint 1 tables", async () => {
  for (const name of requiredTables) {
    const { error } = await supabase.from(name).select("*").limit(1);
    assert.equal(error, null, `${name}: ${error?.message}`);
  }
});

test("candidate retrieval returns real standards for pilot queries", async () => {
  const result = await retrieveSprint1Candidates("stainless steel pressure cooker", { limit: 10 });
  assert.ok(result.candidates.some((candidate) => candidate.is_number === "IS 2347:2023"));
});

test("related standards and evidence queries are readable", async () => {
  const { data: standards, error: standardsError } = await supabase.from("standards").select("id").limit(1);
  assert.equal(standardsError, null);
  if (!standards?.length) return;
  const related = await supabase.from("related_standards").select("*").eq("source_standard_id", standards[0].id);
  assert.equal(related.error, null);
  const evidence = await supabase.from("evidence").select("*").eq("standard_id", standards[0].id);
  assert.equal(evidence.error, null);
});
