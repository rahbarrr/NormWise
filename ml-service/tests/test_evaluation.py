"""
Unit Tests — NormWise Evaluation Framework
==========================================
Tests dataset loading, metric calculations, and failure detection.

These tests do NOT load or download the real BGE model.
All scoring is done with mocked/synthetic scores.

SEPARATION:
  UNIT TESTS (this file)   → run with `pytest tests/`    (no model download)
  REAL EVALUATION          → run with `python -m app.evaluation.evaluate`
"""
import json
import pytest
from pathlib import Path

from app.evaluation.dataset import (
    EvalCandidate,
    EvalQuery,
    load_dataset,
    dataset_summary,
)
from app.evaluation.metrics import (
    ScoredCandidate,
    QueryResult,
    compute_p_at_k,
    compute_reciprocal_rank,
    compute_metrics,
    identify_failures,
)


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

def _make_candidate(cid: str, std: str, title: str, label: int) -> EvalCandidate:
    return EvalCandidate(
        candidate_id=cid,
        standard_number=std,
        title=title,
        description=f"Description for {std}",
        label=label,
    )


def _make_scored(cid: str, std: str, title: str, rank: int, score: float, label: int) -> ScoredCandidate:
    return ScoredCandidate(
        candidate_id=cid,
        standard_number=std,
        title=title,
        predicted_rank=rank,
        predicted_score=score,
        ground_truth_label=label,
    )


