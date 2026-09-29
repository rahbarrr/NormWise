"""
Unit tests for ranking service logic and candidate text formatting.
"""
from unittest.mock import MagicMock
from app.schemas.rerank import Candidate
from app.services.ranker import BGERanker, format_candidate_text, PassthroughRanker


def test_format_candidate_text():
    """Test candidate text formatting with and without description."""
    c1 = Candidate(
        id="1",
        standard_number="IS 2347:2023",
        title="Domestic Pressure Cookers",
        description="Specification for pressure cookers.",
    )
    assert format_candidate_text(c1) == "IS 2347:2023 — Domestic Pressure Cookers. Specification for pressure cookers."

    c2 = Candidate(
        id="2",
        standard_number="IS 10322",
        title="Luminaires",
        description=None,
    )
    assert format_candidate_text(c2) == "IS 10322 — Luminaires"


def test_bge_ranker_sorting_and_top_k():
    """Test BGERanker sorts by score descending and enforces top_k."""
    mock_model = MagicMock()
    # Mock scores for 3 candidates: candidate 0 gets 0.4, candidate 1 gets 0.95, candidate 2 gets 0.7
    mock_model.predict_scores.return_value = [0.4, 0.95, 0.7]
    mock_model.model_name = "BAAI/bge-reranker-v2-m3"

    ranker = BGERanker(model_instance=mock_model)

    candidates = [
        Candidate(id="c0", standard_number="IS 100", title="Low match standard"),
        Candidate(id="c1", standard_number="IS 200", title="High match standard"),
        Candidate(id="c2", standard_number="IS 300", title="Medium match standard"),
    ]

    # Test top_k=2
    results = ranker.rerank(query="test query", candidates=candidates, top_k=2)

    assert len(results) == 2

    # First should be c1 (highest score 0.95)
    assert results[0].id == "c1"
    assert results[0].rank == 1
    assert results[0].rerank_score == 0.95

    # Second should be c2 (score 0.7)
    assert results[1].id == "c2"
    assert results[1].rank == 2
    assert results[1].rerank_score == 0.7


def test_passthrough_ranker():
    """Test fallback PassthroughRanker respects initial_score."""
    ranker = PassthroughRanker()
    candidates = [
        Candidate(id="c1", standard_number="IS 1", title="Std 1", initial_score=0.5),
        Candidate(id="c2", standard_number="IS 2", title="Std 2", initial_score=0.9),
    ]
    results = ranker.rerank("query", candidates, top_k=5)
    assert results[0].id == "c2"
    assert results[0].rerank_score == 0.9
    assert results[1].id == "c1"
    assert results[1].rerank_score == 0.5
