"""
Tests for input validation on /api/v1/rerank.
"""


def test_empty_query_validation(client):
    """Test empty query is rejected with 422 Unprocessable Entity."""
    payload = {
        "query": "",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                "title": "Pressure Cookers",
            }
        ],
        "top_k": 5,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_whitespace_query_validation(client):
    """Test whitespace-only query is rejected with 422."""
    payload = {
        "query": "   \t \n  ",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                "title": "Pressure Cookers",
            }
        ],
        "top_k": 5,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_empty_candidates_validation(client):
    """Test empty candidates list is rejected with 422."""
    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": [],
        "top_k": 5,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_invalid_candidate_structure(client):
    """Test invalid candidate structure (missing required title) is rejected with 422."""
    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                # missing title
            }
        ],
        "top_k": 5,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_top_k_below_minimum(client):
    """Test top_k < 1 is rejected with 422."""
    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                "title": "Pressure Cookers",
            }
        ],
        "top_k": 0,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_top_k_above_maximum(client):
    """Test top_k > 50 is rejected with 422."""
    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": [
            {
                "id": "std-1",
                "standard_number": "IS 2347:2023",
                "title": "Pressure Cookers",
            }
        ],
        "top_k": 100,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422


def test_too_many_candidates(client):
    """Test candidates list exceeding 50 items is rejected with 422."""
    candidates = [
        {
            "id": f"std-{i}",
            "standard_number": f"IS {i}",
            "title": f"Standard {i}",
        }
        for i in range(51)
    ]
    payload = {
        "query": "5 litre stainless steel pressure cooker",
        "candidates": candidates,
        "top_k": 5,
    }
    response = client.post("/api/v1/rerank", json=payload)
    assert response.status_code == 422
