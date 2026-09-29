"""
NormWise Local Reranker Real Model Smoke Test
=============================================
Directly tests BAAI/bge-reranker-v2-m3 model loading, inference, score generation,
sorting order, and top_k extraction using the real sentence_transformers CrossEncoder.

Note: DO NOT hardcode that any specific candidate MUST rank first.
This smoke test verifies structural correctness and inference functionality.
"""
import sys
import os

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.models.reranker import BGERerankerModel, MODEL_NAME
from app.schemas.rerank import Candidate
from app.services.ranker import BGERanker


def main():
    print(f"=== NormWise Real BGE Model Smoke Test ===")
    print(f"Target Model: {MODEL_NAME}")

    # 1. Initialize model wrapper
    model_wrapper = BGERerankerModel.get_instance()
    print(f"Compute device resolved: {model_wrapper.device}")
    print("Loading model weights into memory...")
    model_wrapper.load()
    print(f"Model loaded: {model_wrapper.is_loaded}")
    assert model_wrapper.is_loaded, "Model must report is_loaded=True after load()."

    # 2. Prepare test query and candidates
    query = "5 litre stainless steel pressure cooker for institutional kitchen"

    candidates = [
        Candidate(
            id="cand-1",
            standard_number="IS 2347:2023",
            title="Domestic Pressure Cookers - Specification",
            description="Requirements for construction, safety devices, and testing of pressure cookers.",
        ),
        Candidate(
            id="cand-2",
            standard_number="IS 14756:2022",
            title="Stainless Steel Cookware - Specification",
            description="Requirements for domestic and commercial stainless steel cooking utensils.",
        ),
        Candidate(
            id="cand-3",
            standard_number="IS 10322 (Part 5/Sec 3):2012",
            title="Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
            description="Safety and performance requirements for electrical roadway LED lighting.",
        ),
    ]

    print(f"\nQuery: '{query}'")
    print(f"Candidates ({len(candidates)} total):")
    for c in candidates:
        print(f"  - [{c.standard_number}] {c.title}")

    # 3. Test Ranker service with top_k=2
    ranker = BGERanker(model_instance=model_wrapper)
    top_k = 2
    results = ranker.rerank(query=query, candidates=candidates, top_k=top_k)

    print(f"\nReranked Results (top_k={top_k}):")
    for res in results:
        print(f"  Rank {res.rank}: [{res.standard_number}] Score: {res.rerank_score:.6f} - {res.title}")

    # 4. Smoke test assertions
    # (a) Verify top_k constraint
    assert len(results) == top_k, f"Expected {top_k} results, got {len(results)}"

    # (b) Verify ranks are 1-based and sequential
    for i, res in enumerate(results, start=1):
        assert res.rank == i, f"Expected rank {i}, got {res.rank}"
        assert 0.0 <= res.rerank_score <= 1.0, f"Score {res.rerank_score} out of bounds [0.0, 1.0]"
        assert res.ranker == "bge-reranker-v2-m3"

    # (c) Verify output is strictly sorted in descending order of score
    scores = [r.rerank_score for r in results]
    assert scores == sorted(scores, reverse=True), "Results must be sorted descending by rerank_score."

    # 5. Verify all candidates scoring when top_k equals candidate count
    all_results = ranker.rerank(query=query, candidates=candidates, top_k=len(candidates))
    assert len(all_results) == len(candidates), "All candidates must be scored."
    all_scores = [r.rerank_score for r in all_results]
    assert all_scores == sorted(all_scores, reverse=True), "Full candidate list must be sorted descending."

    print("\n[SUCCESS] Smoke test PASSED: Model loading, inference, scoring, sorting, and top_k verified.")


if __name__ == "__main__":
    main()