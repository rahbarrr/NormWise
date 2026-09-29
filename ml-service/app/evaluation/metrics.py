"""
NormWise Evaluation — Ranking Metrics
======================================
Computes ranking evaluation metrics for the BGE reranker baseline.

RELEVANCE THRESHOLD
-------------------
Throughout this module, a candidate is considered "relevant" if its ground-truth
label is >= 1 (i.e., partially relevant OR highly relevant). This is the documented
threshold for P@K and MRR.

Rationale: In procurement standards retrieval, surfacing a related standard (label 1)
in the top results is a useful outcome and should not be penalised as a failure.
The threshold can be changed via the `relevant_threshold` parameter on each function.

METRIC DEFINITIONS
------------------
P@1 (Precision at 1):
    Whether the top-ranked candidate (rank 1) is relevant (label >= threshold).
    Range: {0, 1} per query. Averaged across queries.
    Interpretation: probability that the system's first result is useful.

P@5 (Precision at 5):
    Proportion of the top-5 ranked candidates that are relevant (label >= threshold).
    P@5 = (# relevant in top-5) / min(5, total_candidates)
    Range: [0.0, 1.0] per query. Averaged across queries.
    Interpretation: proportion of the top-5 shortlist that is useful.

MRR (Mean Reciprocal Rank):
    MRR = average of 1/rank_of_first_relevant_candidate across queries.
    If no relevant candidate appears, the query contributes 0.
    Range: [0.0, 1.0]. Higher is better.
    Interpretation: how high the first relevant result appears on average.
    MRR=1.0 means rank 1 is always relevant. MRR=0.5 means rank 2 on average.
"""
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Dict

logger = logging.getLogger("normwise.evaluation.metrics")


@dataclass
class ScoredCandidate:
    """A candidate with its predicted rank and score alongside its ground-truth label."""
    candidate_id: str
    standard_number: str
    title: str
    predicted_rank: int          # 1-based rank assigned by the reranker
    predicted_score: float       # Sigmoid-normalized score from BGE
    ground_truth_label: int      # 0, 1, or 2


@dataclass
class QueryResult:
    """Evaluation result for a single query."""
    query_id: str
    query: str
    category: str
    difficulty: str
    ranked_candidates: List[ScoredCandidate]   # sorted by predicted_rank ascending
    p_at_1: float
    p_at_5: float
    reciprocal_rank: float  # 1/rank_of_first_relevant, or 0 if none found


@dataclass
class EvaluationSummary:
    """Aggregate evaluation summary across all queries."""
    num_queries: int
    num_candidate_pairs: int
    macro_p_at_1: float       # mean P@1 across queries
    macro_p_at_5: float       # mean P@5 across queries
    mrr: float                # mean reciprocal rank across queries
    relevant_threshold: int   # threshold used (label >= this = relevant)
    model_name: str
    evaluation_date: str
    per_query: List[QueryResult] = field(default_factory=list)
    failure_analysis: List[dict] = field(default_factory=list)


def compute_p_at_k(
    ranked_candidates: List[ScoredCandidate],
    k: int = 1,
    relevant_threshold: int = 1,
) -> float:
    """
    Compute Precision@K.

    Parameters
    ----------
    ranked_candidates : List[ScoredCandidate]
        Candidates sorted by predicted_rank (ascending, 1-based).
    k : int
        Number of top results to evaluate.
    relevant_threshold : int
        Minimum ground-truth label to be considered relevant.

    Returns
    -------
    float
        Proportion of top-k candidates that are relevant. Range [0.0, 1.0].
    """
    if not ranked_candidates:
        return 0.0

    top_k = ranked_candidates[:k]
    if not top_k:
        return 0.0

    num_relevant = sum(
        1 for c in top_k if c.ground_truth_label >= relevant_threshold
    )
    return num_relevant / len(top_k)


def compute_reciprocal_rank(
    ranked_candidates: List[ScoredCandidate],
    relevant_threshold: int = 1,
) -> float:
    """
    Compute reciprocal rank for a single query.

    The reciprocal rank is 1 / rank_of_first_relevant_candidate,
    or 0.0 if no relevant candidate is found in the ranked list.

    Parameters
    ----------
    ranked_candidates : List[ScoredCandidate]
        Candidates sorted by predicted_rank ascending (1-based).
    relevant_threshold : int
        Minimum ground-truth label to be considered relevant.

    Returns
    -------
    float
        Reciprocal rank. Range [0.0, 1.0].
    """
    for candidate in ranked_candidates:
        if candidate.ground_truth_label >= relevant_threshold:
            return 1.0 / candidate.predicted_rank
    return 0.0


def compute_metrics(
    per_query_results: List[QueryResult],
) -> Dict[str, float]:
    """
    Compute aggregate metrics across all query results.

    Parameters
    ----------
    per_query_results : List[QueryResult]

    Returns
    -------
    dict
        Dictionary with keys: macro_p_at_1, macro_p_at_5, mrr.
    """
    if not per_query_results:
        return {"macro_p_at_1": 0.0, "macro_p_at_5": 0.0, "mrr": 0.0}

    n = len(per_query_results)
    macro_p1 = sum(r.p_at_1 for r in per_query_results) / n
    macro_p5 = sum(r.p_at_5 for r in per_query_results) / n
    mrr = sum(r.reciprocal_rank for r in per_query_results) / n

    return {
        "macro_p_at_1": round(macro_p1, 4),
        "macro_p_at_5": round(macro_p5, 4),
        "mrr": round(mrr, 4),
    }