def _make_query_result(
    query_id: str,
    ranked: list,
    category: str = "Test",
    difficulty: str = "test",
    relevant_threshold: int = 1,
) -> QueryResult:
    p1 = compute_p_at_k(ranked, k=1, relevant_threshold=relevant_threshold)
    p5 = compute_p_at_k(ranked, k=5, relevant_threshold=relevant_threshold)
    rr = compute_reciprocal_rank(ranked, relevant_threshold=relevant_threshold)
    return QueryResult(
        query_id=query_id,
        query=f"Test query {query_id}",
        category=category,
        difficulty=difficulty,
        ranked_candidates=ranked,
        p_at_1=p1,
        p_at_5=p5,
        reciprocal_rank=rr,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Dataset Loading Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestDatasetLoading:

    def test_load_real_dataset_file(self):
        """Real JSONL dataset file loads without errors."""
        dataset_path = Path(__file__).parent.parent / "app" / "evaluation" / "data" / "queries.jsonl"
        queries = load_dataset(dataset_path)
        assert len(queries) > 0, "Dataset should contain at least one query."

    def test_real_dataset_minimum_queries(self):
        """Real dataset contains at least 20 queries."""
        dataset_path = Path(__file__).parent.parent / "app" / "evaluation" / "data" / "queries.jsonl"
        queries = load_dataset(dataset_path)
        assert len(queries) >= 20, f"Expected >= 20 queries, got {len(queries)}."

    def test_real_dataset_all_have_candidates(self):
        """Every query in the real dataset has at least one candidate."""
        dataset_path = Path(__file__).parent.parent / "app" / "evaluation" / "data" / "queries.jsonl"
        queries = load_dataset(dataset_path)
        for q in queries:
            assert len(q.candidates) > 0, f"Query {q.query_id} has no candidates."

    def test_real_dataset_all_labels_valid(self):
        """All labels in the real dataset are 0, 1, or 2."""
        dataset_path = Path(__file__).parent.parent / "app" / "evaluation" / "data" / "queries.jsonl"
        queries = load_dataset(dataset_path)
        for q in queries:
            for c in q.candidates:
                assert c.label in {0, 1, 2}, (
                    f"Query {q.query_id}, candidate {c.candidate_id}: invalid label {c.label}."
                )

    def test_load_from_tmpfile(self, tmp_path):
        """JSONL file with multiple valid records loads correctly."""
        data = [
            {
                "query_id": "Q001",
                "query": "Test procurement query for pressure cooker",
                "category": "Cookware",
                "difficulty": "direct_match",
                "candidates": [
                    {
                        "candidate_id": "Q001-A",
                        "standard_number": "IS 2347:2023",
                        "title": "Pressure Cookers Specification",
                        "description": "Covers stainless steel pressure cookers.",
                        "label": 2,
                        "annotation_note": "Direct match.",
                    },
                    {
                        "candidate_id": "Q001-B",
                        "standard_number": "IS 6911:2017",
                        "title": "Stainless Steel Sheet Specification",
                        "description": "Material specification.",
                        "label": 1,
                        "annotation_note": "Partial match.",
                    },
                ],
            }
        ]
        f = tmp_path / "test_queries.jsonl"
        f.write_text("\n".join(json.dumps(d) for d in data), encoding="utf-8")
        queries = load_dataset(f)
        assert len(queries) == 1
        assert queries[0].query_id == "Q001"
        assert len(queries[0].candidates) == 2
        assert queries[0].candidates[0].label == 2
        assert queries[0].candidates[1].label == 1

    def test_load_missing_file_raises(self, tmp_path):
        """Missing dataset file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            load_dataset(tmp_path / "nonexistent.jsonl")

    def test_load_invalid_label_raises(self, tmp_path):
        """A candidate with label 99 raises ValueError during load."""
        data = {
            "query_id": "Q001",
            "query": "Test query",
            "category": "Test",
            "difficulty": "test",
            "candidates": [
                {
                    "candidate_id": "Q001-A",
                    "standard_number": "IS 0000:2000",
                    "title": "Invalid Label Standard",
                    "description": "desc",
                    "label": 99,
                }
            ],
        }
        f = tmp_path / "bad.jsonl"
        f.write_text(json.dumps(data), encoding="utf-8")
        with pytest.raises(ValueError, match="Invalid label 99"):
            load_dataset(f)

    def test_load_empty_file_returns_empty_list(self, tmp_path):
        """Empty JSONL file returns empty list."""
        f = tmp_path / "empty.jsonl"
        f.write_text("", encoding="utf-8")
        queries = load_dataset(f)
        assert queries == []

    def test_query_has_relevant_candidates_property(self):
        """has_relevant_candidates returns True when any candidate has label >= 1."""
        q = EvalQuery(
            query_id="Q001",
            query="test",
            category="Test",
            difficulty="test",
            candidates=[
                _make_candidate("A", "IS 0001", "Title A", 0),
                _make_candidate("B", "IS 0002", "Title B", 1),
            ],
        )
        assert q.has_relevant_candidates is True

    def test_query_no_relevant_candidates_property(self):
        """has_relevant_candidates returns False when all candidates have label 0."""
        q = EvalQuery(
            query_id="Q002",
            query="test",
            category="Test",
            difficulty="no_match",
            candidates=[
                _make_candidate("A", "IS 0001", "Title A", 0),
                _make_candidate("B", "IS 0002", "Title B", 0),
            ],
        )
        assert q.has_relevant_candidates is False

    def test_dataset_summary_structure(self):
        """dataset_summary returns expected keys."""
        dataset_path = Path(__file__).parent.parent / "app" / "evaluation" / "data" / "queries.jsonl"
        queries = load_dataset(dataset_path)
        summary = dataset_summary(queries)
        for key in (
            "num_queries", "num_candidate_pairs", "categories",
            "num_categories", "difficulty_distribution", "label_distribution",
            "queries_with_no_relevant_candidates",
        ):
            assert key in summary, f"Missing key '{key}' in dataset_summary output."


# ─────────────────────────────────────────────────────────────────────────────
# Metric Calculation Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestPrecisionAtK:

    def test_p_at_1_correct_when_rank1_is_relevant(self):
        """P@1 = 1.0 when rank-1 candidate has label >= 1."""
        ranked = [
            _make_scored("A", "IS 2347:2023", "Pressure Cooker", 1, 0.92, 2),
            _make_scored("B", "IS 6911:2017", "SS Sheet", 2, 0.75, 1),
            _make_scored("C", "IS 1234:2020", "Unrelated", 3, 0.40, 0),
        ]
        assert compute_p_at_k(ranked, k=1) == 1.0

    def test_p_at_1_zero_when_rank1_is_irrelevant(self):
        """P@1 = 0.0 when rank-1 candidate has label 0."""
        ranked = [
            _make_scored("C", "IS 1234:2020", "Unrelated", 1, 0.92, 0),
            _make_scored("A", "IS 2347:2023", "Pressure Cooker", 2, 0.75, 2),
        ]
        assert compute_p_at_k(ranked, k=1) == 0.0

    def test_p_at_5_all_relevant(self):
        """P@5 = 1.0 when all 5 top candidates are relevant."""
        ranked = [
            _make_scored(f"C{i}", f"IS {i}:2020", f"Title {i}", i, 0.9 - i * 0.05, 1)
            for i in range(1, 6)
        ]
        assert compute_p_at_k(ranked, k=5) == 1.0

    def test_p_at_5_partial_relevant(self):
        """P@5 = 0.4 when 2 out of 5 top candidates are relevant."""
        ranked = [
            _make_scored("A", "IS 0001", "Title A", 1, 0.90, 2),
            _make_scored("B", "IS 0002", "Title B", 2, 0.80, 0),
            _make_scored("C", "IS 0003", "Title C", 3, 0.70, 1),
            _make_scored("D", "IS 0004", "Title D", 4, 0.60, 0),
            _make_scored("E", "IS 0005", "Title E", 5, 0.50, 0),
        ]
        p5 = compute_p_at_k(ranked, k=5)
        assert abs(p5 - 0.4) < 1e-9, f"Expected P@5=0.4, got {p5}"

    def test_p_at_5_with_fewer_than_5_candidates(self):
        """P@5 uses actual number of candidates if fewer than 5 exist."""
        ranked = [
            _make_scored("A", "IS 0001", "Title A", 1, 0.90, 2),
            _make_scored("B", "IS 0002", "Title B", 2, 0.70, 0),
            _make_scored("C", "IS 0003", "Title C", 3, 0.50, 0),
        ]
        p5 = compute_p_at_k(ranked, k=5)
        # 1 relevant out of 3 available = 1/3
        assert abs(p5 - 1 / 3) < 1e-9

    def test_p_at_k_empty_ranked_list(self):
        """P@K = 0.0 for empty ranked list."""
        assert compute_p_at_k([], k=1) == 0.0
        assert compute_p_at_k([], k=5) == 0.0


class TestReciprocalRank:

    def test_rr_rank1_relevant(self):
        """RR = 1.0 when first candidate (rank 1) is relevant."""
        ranked = [
            _make_scored("A", "IS 2347:2023", "PC", 1, 0.90, 2),
            _make_scored("B", "IS 0002", "B", 2, 0.50, 0),
        ]
        assert compute_reciprocal_rank(ranked) == 1.0

    def test_rr_rank2_relevant(self):
        """RR = 0.5 when first relevant candidate is at rank 2."""
        ranked = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 0),
            _make_scored("B", "IS 2347:2023", "B", 2, 0.70, 2),
            _make_scored("C", "IS 0003", "C", 3, 0.50, 0),
        ]
        assert compute_reciprocal_rank(ranked) == 0.5

    def test_rr_rank3_relevant(self):
        """RR = 1/3 when first relevant candidate is at rank 3."""
        ranked = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 0),
            _make_scored("B", "IS 0002", "B", 2, 0.70, 0),
            _make_scored("C", "IS 2347:2023", "C", 3, 0.50, 1),
        ]
        rr = compute_reciprocal_rank(ranked)
        assert abs(rr - 1 / 3) < 1e-9

    def test_rr_no_relevant_candidates(self):
        """RR = 0.0 when no candidate is relevant."""
        ranked = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 0),
            _make_scored("B", "IS 0002", "B", 2, 0.70, 0),
        ]
        assert compute_reciprocal_rank(ranked) == 0.0

    def test_rr_empty_list(self):
        """RR = 0.0 for empty ranked list."""
        assert compute_reciprocal_rank([]) == 0.0


class TestComputeMetrics:

    def test_perfect_metrics(self):
        """P@1=1.0, P@5=1.0, MRR=1.0 when rank-1 is always relevant."""
        results = []
        for i in range(3):
            ranked = [
                _make_scored("A", f"IS 000{i}:2020", f"T{i}", 1, 0.90, 2),
                _make_scored("B", f"IS 999{i}:2020", f"U{i}", 2, 0.40, 0),
            ]
            results.append(_make_query_result(f"Q{i:03d}", ranked))
        agg = compute_metrics(results)
        assert agg["macro_p_at_1"] == 1.0
        assert agg["mrr"] == 1.0

    def test_zero_metrics_all_irrelevant_rank1(self):
        """P@1=0.0, MRR reflects rank of first relevant."""
        ranked = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 0),
            _make_scored("B", "IS 0002", "B", 2, 0.80, 0),
        ]
        result = _make_query_result("Q001", ranked)
        agg = compute_metrics([result])
        assert agg["macro_p_at_1"] == 0.0
        assert agg["mrr"] == 0.0

    def test_empty_results(self):
        """compute_metrics returns zeros for empty input."""
        agg = compute_metrics([])
        assert agg["macro_p_at_1"] == 0.0
        assert agg["macro_p_at_5"] == 0.0
        assert agg["mrr"] == 0.0

    def test_mrr_averaged_correctly(self):
        """MRR is the average of reciprocal ranks across queries."""
        # Query 1: relevant at rank 1 → RR=1.0
        ranked1 = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 2),
            _make_scored("B", "IS 0002", "B", 2, 0.40, 0),
        ]
        # Query 2: relevant at rank 2 → RR=0.5
        ranked2 = [
            _make_scored("C", "IS 0003", "C", 1, 0.85, 0),
            _make_scored("D", "IS 0004", "D", 2, 0.70, 1),
        ]
        r1 = _make_query_result("Q001", ranked1)
        r2 = _make_query_result("Q002", ranked2)
        agg = compute_metrics([r1, r2])
        expected_mrr = (1.0 + 0.5) / 2
        assert abs(agg["mrr"] - expected_mrr) < 1e-4


# ─────────────────────────────────────────────────────────────────────────────
# Failure Detection Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestFailureDetection:

    def test_failure_rank1_not_relevant(self):
        """Detects rank_1_not_relevant failure when rank-1 label is 0."""
        ranked = [
            _make_scored("C", "IS 0003", "Unrelated", 1, 0.92, 0),
            _make_scored("A", "IS 2347:2023", "PC", 2, 0.75, 2),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        assert "rank_1_not_relevant" in types

    def test_no_failure_when_rank1_relevant(self):
        """No rank_1_not_relevant failure when rank-1 is label >= 1."""
        ranked = [
            _make_scored("A", "IS 2347:2023", "PC", 1, 0.92, 2),
            _make_scored("B", "IS 0002", "Unrelated", 2, 0.40, 0),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        assert "rank_1_not_relevant" not in types

    def test_failure_hard_negative_outranked_relevant(self):
        """Detects hard_negative_outranked_relevant when label-0 is ranked above label-2."""
        ranked = [
            _make_scored("C", "IS 0003", "Unrelated", 1, 0.91, 0),
            _make_scored("A", "IS 2347:2023", "PC", 2, 0.72, 2),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        assert "hard_negative_outranked_relevant" in types

    def test_failure_related_outranked_direct(self):
        """Detects related_outranked_direct when label-1 ranks above label-2."""
        ranked = [
            _make_scored("B", "IS 6911:2017", "SS Sheet", 1, 0.88, 1),
            _make_scored("A", "IS 2347:2023", "PC", 2, 0.75, 2),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        assert "related_outranked_direct" in types

    def test_no_failure_on_correct_ranking(self):
        """No failures when label-2 is rank-1, label-1 is rank-2, label-0 is last."""
        ranked = [
            _make_scored("A", "IS 2347:2023", "PC", 1, 0.92, 2),
            _make_scored("B", "IS 6911:2017", "SS Sheet", 2, 0.75, 1),
            _make_scored("C", "IS 0003", "Unrelated", 3, 0.30, 0),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        assert failures == [], f"Expected no failures, got: {[f['failure_type'] for f in failures]}"

    def test_failure_no_relevant_in_top5_detected(self):
        """Detects no_relevant_in_top5 when relevant candidate is ranked 6th or beyond."""
        # 5 irrelevant candidates ranked above the relevant one
        ranked = [
            _make_scored(f"X{i}", f"IS 000{i}:2020", f"Unrelated {i}", i, 0.9 - i * 0.05, 0)
            for i in range(1, 6)
        ] + [
            _make_scored("A", "IS 2347:2023", "PC", 6, 0.35, 2),
        ]
        result = _make_query_result("Q001", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        assert "no_relevant_in_top5" in types

    def test_query_with_all_label_zero_no_false_positive(self):
        """No hard_negative_outranked_relevant failure when there are NO relevant candidates."""
        ranked = [
            _make_scored("A", "IS 0001", "A", 1, 0.90, 0),
            _make_scored("B", "IS 0002", "B", 2, 0.70, 0),
        ]
        result = _make_query_result("Q024", ranked)
        failures = identify_failures([result])
        types = [f["failure_type"] for f in failures]
        # rank_1_not_relevant may appear, but hard_negative_outranked_relevant should NOT
        # (there's nothing to be outranked)
        assert "hard_negative_outranked_relevant" not in types

    def test_identify_failures_empty_input(self):
        """identify_failures returns empty list for empty input."""
        assert identify_failures([]) == []
