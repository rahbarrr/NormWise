"""
Tests for /api/v1/rerank endpoint with mocked model predictions.
"""
from unittest.mock import patch
from app.models.reranker import BGERerankerModel


def test_rerank_success_response_schema(client, monkeypatch):
    """Test successful rerank response structure and fields."""
    # Mock predict_scores to return scores for 3 candidates
    monkeypatch.setattr(
        BGERerankerModel,
        "predict_scores",
        lambda self, pairs, apply_sigmoid=True: [0.35, 0.88, 0.62],
    )

    payload = {
        "query": "5 litre stainless steel pressure cooker for institutional kitchen",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 10322",
                "title": "LED Luminaires",
                "description": "Lighting equipment specification",
            },
            {
                "id": "std-2",
                "standard_number": "IS 2347:2023",
                "title": "Domestic Pressure Cookers",
                "description": "Specification for domestic pressure cookers",
            },
            {
                "id": "std-3",
                "standard_number": "IS 14756",
                "title": "Stainless Steel Cookware",
                "description": "Specification for stainless steel utensils",
            },
        ],
        "top_k": 2,
    }

    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["query"] == payload["query"]
    assert data["ranker_used"] == "bge-reranker-v2-m3"
    assert "bge-reranker" in data["model_name"]
    assert len(data["results"]) == 2

    # Verify ranking order: std-2 (0.88) > std-3 (0.62)
    top_result = data["results"][0]
    assert top_result["id"] == "std-2"
    assert top_result["standard_number"] == "IS 2347:2023"
    assert top_result["rerank_score"] == 0.88
    assert top_result["rank"] == 1
    assert top_result["ranker"] == "bge-reranker-v2-m3"

    second_result = data["results"][1]
    assert second_result["id"] == "std-3"
    assert second_result["standard_number"] == "IS 14756"
    assert second_result["rerank_score"] == 0.62
    assert second_result["rank"] == 2


def test_rerank_inference_failure_returns_500(client, monkeypatch):
    """Test clean 500 error handling when model raises RuntimeError."""
    def mock_fail(self, pairs, apply_sigmoid=True):
        raise RuntimeError("CUDA out of memory or device error")

    monkeypatch.setattr(BGERerankerModel, "predict_scores", mock_fail)

    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                "title": "Pressure Cookers",
            }
        ],
        "top_k": 1,
    }

    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data
    assert "CUDA" not in data["detail"]  # No internal stack trace leaked to client
