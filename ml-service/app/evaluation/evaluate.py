"""
NormWise Evaluation — Main Evaluation Runner
=============================================
Runs the BGE reranker baseline evaluation over the NormWise domain dataset.

USAGE
-----
From ml-service/ directory (with .venv activated or using .venv Python):

    python -m app.evaluation.evaluate

The model is loaded ONCE at startup and reused across all queries.

RELEVANCE THRESHOLD
-------------------
label >= 1 is treated as "relevant" for P@1, P@5, and MRR.
See app/evaluation/metrics.py for full metric definitions.

DO NOT MODIFY THE MODEL OR RANKING ALGORITHM to improve these numbers.
This is an honest baseline measurement of the pretrained BAAI/bge-reranker-v2-m3.
"""
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import List

# ── Path setup ──────────────────────────────────────────────────────────────
# Ensure the ml-service root is on sys.path when run via `python -m`
_HERE = Path(__file__).resolve()
_ML_SERVICE_ROOT = _HERE.parents[2]  # ml-service/
if str(_ML_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_SERVICE_ROOT))

# ── NormWise imports ─────────────────────────────────────────────────────────
from app.evaluation.dataset import load_dataset, dataset_summary, EvalQuery
from app.evaluation.metrics import (
    ScoredCandidate,
    QueryResult,
    EvaluationSummary,
    compute_p_at_k,
    compute_reciprocal_rank,
    compute_metrics,
    identify_failures,
)
from app.schemas.rerank import Candidate
from app.services.ranker import BGERanker, format_candidate_text
from app.models.reranker import BGERerankerModel, MODEL_NAME

# ── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("normwise.evaluation.run")

# ── Constants ─────────────────────────────────────────────────────────────────
RELEVANT_THRESHOLD = 1  # label >= RELEVANT_THRESHOLD → relevant
DATASET_PATH = Path(__file__).parent / "data" / "queries.jsonl"
REPORT_DIR = Path(__file__).parent / "reports"


def _eval_query_to_api_candidates(query: EvalQuery) -> List[Candidate]:
    """Convert EvalQuery candidates to API Candidate schema objects."""
    return [
        Candidate(
            id=c.candidate_id,
            standard_number=c.standard_number,
            title=c.title,
            description=c.description,
        )
        for c in query.candidates
    ]


