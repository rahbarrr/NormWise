import supabase from "../src/config/supabase.js";

const failures = [];
async function table(name, columns = "*") {
  const result = await supabase.from(name).select(columns).limit(1000);
  if (result.error) { failures.push(`${name}: ${result.error.message}`); return []; }
  return result.data || [];
}

const expected = ["users", "standards", "recommendations", "recommendation_standards", "related_standards", "evidence", "documents", "audit_events"];
const standards = await table("standards", "id,is_number,title,category,status,source_reference,validation_date,search_text");
const relations = await table("related_standards", "id,source_standard_id,related_standard_id,relationship_type,source_reference");
const evidence = await table("evidence", "id,standard_id,recommendation_id,source_reference,evidence_text");
const recommendations = await table("recommendations", "id");
const users = await table("users", "id");
const categorySet = new Set(standards.map((row) => row.category));
for (const required of ["Domestic kitchenware", "Electrical accessories", "Industrial/general hardware and plumbing components", "Vehicle components/accessories"]) if (!categorySet.has(required)) failures.push(`missing pilot category: ${required}`);
const numbers = standards.map((row) => row.is_number);
if (new Set(numbers).size !== numbers.length) failures.push("duplicate IS numbers");
for (const row of standards) {
  if (!row.title || !row.is_number || !row.source_reference || !row.search_text) failures.push(`incomplete standard: ${row.id}`);
  if (!row.validation_date) failures.push(`missing validation date: ${row.is_number}`);
  if (!['CURRENT','SUPERSEDED','WITHDRAWN','UNDER_REVIEW','UNKNOWN'].includes(row.status)) failures.push(`invalid status: ${row.is_number}`);
}
for (const row of relations) if (!row.source_reference) failures.push(`relationship without provenance: ${row.id}`);
for (const row of evidence) if (!row.source_reference || !row.evidence_text) failures.push(`incomplete evidence: ${row.id}`);
const standardIds = new Set(standards.map((row) => row.id));
const recommendationIds = new Set(recommendations.map((row) => row.id));
const userIds = new Set(users.map((row) => row.id));
for (const row of relations) if (!standardIds.has(row.source_standard_id) || !standardIds.has(row.related_standard_id)) failures.push(`orphan relationship: ${row.id}`);
for (const row of evidence) if ((row.standard_id && !standardIds.has(row.standard_id)) || (row.recommendation_id && !recommendationIds.has(row.recommendation_id))) failures.push(`orphan evidence: ${row.id}`);
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checkedTables: expected, standards: standards.length, relationships: relations.length, evidence: evidence.length, recommendations: recommendations.length, users: users.length, orphanRelationships: relations.filter((row) => !standardIds.has(row.source_standard_id) || !standardIds.has(row.related_standard_id)).length, orphanEvidence: evidence.filter((row) => (row.standard_id && !standardIds.has(row.standard_id)) || (row.recommendation_id && !recommendationIds.has(row.recommendation_id))).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
