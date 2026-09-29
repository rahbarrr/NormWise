import { searchStandards } from "../../repositories/sprint1Repository.js";

export async function retrieveSprint1Candidates(query, options = {}) {
  const normalizedQuery = String(query || "").toLowerCase().replace(/[^a-z0-9:./ -]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalizedQuery) return { query, normalizedQuery, candidates: [] };
  const candidates = await searchStandards(normalizedQuery, options);
  return { query, normalizedQuery, candidates };
}
