import supabase from "../../config/supabase.js";
import { searchStandards, getRelatedStandards, getEvidence } from "../../repositories/sprint1Repository.js";
import { rerankCandidates } from "../ranking/mlRankerClient.js";

const weights = { product: 0.30, material: 0.20, application: 0.20, title: 0.15, scope: 0.10, technical: 0.05 };
const stopWords = new Set(["a", "an", "and", "for", "in", "of", "the", "to", "up", "with"]);

export function normalizeRequirement(query) {
  return String(query || "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function extractAttributes(query) {
  const text = normalizeRequirement(query);
  const product = /pressure cooker|cookware|utensil|kitchen appliance/.exec(text)?.[0] || /led street light|street light|road luminaire|luminaire|led|lamp/.exec(text)?.[0] || /cable|electrical accessory/.exec(text)?.[0] || /bolt|nut|pipe|tube|fitting|plumbing/.exec(text)?.[0] || /vehicle|rim|windscreen|safety glass/.exec(text)?.[0] || null;
  const material = /stainless steel|steel|pvc|cpvc|glass|alumin(?:ium|um)|alloy/.exec(text)?.[0] || null;
  const application = /low voltage installation|water supply|plumbing|municipal highway|municipal road|street lighting|road lighting|campus lighting|domestic kitchenware|road transport|vehicle component|industrial hardware/.exec(text)?.[0] || null;
  const technicalAttributes = {};
  const voltage = text.match(/\b(?:up to|rated voltage|voltage)\s*(?:and including)?\s*(\d{2,4})\s*v\b/);
  if (voltage) technicalAttributes.voltage = `${voltage[1]} V`;
  return { product, material, application, technicalAttributes };
}

function terms(text) {
  return normalizeRequirement(text).split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !stopWords.has(term));
}

export function rankCandidates(query, candidates, attributes) {
  const queryTerms = terms(query);
  return candidates.map((standard) => {
    const scoreField = (value) => {
      const fieldTerms = terms(value || "");
      if (!fieldTerms.length) return 0;
      return queryTerms.filter((term) => fieldTerms.includes(term)).length / Math.max(1, queryTerms.length);
    };
    const product = attributes.product && String(standard.product || "").toLowerCase().includes(attributes.product) ? 1 : scoreField(standard.product);
    const material = attributes.material && String(standard.material || "").toLowerCase().includes(attributes.material) ? 1 : scoreField(standard.material);
    const application = attributes.application && String(standard.application || "").toLowerCase().includes(attributes.application) ? 1 : scoreField(standard.application);
    const score = Number((weights.product * product + weights.material * material + weights.application * application + weights.title * scoreField(standard.title) + weights.scope * scoreField(standard.scope) + weights.technical * scoreField(JSON.stringify(standard.technical_attributes))).toFixed(6));
    return { standard, score, matchedFields: { product, material, application, title: scoreField(standard.title), scope: scoreField(standard.scope) } };
  }).sort((a, b) => b.score - a.score || a.standard.is_number.localeCompare(b.standard.is_number));
}

function check(result) { if (result.error) throw result.error; return result.data; }

export async function createSprint2Recommendation(query, { documentId = null, userId = null } = {}) {
  const normalizedQuery = normalizeRequirement(query);
  if (normalizedQuery.length < 5) { const error = new Error("query must contain at least 5 characters"); error.statusCode = 400; throw error; }
  const attributes = extractAttributes(normalizedQuery);
  // Retrieve broadly by normalized text, then let the transparent ranker combine extracted attributes.
  const candidates = await searchStandards(normalizedQuery, { limit: 20 });
  const initialRanked = rankCandidates(normalizedQuery, candidates, attributes);

  // Retrieve with transparent metadata scoring, then use the BGE cross-encoder
  // as the semantic reranker. If the ML service is unavailable, the client
  // returns the deterministic ranking with an explicit fallback marker.
  const mlResult = await rerankCandidates(normalizedQuery, initialRanked.map(({ standard, score, matchedFields }) => ({
    ...standard,
    score,
    matchedFields,
  })));
  const initialById = new Map(initialRanked.map((item) => [String(item.standard.id), item]));
  const ranked = (mlResult.results || []).map((candidate) => {
    const original = initialById.get(String(candidate.id)) || initialById.get(String(candidate.standardId));
    const metadataScore = Number(original?.score || candidate.score || 0);
    const semanticScore = Number(candidate.rerankScore || 0);
    const blendedScore = mlResult.fallback
      ? metadataScore
      : Number((metadataScore * 0.35 + semanticScore * 0.65).toFixed(6));
    return {
      standard: original?.standard || candidate,
      score: blendedScore,
      matchedFields: original?.matchedFields || candidate.matchedFields || {},
      semanticScore,
      initialScore: metadataScore,
      mlRank: candidate.mlRank || null,
    };
  }).sort((a, b) => b.score - a.score || String(a.standard.is_number || "").localeCompare(String(b.standard.is_number || "")));
  const rankingMethod = mlResult.fallback ? "weighted_metadata_v1_fallback" : "bge-reranker-v2-m3";

  const current = ranked.filter(({ standard }) => standard.status === "CURRENT");
  const rankedPrimary = current[0] || null;
  const score = rankedPrimary ? rankedPrimary.score : 0;
  const primary = score >= 0.20 ? rankedPrimary : null;
  const related = primary ? await getRelatedStandards(primary.standard.id) : [];
  const evidence = primary ? await getEvidence({ standardId: primary.standard.id }) : [];
  const state = !primary || score < 0.20 ? "no_confident_match" : (score >= 0.55 && evidence.length && !mlResult.fallback ? "high_confidence" : "review_required");
  const recommendation = check(await supabase.from("recommendations").insert({
    user_id: userId || null,
    query_text: query,
    document_id: documentId || null,
    primary_standard_id: primary?.standard.id || null,
    confidence: score,
    review_state: state,
    status: primary ? "PENDING" : "NO_MATCH",
    certification_summary: primary?.standard.certification || "unknown / requires verification",
  }).select("*").single());
  if (ranked.length) {
    check(await supabase.from("recommendation_standards").insert(ranked.slice(0, 10).map(({ standard, score: rankScore }, index) => ({ recommendation_id: recommendation.id, standard_id: standard.id, rank: index + 1, score: rankScore, is_primary: primary?.standard.id === standard.id, ranking_method: rankingMethod }))));
  }
  check(await supabase.from("audit_events").insert({ user_id: userId || null, recommendation_id: recommendation.id, event_type: "recommendation_created", event_data: { ranking_method: rankingMethod, ml_service: { used: !mlResult.fallback, ranker: mlResult.ranker_used, model: mlResult.model_name, error: mlResult.error || null }, candidate_count: ranked.length, state } }));
  return { recommendation_id: recommendation.id, query, normalized_query: normalizedQuery, extracted: attributes, primary_standard: primary ? { ...primary.standard, certification: primary.standard.certification || "unknown / requires verification" } : null, related_standards: related, evidence, candidates: ranked.slice(0, 10).map(({ standard, score: candidateScore, matchedFields, semanticScore, initialScore, mlRank }) => ({ ...standard, score: candidateScore, initial_score: initialScore, semantic_score: semanticScore, ml_rank: mlRank, matched_fields: matchedFields })), confidence: { score, state }, review: { required: state !== "high_confidence", state }, ranking_method: rankingMethod, pipeline: { extraction: "document_text_or_requirement_text", retrieval: "supabase_standards_lexical", reranking: mlResult.fallback ? "deterministic_fallback" : "BAAI/bge-reranker-v2-m3", evidence_validation: "supabase_evidence_and_relationships" } };
}