def run_evaluation(
    dataset_path: Path = DATASET_PATH,
    relevant_threshold: int = RELEVANT_THRESHOLD,
) -> EvaluationSummary:
    """
    Run the full baseline evaluation.

    Loads the dataset, loads the BGE model ONCE, scores each query's candidates,
    computes per-query and aggregate metrics, and identifies failure cases.

    Parameters
    ----------
    dataset_path : Path
        Path to the JSONL evaluation dataset.
    relevant_threshold : int
        Minimum label to be considered relevant (default: 1).

    Returns
    -------
    EvaluationSummary
        Complete evaluation results including per-query rankings and failures.
    """
    logger.info("=" * 60)
    logger.info("NormWise BGE Reranker Baseline Evaluation")
    logger.info("=" * 60)
    logger.info(f"Dataset       : {dataset_path}")
    logger.info(f"Model         : {MODEL_NAME}")
    logger.info(f"Relevance     : label >= {relevant_threshold}")
    logger.info(f"Timestamp     : {datetime.now(timezone.utc).isoformat()}")
    logger.info("=" * 60)

    # ── Load dataset ─────────────────────────────────────────────────────────
    logger.info("Loading evaluation dataset...")
    queries = load_dataset(dataset_path)
    summary = dataset_summary(queries)
    logger.info(
        f"Dataset loaded: {summary['num_queries']} queries, "
        f"{summary['num_candidate_pairs']} candidate pairs, "
        f"{summary['num_categories']} categories."
    )
    logger.info(f"Categories: {summary['categories']}")
    logger.info(f"Difficulty distribution: {summary['difficulty_distribution']}")
    logger.info(f"Label distribution: {summary['label_distribution']}")

    if summary["queries_with_no_relevant_candidates"]:
        logger.warning(
            f"Queries with NO relevant candidates (will contribute 0 to MRR): "
            f"{summary['queries_with_no_relevant_candidates']}"
        )

    # ── Load BGE model ONCE ───────────────────────────────────────────────────
    logger.info("Loading BGE cross-encoder model (this may take a moment)...")
    model_instance = BGERerankerModel.get_instance()
    model_instance.load()
    ranker = BGERanker(model_instance=model_instance)
    logger.info(f"Model loaded: {model_instance.model_name} on {model_instance.device}")

    # ── Score each query ─────────────────────────────────────────────────────
    per_query_results: List[QueryResult] = []
    label_lookup = {}

    for qi, eval_query in enumerate(queries, start=1):
        logger.info(
            f"[{qi:02d}/{len(queries):02d}] Query {eval_query.query_id}: "
            f"{eval_query.query[:70]!r}..."
        )

        api_candidates = _eval_query_to_api_candidates(eval_query)

        # Build label lookup: candidate_id → ground_truth_label
        label_lookup = {c.candidate_id: c.label for c in eval_query.candidates}

        # Rerank using BGERanker
        top_k = len(api_candidates)  # evaluate all candidates
        ranked_api = ranker.rerank(query=eval_query.query, candidates=api_candidates, top_k=top_k)

        # Attach ground-truth labels to ranked results
        scored_candidates = [
            ScoredCandidate(
                candidate_id=r.id,
                standard_number=r.standard_number,
                title=r.title,
                predicted_rank=r.rank,
                predicted_score=r.rerank_score,
                ground_truth_label=label_lookup.get(r.id, 0),
            )
            for r in ranked_api
        ]

        p1 = compute_p_at_k(scored_candidates, k=1, relevant_threshold=relevant_threshold)
        p5 = compute_p_at_k(scored_candidates, k=5, relevant_threshold=relevant_threshold)
        rr = compute_reciprocal_rank(scored_candidates, relevant_threshold=relevant_threshold)

        logger.info(
            f"  → P@1={p1:.3f} | P@5={p5:.3f} | RR={rr:.3f} | "
            f"top-1={scored_candidates[0].standard_number if scored_candidates else 'n/a'} "
            f"(label={scored_candidates[0].ground_truth_label if scored_candidates else 'n/a'})"
        )

        per_query_results.append(
            QueryResult(
                query_id=eval_query.query_id,
                query=eval_query.query,
                category=eval_query.category,
                difficulty=eval_query.difficulty,
                ranked_candidates=scored_candidates,
                p_at_1=p1,
                p_at_5=p5,
                reciprocal_rank=rr,
            )
        )

    # ── Aggregate metrics ─────────────────────────────────────────────────────
    agg = compute_metrics(per_query_results)
    failures = identify_failures(per_query_results, relevant_threshold=relevant_threshold)

    logger.info("=" * 60)
    logger.info("AGGREGATE RESULTS")
    logger.info(f"  Queries evaluated : {len(per_query_results)}")
    logger.info(f"  P@1               : {agg['macro_p_at_1']:.4f}")
    logger.info(f"  P@5               : {agg['macro_p_at_5']:.4f}")
    logger.info(f"  MRR               : {agg['mrr']:.4f}")
    logger.info(f"  Failures detected : {len(failures)}")
    logger.info("=" * 60)

    eval_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    result = EvaluationSummary(
        num_queries=len(per_query_results),
        num_candidate_pairs=summary["num_candidate_pairs"],
        macro_p_at_1=agg["macro_p_at_1"],
        macro_p_at_5=agg["macro_p_at_5"],
        mrr=agg["mrr"],
        relevant_threshold=relevant_threshold,
        model_name=model_instance.model_name,
        evaluation_date=eval_date,
        per_query=per_query_results,
        failure_analysis=failures,
    )

    _save_report(result, summary)
    return result


