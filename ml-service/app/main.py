"""
NormWise ML Service — FastAPI BGE Reranker
==========================================
Exposes reranking API for the NormWise Indian Standards Intelligence recommendation pipeline.

Active Model:
  BAAI/bge-reranker-v2-m3 (Cross-Encoder)
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.rerank import router as rerank_router
from app.models.reranker import MODEL_NAME

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

ACTIVE_RANKER = os.getenv("RANKER", "bge-reranker-v2-m3")

app = FastAPI(
    title="NormWise ML Service",
    description="Cross-Encoder Reranking Service for Indian Standards Recommendation Pipeline",
    version="0.2.0",
)

# CORS configuration for backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rerank_router, prefix="/api/v1")


@app.get("/health")
async def health():
    """Liveness probe. Does not trigger model loading."""
    return {"status": "ok", "service": "normwise-ml-service"}


@app.get("/version")
async def version():
    """Returns active service version and model configuration."""
    return {
        "service": "normwise-ml-service",
        "version": "0.2.0",
        "ranker": ACTIVE_RANKER,
        "model": MODEL_NAME,
    }
