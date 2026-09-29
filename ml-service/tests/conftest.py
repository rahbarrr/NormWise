"""
Pytest configuration and shared fixtures for NormWise ML Service tests.
"""
import sys
import os
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.models.reranker import BGERerankerModel


@pytest.fixture(autouse=True)
def prevent_model_loading(monkeypatch):
    """
    Ensure automated unit tests never load the real multi-gigabyte BGE model.
    Mocks BGERerankerModel.load and BGERerankerModel.predict_scores by default.
    """
    mock_model = MagicMock()
    # Default predict_scores mock returning deterministic scores based on position
    def mock_predict_scores(pairs, apply_sigmoid=True):
        # Return synthetic descending scores for test stability
        return [1.0 / (1.0 + float(i)) for i in range(len(pairs))]

    monkeypatch.setattr(BGERerankerModel, "load", lambda self: None)
    monkeypatch.setattr(BGERerankerModel, "predict_scores", mock_predict_scores)


@pytest.fixture
def client():
    """FastAPI TestClient instance."""
    return TestClient(app)
