import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import supabase from "../src/config/supabase.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const standards = JSON.parse(await fs.readFile(path.join(root, "../../supabase/seed/pilot_standards.json"), "utf8"));
const enriched = standards.map((standard) => ({
  ...standard,
  search_text: [standard.is_number, standard.title, standard.scope, standard.product, standard.material, standard.application].filter(Boolean).join(" "),
}));

const { data, error } = await supabase.from("standards").upsert(enriched, { onConflict: "is_number" }).select("id,is_number");
if (error) throw error;
console.log(`Seeded ${data.length} verified standards through Supabase.`);

const byNumber = new Map(data.map((row) => [row.is_number, row.id]));
const relations = [
  { source_standard_id: byNumber.get("IS 694:2010"), related_standard_id: byNumber.get("IS 5831:1984"), relationship_type: "normative_reference", relationship_reason: "The BIS standard details page lists IS 5831:1984 as a referenced Indian Standard." , source_reference: "BIS Indian Standard Details for IS 694:2010", confidence: 1 },
  { source_standard_id: byNumber.get("IS 10694 (Part 2):2009"), related_standard_id: byNumber.get("IS 10694 (Part 1):2009"), relationship_type: "component", relationship_reason: "The BIS preview identifies Part 1 as a necessary adjunct to Part 2.", source_reference: "BIS preview SR10694_2", confidence: 1 },
  { source_standard_id: byNumber.get("IS 2347:2023"), related_standard_id: byNumber.get("IS 5522:2014"), relationship_type: "material", relationship_reason: "Stainless-steel sheet and strip is a supporting material standard for utensil and cooker-body procurement.", source_reference: "BIS catalog material mapping; verify against the applicable edition", confidence: 0.8 },
  { source_standard_id: byNumber.get("IS 2347:2023"), related_standard_id: byNumber.get("IS 7466:1994"), relationship_type: "component", relationship_reason: "The gasket is a pressure-cooker component that should be assessed alongside the cooker standard when included in scope.", source_reference: "BIS catalog component mapping; verify against the applicable edition", confidence: 0.8 },
  { source_standard_id: byNumber.get("IS 10322 (Part 5/Sec 3):2012"), related_standard_id: byNumber.get("IS 16103 (Part 1):2012"), relationship_type: "component", relationship_reason: "LED module/controlgear requirements can be relevant to a luminaire procurement package.", source_reference: "BIS catalog lighting component mapping; verify against the applicable edition", confidence: 0.75 },
].filter((relation) => relation.source_standard_id && relation.related_standard_id);
if (relations.length) {
  const relationResult = await supabase.from("related_standards").upsert(relations, { onConflict: "source_standard_id,related_standard_id,relationship_type" });
  if (relationResult.error) throw relationResult.error;
}
console.log(`Seeded ${relations.length} verified relationships. Unavailable referenced standards were left unresolved.`);

const evidenceRows = enriched.map((standard) => ({
  standard_id: byNumber.get(standard.is_number),
  source_type: "BIS_catalog_reference",
  source_reference: standard.source_reference,
  source_url: standard.source_url,
  evidence_type: "scope_and_identity",
  evidence_text: `BIS source record lists ${standard.is_number} with title ${standard.title}. Scope recorded in the catalog: ${standard.scope}`,
})).filter((row) => row.standard_id);
const existingEvidence = await supabase.from("evidence").select("standard_id,source_reference").in("standard_id", evidenceRows.map((row) => row.standard_id));
if (existingEvidence.error) throw existingEvidence.error;
const existingKeys = new Set((existingEvidence.data || []).map((row) => `${row.standard_id}|${row.source_reference}`));
const newEvidence = evidenceRows.filter((row) => !existingKeys.has(`${row.standard_id}|${row.source_reference}`));
if (newEvidence.length) {
  const evidenceResult = await supabase.from("evidence").insert(newEvidence);
  if (evidenceResult.error) throw evidenceResult.error;
}
console.log(`Seeded ${newEvidence.length} traceable evidence records.`);
