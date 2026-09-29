/**
 * NormWise ML Reranker Client
 * ===========================
 * Connects the Node.js backend recommendation pipeline to the FastAPI
 * ML service (running BAAI/bge-reranker-v2-m3 cross-encoder).
 *
 * Architecture:
 *   Requirement -> Retrieval (Top 20) -> ML Client (POST /api/v1/rerank) -> Top 5 Reranked
 *
 * Resilience & Fallback:
 *   If the ML service is unreachable, times out, or returns a 5xx error,
 *   the client activates graceful fallback to the backend's existing
 *   retrieval ranking without crashing the recommendation request.
 */
import env from "../../config/env.js";
import { ML_RERANKER_CONFIG } from "../../config/recommendationConfig.js";

/**
 * Maps any backend candidate standard (Prisma ORM or Supabase format)
 * to the FastAPI ML service Candidate schema.
 *
 * @param {Object} candidate - Candidate standard from retrieval/ranking
 * @returns {Object} Mapped candidate object for FastAPI RerankRequest
 */
export function mapCandidateToMlSchema(candidate) {
  if (!candidate) return null;

  const id = String(candidate.id || candidate.standardId || "");
  const standardNumber = String(
    candidate.standardNumber ||
    candidate.standard_number ||
    candidate.is_number ||
    ""
  ).trim();
  const title = String(candidate.title || "").trim();
  const description = String(
    candidate.description ||
    candidate.scope ||
    ""
  ).trim();

  const initialScore =
    typeof candidate.score === "number"
      ? candidate.score
      : typeof candidate.initial_score === "number"
      ? candidate.initial_score
      : typeof candidate.matchScore === "number"
      ? candidate.matchScore
      : null;

  return {
    id: id || standardNumber || "candidate-unknown",
    standard_number: standardNumber || "Unknown Standard",
    title: title || "Untitled Standard",
    description: description || null,
    initial_score: initialScore != null ? Number(initialScore.toFixed(4)) : null,
  };
}

/**
 * Calls the FastAPI ML service to rerank candidate standards using BGE cross-encoder.
 *
 * @param {string} query - Normalized procurement requirement text
 * @param {Array<Object>} candidates - List of candidate standards from retrieval (up to 20)
 * @param {Object} [options] - Options for the rerank request
 * @param {number} [options.topK=5] - Number of top results to return
 * @param {number} [options.timeoutMs=5000] - Request timeout in milliseconds
 * @param {string} [options.serviceUrl] - Override ML service base URL
 * @returns {Promise<Object>} Rerank result with { success, fallback, ranker_used, model_name, results, error }
 */
