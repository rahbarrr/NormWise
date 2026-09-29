"""
NormWise BGE Reranker Model Wrapper
===================================
Provides thread-safe singleton loading and inference for the BAAI/bge-reranker-v2-m3
cross-encoder model using sentence-transformers.
"""
import os
import math
import logging
from typing import List, Tuple, Optional
import torch

logger = logging.getLogger("normwise.ml.reranker")

MODEL_NAME = os.getenv("MODEL_NAME", "BAAI/bge-reranker-v2-m3")
MODEL_MAX_LENGTH = int(os.getenv("MODEL_MAX_LENGTH", "512"))
DEVICE_CONFIG = os.getenv("DEVICE", "auto").lower()


def resolve_device() -> str:
    """Resolve compute device based on configuration and hardware availability."""
    if DEVICE_CONFIG == "cuda":
        return "cuda" if torch.cuda.is_available() else "cpu"
    elif DEVICE_CONFIG == "cpu":
        return "cpu"
    else:  # "auto"
        return "cuda" if torch.cuda.is_available() else "cpu"


class BGERerankerModel:
    """
    Singleton wrapper around sentence_transformers.CrossEncoder for BGE reranker.
    Loads the model lazily on first inference request and keeps it in memory.
    """
    _instance: Optional["BGERerankerModel"] = None

    def __init__(self, model_name: str = MODEL_NAME, max_length: int = MODEL_MAX_LENGTH):
        self.model_name = model_name
        self.max_length = max_length
        self.device = resolve_device()
        self._model = None
        self._is_loaded = False

    @classmethod
    def get_instance(cls) -> "BGERerankerModel":
        """Get or initialize singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset singleton instance (useful for testing)."""
        cls._instance = None

    @property
    def is_loaded(self) -> bool:
        """Check if model is currently loaded in memory."""
        return self._is_loaded

    def load(self) -> None:
        """Load cross-encoder model into memory."""
        if self._is_loaded and self._model is not None:
            return

        logger.info(
            f"Loading cross-encoder model '{self.model_name}' on device '{self.device}' "
            f"(max_length={self.max_length})..."
        )
        try:
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(
                self.model_name,
                max_length=self.max_length,
                device=self.device,
            )
            self._is_loaded = True
            logger.info(f"Cross-encoder model '{self.model_name}' loaded successfully on '{self.device}'.")
        except Exception as e:
            logger.error(f"Failed to load cross-encoder model '{self.model_name}': {e}", exc_info=True)
            self._model = None
            self._is_loaded = False
            raise RuntimeError(f"Failed to load reranker model '{self.model_name}': {str(e)}") from e

    def predict_scores(self, pairs: List[Tuple[str, str]], apply_sigmoid: bool = True) -> List[float]:
        """
        Compute relevance scores for a list of (query, candidate_text) pairs.

        Score Semantics:
          - When apply_sigmoid=True (default), raw logits are mapped via sigmoid into [0.0, 1.0].
            These are normalized relevance scores preserving ranking order, NOT calibrated probabilities.
          - When apply_sigmoid=False, raw uncalibrated cross-encoder logits are returned.

        Parameters:
            pairs: List of (query, candidate_text) tuples.
            apply_sigmoid: If True, maps logits to [0.0, 1.0] using sigmoid function.

        Returns:
            List of float relevance scores corresponding to each pair.
        """
        if not pairs:
            return []

        if not self._is_loaded or self._model is None:
            self.load()

        try:
            raw_scores = self._model.predict(pairs)

            # Standardize output to a Python list of floats
            if hasattr(raw_scores, "tolist"):
                scores_list = [float(s) for s in raw_scores.tolist()]
            elif isinstance(raw_scores, (list, tuple)):
                scores_list = [float(s) for s in raw_scores]
            else:
                scores_list = [float(raw_scores)]

            if apply_sigmoid:
                return [1.0 / (1.0 + math.exp(-s)) for s in scores_list]
            return scores_list
        except Exception as e:
            logger.error(f"Inference error during reranking: {e}", exc_info=True)
            raise RuntimeError(f"Reranker model inference failed: {str(e)}") from e
