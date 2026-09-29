"""
NormWise Rerank API Router
==========================
Exposes POST /api/v1/rerank endpoint for ranking candidate standards against a procurement query.
"""
import os
import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.rerank import RerankRequest, RerankResponse
from app.services.ranker import get_ranker

logger = logging.getLogger("normwise.ml.api")

router = APIRouter()

ACTIVE_RANKER = os.getenv("RANKER", "bge-reranker-v2-m3")


@router.post("/rerank", response_model=RerankResponse, status_code=status.HTTP_200_OK)
async def rerank_standards(request: RerankRequest) -> RerankResponse:
    """
    Rerank candidate standards for a given procurement requirement using BGE Cross-Encoder.

    Parameters:
      - query: Normalized procurement requirement string (non-empty).
      - candidates: List of candidate standards (1 to 50 items).
      - top_k: Maximum number of top ranked candidates to return (1 to 50).

    Returns:
      - results: Candidates ordered by descending relevance score with 1-based ranks.
      - ranker_used: Identifier of the ranker applied.
      - model_name: Name of the underlying cross-encoder model.
    """
    try:
        ranker = get_ranker(ACTIVE_RANKER)
        ranked_candidates = ranker.rerank(
            query=request.query,
            candidates=request.candidates,
            top_k=request.top_k,
        )

        return RerankResponse(
            query=request.query,
            results=ranked_candidates,
            ranker_used=ranker.name,
            model_name=ranker.model_name,
            note=f"Reranked {len(request.candidates)} candidate(s) to top {len(ranked_candidates)} result(s).",
        )
    except RuntimeError as e:
        logger.error(f"Reranking error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute standard relevance scores. Please try again later.",
        )
    except Exception as e:
        logger.error(f"Unexpected error during rerank request: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while processing the reranking request.",
        )