export async function rerankCandidates(query, candidates = [], options = {}) {
  const topK = options.topK || ML_RERANKER_CONFIG.RERANK_TOP_K || env.ML_RERANK_TOP_K || 5;
  const timeoutMs = options.timeoutMs || ML_RERANKER_CONFIG.TIMEOUT_MS || env.ML_SERVICE_TIMEOUT_MS || 10000;
  const serviceUrl = (options.serviceUrl || ML_RERANKER_CONFIG.DEFAULT_URL || env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");


  // Fast return for empty candidates
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return {
      success: true,
      fallback: false,
      ranker_used: "bge-reranker-v2-m3",
      model_name: "BAAI/bge-reranker-v2-m3",
      results: [],
    };
  }

  // Cap candidates sent to BGE (FastAPI max_length is 50, standard retrieval pipeline sends top 20)
  const maxCandidates = Math.min(candidates.length, ML_RERANKER_CONFIG.RETRIEVAL_TOP_K || 20);
  const candidatesToSend = candidates.slice(0, maxCandidates);

  // Map candidates to ML API format
  const mappedCandidates = candidatesToSend
    .map(mapCandidateToMlSchema)
    .filter(Boolean);

  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    console.warn("[MLRankerClient] Empty query provided for reranking. Returning unranked candidates.");
    return createFallbackResponse(candidatesToSend, topK, "Empty query provided");
  }

  const endpoint = `${serviceUrl}/api/v1/rerank`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const requestBody = {
    query: cleanQuery,
    candidates: mappedCandidates,
    top_k: Math.min(topK, mappedCandidates.length),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const errorMsg = `ML service returned HTTP ${response.status}: ${errorText.slice(0, 200)}`;
      console.warn(`[MLRankerClient] ML reranker service failed (${errorMsg}). Activating fallback to retrieval ranking.`);
      return createFallbackResponse(candidatesToSend, topK, errorMsg);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results)) {
      const errorMsg = "Invalid response structure received from ML reranker service";
      console.warn(`[MLRankerClient] ${errorMsg}. Activating fallback to retrieval ranking.`);
      return createFallbackResponse(candidatesToSend, topK, errorMsg);
    }

    // Map reranked results back to original candidate objects, preserving full metadata
    const candidateMapById = new Map();
    for (const c of candidatesToSend) {
      const cId = String(c.id || c.standardId || "");
      const stdNum = String(c.standardNumber || c.standard_number || c.is_number || "").trim();
      if (cId) candidateMapById.set(cId, c);
      if (stdNum) candidateMapById.set(stdNum, c);
    }

    const reorderedCandidates = [];
    for (const rankedItem of data.results) {
      const matched =
        candidateMapById.get(String(rankedItem.id)) ||
        candidateMapById.get(String(rankedItem.standard_number)) ||
        null;

      if (matched) {
        reorderedCandidates.push({
          ...matched,
          rerankScore: rankedItem.rerank_score,
          mlRank: rankedItem.rank,
          rankerUsed: data.ranker_used || "bge-reranker-v2-m3",
          modelName: data.model_name || "BAAI/bge-reranker-v2-m3",
        });
      } else {
        // Construct standard candidate object if not found in map
        reorderedCandidates.push({
          id: rankedItem.id,
          standardId: rankedItem.id,
          standardNumber: rankedItem.standard_number,
          title: rankedItem.title,
          score: rankedItem.rerank_score,
          rerankScore: rankedItem.rerank_score,
          mlRank: rankedItem.rank,
          rankerUsed: data.ranker_used || "bge-reranker-v2-m3",
          modelName: data.model_name || "BAAI/bge-reranker-v2-m3",
        });
      }
    }

    return {
      success: true,
      fallback: false,
      ranker_used: data.ranker_used || "bge-reranker-v2-m3",
      model_name: data.model_name || "BAAI/bge-reranker-v2-m3",
      results: reorderedCandidates.slice(0, topK),
      raw_ml_results: data.results,
    };
  } catch (error) {
    clearTimeout(timer);

    const isTimeout = error.name === "AbortError";
    const errorMsg = isTimeout
      ? `ML service request timed out after ${timeoutMs}ms`
      : `ML service connection error: ${error.message}`;

    console.warn(`[MLRankerClient] ${errorMsg}. Activating fallback to retrieval ranking.`);
    return createFallbackResponse(candidatesToSend, topK, errorMsg);
  }
}

/**
 * Creates a structured fallback response using existing candidate retrieval scores.
 *
 * @param {Array<Object>} candidates - Original candidates from retrieval
 * @param {number} topK - Number of top candidates to return
 * @param {string} reason - Failure reason for internal logging
 * @returns {Object} Fallback response structure
 */
function createFallbackResponse(candidates, topK, reason) {
  const sorted = [...candidates].sort((a, b) => {
    const scoreA = typeof a.score === "number" ? a.score : 0;
    const scoreB = typeof b.score === "number" ? b.score : 0;
    return scoreB - scoreA;
  });

  const fallbackResults = sorted.slice(0, topK).map((c, index) => ({
    ...c,
    rerankScore: typeof c.score === "number" ? c.score : null,
    mlRank: index + 1,
    rankerUsed: "retrieval-fallback",
    modelName: "none",
  }));

  return {
    success: false,
    fallback: true,
    ranker_used: "retrieval-fallback",
    model_name: "none",
    results: fallbackResults,
    error: reason,
  };
}

/**
 * Health check probe for the ML microservice.
 *
 * @param {string} [customUrl] - Optional base URL override
 * @returns {Promise<Object>} { isHealthy: boolean, status: string, model: string }
 */
export async function checkMlServiceHealth(customUrl) {
  const serviceUrl = (customUrl || env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${serviceUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { isHealthy: false, status: `HTTP_${res.status}` };
    const data = await res.json();
    return { isHealthy: data.status === "ok", ...data };
  } catch (err) {
    clearTimeout(timer);
    return { isHealthy: false, status: "UNREACHABLE", error: err.message };
  }
}

export default {
  rerankCandidates,
  mapCandidateToMlSchema,
  checkMlServiceHealth,
};
