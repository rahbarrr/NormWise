"""
Tests for /health and /version endpoints.
"""
from app.models.reranker import BGERerankerModel


def test_get_health(client):
    """Test health check returns 200 and ok status without loading model."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "normwise-ml-service"


def test_get_version(client):
    """Test version endpoint reports active service version and BGE model."""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "normwise-ml-service"
    assert data["version"] == "0.2.0"
    assert "bge-reranker" in data["ranker"]
    assert "bge-reranker-v2-m3" in data["model"]
