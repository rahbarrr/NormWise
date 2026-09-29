import supabase from "../config/supabase.js";

function check(result) {
  if (result.error) throw result.error;
  return result.data;
}

export async function getStandard(id) {
  return check(await supabase.from("standards").select("*").eq("id", id).maybeSingle());
}

export async function searchStandards(query, { limit = 20, category, product, material, application } = {}) {
  let request = supabase.from("standards").select("*").limit(1000);
  const stopWords = new Set(["a", "an", "and", "for", "in", "of", "the", "to", "up"]);
  const terms = String(query || "").trim().split(/\s+/).map((term) => term.toLowerCase()).filter((term) => term && !stopWords.has(term));
  if (category) request = request.eq("category", category);
  if (product) request = request.ilike("product", `%${product}%`);
  if (material) request = request.ilike("material", `%${material}%`);
  if (application) request = request.ilike("application", `%${application}%`);
  const rows = check(await request.order("is_number"));
  if (!terms.length) return rows.slice(0, limit);
  const scored = rows.map((row) => {
    const haystack = [row.is_number, row.title, row.scope, row.product, row.material, row.application, row.search_text].filter(Boolean).join(" ").toLowerCase();
    const matchedTerms = terms.filter((term) => haystack.includes(term.toLowerCase()));
    return { row, score: matchedTerms.length, matchedTerms };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.row.is_number.localeCompare(b.row.is_number));
  return scored.slice(0, limit).map(({ row, matchedTerms }) => ({ ...row, matching_fields: matchedTerms }));
}

export async function getRelatedStandards(standardId) {
  return check(await supabase.from("related_standards").select("*, related:related_standard_id(*)").eq("source_standard_id", standardId));
}

export async function getEvidence({ standardId, recommendationId } = {}) {
  let request = supabase.from("evidence").select("*");
  if (standardId) request = request.eq("standard_id", standardId);
  if (recommendationId) request = request.eq("recommendation_id", recommendationId);
  return check(await request.order("created_at"));
}

export const getStandardsByProduct = (product, options = {}) => searchStandards(product, { ...options, product });
export const getStandardsByMaterial = (material, options = {}) => searchStandards(material, { ...options, material });
export const getStandardsByApplication = (application, options = {}) => searchStandards(application, { ...options, application });
