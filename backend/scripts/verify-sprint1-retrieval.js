import { retrieveSprint1Candidates } from "../src/services/retrieval/sprint1CandidateRetrieval.js";

const queries = [
  "stainless steel pressure cooker",
  "electrical accessory for low voltage installation",
  "steel nuts and bolts",
  "PVC pipe for water supply",
  "vehicle component specification",
];
const results = [];
for (const query of queries) {
  const result = await retrieveSprint1Candidates(query, { limit: 5 });
  results.push({ query, candidates: result.candidates.map((candidate) => ({
    is_number: candidate.is_number,
    title: candidate.title,
    product: candidate.product,
    material: candidate.material,
    application: candidate.application,
    status: candidate.status,
    source_reference: candidate.source_reference,
    matched_fields: candidate.matching_fields || [],
  })) });
}
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.candidates.length === 0)) process.exitCode = 1;
