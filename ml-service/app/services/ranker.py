"""
NormWise Ranking Service Layer
==============================
Provides ranker implementations and candidate text formatting for cross-encoder reranking.
"""
import os
import logging
from abc import ABC, abstractmethod
from typing import List

from app.schemas.rerank import Candidate, RankedCandidate
from app.models.reranker import BGERerankerModel, MODEL_NAME

logger = logging.getLogger("normwise.ml.ranker")


def format_candidate_text(candidate: Candidate) -> str:
    """
    Construct text representation of a candidate standard for cross-encoder scoring.
    Format: "{standard_number} — {title}. {description}"
    """
    parts = [f"{candidate.standard_number} — {candidate.title}"]
    if candidate.description and candidate.description.strip():
        parts.append(candidate.description.strip())
    return ". ".join(parts)


class Ranker(ABC):
    """Abstract base class for all standard rankers."""

    @abstractmethod
    def rerank(self, query: str, candidates: List[Candidate], top_k: int) -> List[RankedCandidate]:
        """Rerank candidate standards given a query. Returns top_k results."""
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Identifier name of this ranker."""
        ...

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Underlying model name or identifier."""
        ...


class BGERanker(Ranker):
    """
    Cross-encoder reranker using BAAI/bge-reranker-v2-m3.
    Scores (query, candidate_text) pairs and returns candidates sorted by relevance.
    """

    def __init__(self, model_instance: BGERerankerModel = None):
        self._model = model_instance or BGERerankerModel.get_instance()

    @property
    def name(self) -> str:
        return "bge-reranker-v2-m3"

    @property
    def model_name(self) -> str:
        return self._model.model_name

    def rerank(self, query: str, candidates: List[Candidate], top_k: int) -> List[RankedCandidate]:
        if not candidates:
            return []

        # Construct pairs for cross-encoder inference
        pairs = [
            (query, format_candidate_text(candidate))
            for candidate in candidates
        ]

        # Compute sigmoid-normalized relevance scores in [0.0, 1.0]
        scores = self._model.predict_scores(pairs, apply_sigmoid=True)

        # Pair candidates with their computed scores
        scored_candidates = []
        for candidate, score in zip(candidates, scores):
            scored_candidates.append({
                "candidate": candidate,
                "score": float(score),
            })

        # Sort descending by relevance score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)

        # Format top_k results
        results = []
        for rank_idx, item in enumerate(scored_candidates[:top_k], start=1):
            c = item["candidate"]
            results.append(
                RankedCandidate(
                    id=c.id,
                    standard_number=c.standard_number,
                    title=c.title,
                    rerank_score=round(item["score"], 6),
                    rank=rank_idx,
                    ranker=self.name,
                )
            )

        return results


class PassthroughRanker(Ranker):
    """
    Passthrough baseline ranker — returns candidates sorted by initial_score.
    Used for testing or baseline comparisons.
    """

    @property
    def name(self) -> str:
        return "passthrough"

    @property
    def model_name(self) -> str:
        return "none"

    def rerank(self, query: str, candidates: List[Candidate], top_k: int) -> List[RankedCandidate]:
        sorted_candidates = sorted(
            candidates,
            key=lambda c: c.initial_score if c.initial_score is not None else 0.0,
            reverse=True,
        )
        return [
            RankedCandidate(
                id=c.id,
                standard_number=c.standard_number,
                title=c.title,
                rerank_score=round(float(c.initial_score if c.initial_score is not None else 0.0), 4),
                rank=i + 1,
                ranker=self.name,
            )
            for i, c in enumerate(sorted_candidates[:top_k])
        ]


def get_ranker(ranker_type: str = "bge-reranker-v2-m3") -> Ranker:
    """Factory function to get the requested ranker implementation."""
    ranker_key = (ranker_type or "").lower().strip()
    if ranker_key in ("passthrough", "baseline"):
        return PassthroughRanker()
    else:
        # Default to BGE Cross-Encoder Reranker
        return BGERanker()
