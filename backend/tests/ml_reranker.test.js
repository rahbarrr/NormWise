/**
 * NormWise Backend ML Reranker Integration Test Suite
 * ====================================================
 * Tests:
 * 1. ML service successfully reranks candidates (mocked API).
 * 2. Backend sends correct request shape (query, mapped candidates, top_k).
 * 3. Top 20 candidates are sent to ML service (capped properly).
 * 4. ML results are correctly mapped back to candidate standard objects.
 * 5. Top 5 reranked results are returned.
 * 6. ML service timeout triggers fallback.
 * 7. ML service HTTP 500 triggers fallback.
 * 8. Invalid ML response payload triggers fallback.
 * 9. Recommendation flow completes and returns valid recommendation when ML service is offline.
 * 10. End-to-end recommend() pipeline with ML reranking updates primary recommendation.
 *
 * Uses mocked fetch to prevent downloading or loading the 2+ GB model in Node tests.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  rerankCandidates,
  mapCandidateToMlSchema,
  checkMlServiceHealth,
} from "../src/services/ranking/mlRankerClient.js";
import { createSprint2Recommendation } from "../src/services/recommendation/sprint2RecommendationService.js";

describe("ML Reranker Client & Integration Suite", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Candidate Mapping Tests
  // ─────────────────────────────────────────────────────────────────────────
  it("should correctly map backend standard fields to ML candidate schema", () => {
    // Prisma format
    const prismaCandidate = {
      id: "std-001",
      standardNumber: "IS 2347:2023",
      title: "Domestic and Commercial Pressure Cookers",
      scope: "Specification for closed pressure cookers",
      score: 0.88,
    };
    const mappedPrisma = mapCandidateToMlSchema(prismaCandidate);
    assert.equal(mappedPrisma.id, "std-001");
    assert.equal(mappedPrisma.standard_number, "IS 2347:2023");
    assert.equal(mappedPrisma.title, "Domestic and Commercial Pressure Cookers");
    assert.equal(mappedPrisma.description, "Specification for closed pressure cookers");
    assert.equal(mappedPrisma.initial_score, 0.88);

    // Supabase format
    const supabaseCandidate = {
      id: "uuid-123",
      is_number: "IS 10322 (Part 5/Sec 3):2012",
      title: "Luminaires for Road and Street Lighting",
      description: "Safety and performance requirements",
      initial_score: 0.75,
    };
    const mappedSupabase = mapCandidateToMlSchema(supabaseCandidate);
    assert.equal(mappedSupabase.id, "uuid-123");
    assert.equal(mappedSupabase.standard_number, "IS 10322 (Part 5/Sec 3):2012");
    assert.equal(mappedSupabase.title, "Luminaires for Road and Street Lighting");
    assert.equal(mappedSupabase.description, "Safety and performance requirements");
    assert.equal(mappedSupabase.initial_score, 0.75);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Successful Reranking & Request Shape Verification
  // ─────────────────────────────────────────────────────────────────────────
  it("should send correct request shape and return top-5 reranked candidates on success", async () => {
    let capturedUrl = null;
    let capturedBody = null;

    const mockCandidates = [
      { id: "c1", standardNumber: "IS 6911:2017", title: "SS Plate", description: "Plate spec", score: 0.90 },
      { id: "c2", standardNumber: "IS 2347:2023", title: "Pressure Cookers", description: "Cooker spec", score: 0.70 },
      { id: "c3", standardNumber: "IS 10322:2012", title: "Street Lights", description: "Light spec", score: 0.50 },
    ];

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedBody = JSON.parse(options.body);

      return {
        ok: true,
        status: 200,
        json: async () => ({
          query: capturedBody.query,
          results: [
            {
              id: "c2",
              standard_number: "IS 2347:2023",
              title: "Pressure Cookers",
              rerank_score: 0.7245,
              rank: 1,
              ranker: "bge-reranker-v2-m3",
            },
            {
              id: "c1",
              standard_number: "IS 6911:2017",
              title: "SS Plate",
              rerank_score: 0.5102,
              rank: 2,
              ranker: "bge-reranker-v2-m3",
            },
          ],
          ranker_used: "bge-reranker-v2-m3",
          model_name: "BAAI/bge-reranker-v2-m3",
        }),
      };
    };

    const result = await rerankCandidates("stainless steel pressure cooker", mockCandidates, { topK: 5 });

    assert.equal(result.success, true);
    assert.equal(result.fallback, false);
    assert.equal(result.ranker_used, "bge-reranker-v2-m3");
    assert.equal(result.model_name, "BAAI/bge-reranker-v2-m3");

    // Verify request shape
    assert.ok(capturedUrl.includes("/api/v1/rerank"));
    assert.equal(capturedBody.query, "stainless steel pressure cooker");
    assert.equal(capturedBody.candidates.length, 3);
    assert.equal(capturedBody.candidates[0].standard_number, "IS 6911:2017");
    assert.equal(capturedBody.candidates[1].standard_number, "IS 2347:2023");

    // Verify rerank re-ordering (IS 2347 became rank 1 over IS 6911)
    assert.equal(result.results.length, 2);
    assert.equal(result.results[0].standardNumber, "IS 2347:2023");
    assert.equal(result.results[0].rerankScore, 0.7245);
    assert.equal(result.results[0].mlRank, 1);
    assert.equal(result.results[1].standardNumber, "IS 6911:2017");
    assert.equal(result.results[1].rerankScore, 0.5102);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Top 20 Candidates Capped Correctly
  // ─────────────────────────────────────────────────────────────────────────
  it("should cap candidates sent to ML service at maximum 20 candidates", async () => {
    let sentCandidateCount = 0;

    const manyCandidates = Array.from({ length: 35 }, (_, i) => ({
      id: `c-${i}`,
      standardNumber: `IS ${1000 + i}:2020`,
      title: `Standard Title ${i}`,
      description: `Description ${i}`,
      score: 0.9 - i * 0.02,
    }));

    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      sentCandidateCount = body.candidates.length;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          query: body.query,
          results: body.candidates.slice(0, 5).map((c, idx) => ({
            id: c.id,
            standard_number: c.standard_number,
            title: c.title,
            rerank_score: 0.8 - idx * 0.05,
            rank: idx + 1,
            ranker: "bge-reranker-v2-m3",
          })),
          ranker_used: "bge-reranker-v2-m3",
          model_name: "BAAI/bge-reranker-v2-m3",
        }),
      };
    };

    const result = await rerankCandidates("procurement query", manyCandidates, { topK: 5 });

    assert.equal(sentCandidateCount, 20, "Should only send top 20 candidates to BGE");
    assert.equal(result.results.length, 5, "Should return top 5 reranked");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Fallback on ML Timeout
  // ─────────────────────────────────────────────────────────────────────────
  it("should activate fallback gracefully when ML service request times out", async () => {
    const mockCandidates = [
      { id: "c1", standardNumber: "IS 2347:2023", title: "Pressure Cookers", score: 0.85 },
      { id: "c2", standardNumber: "IS 6911:2017", title: "SS Plate", score: 0.65 },
    ];

    globalThis.fetch = async () => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      throw error;
    };

    const result = await rerankCandidates("stainless steel pressure cooker", mockCandidates, {
      topK: 5,
      timeoutMs: 50,
    });

    assert.equal(result.success, false);
    assert.equal(result.fallback, true);
    assert.equal(result.ranker_used, "retrieval-fallback");
    assert.ok(result.error.includes("timed out") || result.error.includes("aborted"));
    // Verify candidates are preserved in initial score order
    assert.equal(result.results.length, 2);
    assert.equal(result.results[0].standardNumber, "IS 2347:2023");
    assert.equal(result.results[1].standardNumber, "IS 6911:2017");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Fallback on ML HTTP 500 Error
  // ─────────────────────────────────────────────────────────────────────────
  it("should activate fallback gracefully when ML service returns HTTP 500 Internal Error", async () => {
    const mockCandidates = [
      { id: "c1", standardNumber: "IS 2347:2023", title: "Pressure Cookers", score: 0.85 },
    ];

    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error: Out of memory",
    });

    const result = await rerankCandidates("stainless steel pressure cooker", mockCandidates, { topK: 5 });

    assert.equal(result.success, false);
    assert.equal(result.fallback, true);
    assert.equal(result.ranker_used, "retrieval-fallback");
    assert.ok(result.error.includes("HTTP 500"));
    assert.equal(result.results[0].standardNumber, "IS 2347:2023");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Fallback on Invalid JSON Payload
  // ─────────────────────────────────────────────────────────────────────────
  it("should activate fallback gracefully when ML service returns invalid response structure", async () => {
    const mockCandidates = [
      { id: "c1", standardNumber: "IS 2347:2023", title: "Pressure Cookers", score: 0.85 },
    ];

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ unexpected_payload: true }), // Missing 'results' array
    });

    const result = await rerankCandidates("stainless steel pressure cooker", mockCandidates, { topK: 5 });

    assert.equal(result.success, false);
    assert.equal(result.fallback, true);
    assert.equal(result.ranker_used, "retrieval-fallback");
    assert.equal(result.results.length, 1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Health Check Probe
  // ─────────────────────────────────────────────────────────────────────────
  it("should check ML service health endpoint correctly", async () => {
    globalThis.fetch = async (url) => {
      if (url.endsWith("/health")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "ok", service: "normwise-ml-reranker" }),
        };
      }
      return { ok: false, status: 404 };
    };

    const health = await checkMlServiceHealth("http://localhost:8000");
    assert.equal(health.isHealthy, true);
    assert.equal(health.status, "ok");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. End-to-End Pipeline Integration with Mocked ML Reranker
  // ─────────────────────────────────────────────────────────────────────────
  it("should execute createSprint2Recommendation with ML reranker and attach ranking_method", async () => {
    globalThis.fetch = async (url, options) => {
      if (url.includes("/api/v1/rerank")) {
        const body = JSON.parse(options.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            query: body.query,
            results: [
              {
                id: body.candidates[0]?.id || "1",
                standard_number: body.candidates[0]?.standard_number || "IS 2347:2023",
                title: body.candidates[0]?.title || "Pressure Cooker",
                rerank_score: 0.824,
                rank: 1,
                ranker: "bge-reranker-v2-m3",
              },
            ],
            ranker_used: "bge-reranker-v2-m3",
            model_name: "BAAI/bge-reranker-v2-m3",
          }),
        };
      }
      return originalFetch(url, options);
    };

    const res = await createSprint2Recommendation("stainless steel pressure cooker 5L");
    assert.ok(res.recommendation_id);
    assert.equal(res.ranking_method, "bge-reranker-v2-m3");
    assert.ok(res.primary_standard);
    assert.equal(res.primary_standard.is_number, "IS 2347:2023");
  });
});