def identify_failures(
    per_query_results: List[QueryResult],
    relevant_threshold: int = 1,
) -> List[dict]:
    """
    Identify failure cases from per-query evaluation results.

    Failure categories:
        1. rank_1_not_relevant: Top-ranked result is not relevant.
        2. no_relevant_in_top5: No relevant standard in top-5 results.
        3. hard_negative_outranked_relevant: A label-0 candidate ranked above a
           label>=threshold candidate.
        4. related_outranked_direct: A label-1 candidate ranked above a label-2 candidate.

    Parameters
    ----------
    per_query_results : List[QueryResult]
    relevant_threshold : int
        Minimum label to be considered relevant.

    Returns
    -------
    List[dict]
        List of failure dictionaries with failure_type, query details, and
        ranked candidate information.
    """
    failures = []

    for result in per_query_results:
        ranked = result.ranked_candidates
        if not ranked:
            continue

        has_relevant = any(c.ground_truth_label >= relevant_threshold for c in ranked)

        # Failure type 1: rank 1 is not relevant
        if ranked[0].ground_truth_label < relevant_threshold:
            relevant_at_what_rank = next(
                (c.predicted_rank for c in ranked if c.ground_truth_label >= relevant_threshold),
                None,
            )
            failures.append({
                "failure_type": "rank_1_not_relevant",
                "query_id": result.query_id,
                "query": result.query,
                "category": result.category,
                "difficulty": result.difficulty,
                "rank_1_candidate": {
                    "candidate_id": ranked[0].candidate_id,
                    "standard_number": ranked[0].standard_number,
                    "title": ranked[0].title,
                    "predicted_score": ranked[0].predicted_score,
                    "ground_truth_label": ranked[0].ground_truth_label,
                },
                "first_relevant_at_rank": relevant_at_what_rank,
                "full_ranking": [
                    {
                        "rank": c.predicted_rank,
                        "standard_number": c.standard_number,
                        "score": c.predicted_score,
                        "label": c.ground_truth_label,
                    }
                    for c in ranked
                ],
            })

        # Failure type 2: no relevant in top 5
        top5 = ranked[:5]
        if has_relevant and not any(c.ground_truth_label >= relevant_threshold for c in top5):
            failures.append({
                "failure_type": "no_relevant_in_top5",
                "query_id": result.query_id,
                "query": result.query,
                "category": result.category,
                "difficulty": result.difficulty,
                "top5": [
                    {
                        "rank": c.predicted_rank,
                        "standard_number": c.standard_number,
                        "score": c.predicted_score,
                        "label": c.ground_truth_label,
                    }
                    for c in top5
                ],
            })

        # Failure type 3: hard negative (label 0) outranked a relevant candidate
        relevant_ranks = [c.predicted_rank for c in ranked if c.ground_truth_label >= relevant_threshold]
        irrelevant_ranks = [c.predicted_rank for c in ranked if c.ground_truth_label < relevant_threshold]
        if relevant_ranks and irrelevant_ranks:
            best_relevant_rank = min(relevant_ranks)
            outranking_negatives = [
                c for c in ranked
                if c.ground_truth_label < relevant_threshold and c.predicted_rank < best_relevant_rank
            ]
            if outranking_negatives:
                best_relevant_candidate = next(
                    c for c in ranked if c.predicted_rank == best_relevant_rank
                )
                failures.append({
                    "failure_type": "hard_negative_outranked_relevant",
                    "query_id": result.query_id,
                    "query": result.query,
                    "category": result.category,
                    "difficulty": result.difficulty,
                    "outranking_negatives": [
                        {
                            "rank": c.predicted_rank,
                            "standard_number": c.standard_number,
                            "score": c.predicted_score,
                            "label": c.ground_truth_label,
                        }
                        for c in outranking_negatives
                    ],
                    "best_relevant_candidate": {
                        "rank": best_relevant_candidate.predicted_rank,
                        "standard_number": best_relevant_candidate.standard_number,
                        "score": best_relevant_candidate.predicted_score,
                        "label": best_relevant_candidate.ground_truth_label,
                    },
                })

        # Failure type 4: related standard (label 1) outranked a directly applicable standard (label 2)
        label2_ranks = [c.predicted_rank for c in ranked if c.ground_truth_label == 2]
        label1_ranks = [c.predicted_rank for c in ranked if c.ground_truth_label == 1]
        if label2_ranks and label1_ranks:
            best_label2_rank = min(label2_ranks)
            label1_outranking = [
                c for c in ranked
                if c.ground_truth_label == 1 and c.predicted_rank < best_label2_rank
            ]
            if label1_outranking:
                best_label2_candidate = next(
                    c for c in ranked if c.predicted_rank == best_label2_rank
                )
                failures.append({
                    "failure_type": "related_outranked_direct",
                    "query_id": result.query_id,
                    "query": result.query,
                    "category": result.category,
                    "difficulty": result.difficulty,
                    "label1_outranking_label2": [
                        {
                            "rank": c.predicted_rank,
                            "standard_number": c.standard_number,
                            "score": c.predicted_score,
                            "label": c.ground_truth_label,
                        }
                        for c in label1_outranking
                    ],
                    "expected_top_candidate": {
                        "rank": best_label2_candidate.predicted_rank,
                        "standard_number": best_label2_candidate.standard_number,
                        "score": best_label2_candidate.predicted_score,
                        "label": best_label2_candidate.ground_truth_label,
                    },
                })

    return failures