def _save_report(result: EvaluationSummary, dataset_summary_dict: dict) -> None:
    """Save a JSON evaluation report to the reports/ directory."""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report_path = REPORT_DIR / f"eval_report_{timestamp}.json"

    per_query_data = []
    for qr in result.per_query:
        per_query_data.append({
            "query_id": qr.query_id,
            "query": qr.query,
            "category": qr.category,
            "difficulty": qr.difficulty,
            "p_at_1": qr.p_at_1,
            "p_at_5": qr.p_at_5,
            "reciprocal_rank": qr.reciprocal_rank,
            "ranked_candidates": [
                {
                    "rank": c.predicted_rank,
                    "candidate_id": c.candidate_id,
                    "standard_number": c.standard_number,
                    "title": c.title,
                    "predicted_score": round(c.predicted_score, 6),
                    "ground_truth_label": c.ground_truth_label,
                    "is_relevant": c.ground_truth_label >= result.relevant_threshold,
                }
                for c in qr.ranked_candidates
            ],
        })

    report = {
        "evaluation_metadata": {
            "evaluation_date": result.evaluation_date,
            "model_name": result.model_name,
            "relevant_threshold": result.relevant_threshold,
            "threshold_note": "label >= relevant_threshold is treated as relevant for P@1, P@5, MRR",
        },
        "dataset_summary": dataset_summary_dict,
        "aggregate_metrics": {
            "num_queries": result.num_queries,
            "num_candidate_pairs": result.num_candidate_pairs,
            "P@1": result.macro_p_at_1,
            "P@5": result.macro_p_at_5,
            "MRR": result.mrr,
        },
        "per_query_results": per_query_data,
        "failure_analysis": {
            "total_failures": len(result.failure_analysis),
            "failures": result.failure_analysis,
        },
    }

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info(f"Report saved to: {report_path}")


def _print_failure_summary(failures: List[dict]) -> None:
    """Print a human-readable failure summary to stdout."""
    if not failures:
        print("\n✓ No failures detected.")
        return

    print(f"\n{'='*60}")
    print(f"FAILURE ANALYSIS ({len(failures)} failure(s))")
    print(f"{'='*60}")

    for i, f in enumerate(failures, start=1):
        print(f"\n[F{i:02d}] Type: {f['failure_type']}")
        print(f"      Query ID   : {f['query_id']}")
        print(f"      Query      : {f['query'][:80]}")
        print(f"      Category   : {f['category']}")
        print(f"      Difficulty : {f['difficulty']}")

        if "rank_1_candidate" in f:
            r1 = f["rank_1_candidate"]
            print(f"      Rank-1 got : {r1['standard_number']} (label={r1['ground_truth_label']}, score={r1['predicted_score']:.4f})")
            print(f"      First relevant at rank: {f.get('first_relevant_at_rank', 'N/A')}")

        if "full_ranking" in f:
            print("      Full ranking:")
            for item in f["full_ranking"]:
                relevant_marker = "✓" if item["label"] >= 1 else "✗"
                print(f"        [{item['rank']}] {relevant_marker} {item['standard_number']:45s} score={item['score']:.4f} label={item['label']}")

        if "outranking_negatives" in f:
            print("      Hard negatives that outranked best relevant:")
            for neg in f["outranking_negatives"]:
                print(f"        rank {neg['rank']}: {neg['standard_number']} score={neg['score']:.4f} label={neg['label']}")
            best = f.get("best_relevant_candidate", {})
            print(f"      Best relevant (rank {best.get('rank')}): {best.get('standard_number')} score={best.get('score', 0):.4f}")

        if "label1_outranking_label2" in f:
            print("      Related standards (label=1) that outranked direct match (label=2):")
            for rel in f["label1_outranking_label2"]:
                print(f"        rank {rel['rank']}: {rel['standard_number']} score={rel['score']:.4f} label={rel['label']}")
            expected = f.get("expected_top_candidate", {})
            print(f"      Expected top (label=2, rank {expected.get('rank')}): {expected.get('standard_number')}")


def main():
    """Entry point for `python -m app.evaluation.evaluate`."""
    result = run_evaluation()

    print(f"\n{'='*60}")
    print("NormWise BGE Reranker — Baseline Evaluation Summary")
    print(f"{'='*60}")
    print(f"Model          : {result.model_name}")
    print(f"Evaluation date: {result.evaluation_date}")
    print(f"Queries        : {result.num_queries}")
    print(f"Candidate pairs: {result.num_candidate_pairs}")
    print(f"Relevance def  : label >= {result.relevant_threshold}")
    print(f"{'-'*60}")
    print(f"P@1            : {result.macro_p_at_1:.4f}")
    print(f"P@5            : {result.macro_p_at_5:.4f}")
    print(f"MRR            : {result.mrr:.4f}")
    print(f"{'-'*60}")
    print(f"Failures       : {len(result.failure_analysis)}")
    print(f"{'='*60}")

    _print_failure_summary(result.failure_analysis)


if __name__ == "__main__":
    main()
