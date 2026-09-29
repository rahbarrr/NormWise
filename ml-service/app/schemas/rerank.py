"""
Pydantic schemas for the NormWise reranker API.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class Candidate(BaseModel):
    """A candidate standard to be reranked."""
    id: str = Field(..., description="Standard UUID or identifier")
    standard_number: str = Field(..., description="BIS standard number, e.g. IS 2347:2023")
    title: str = Field(..., description="Standard title")
    description: Optional[str] = Field(None, description="Standard scope or description")
    initial_score: Optional[float] = Field(None, description="Initial retrieval score from first-stage retrieval")


class RerankRequest(BaseModel):
    """Request body for the /rerank endpoint."""
    query: str = Field(
        ...,
        description="The procurement requirement text (normalized)",
        min_length=1,
    )
    candidates: List[Candidate] = Field(
        ...,
        description="Candidate standards to rerank",
        min_length=1,
        max_length=50,
    )
    top_k: int = Field(
        10,
        description="Number of top results to return",
        ge=1,
        le=50,
    )

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Query must not be empty or whitespace only.")
        return v.strip()


class RankedCandidate(BaseModel):
    """A reranked candidate with score and rank position."""
    id: str
    standard_number: str
    title: str
    rerank_score: float = Field(
        ...,
        description=(
            "Sigmoid-normalized relevance score in [0.0, 1.0]. "
            "Note: this is a monotonic ranking relevance score and NOT a calibrated probability."
        ),
    )
    rank: int = Field(..., description="1-based rank position")
    ranker: str = Field("bge-reranker-v2-m3", description="Ranker identifier used for this result")


class RerankResponse(BaseModel):
    """Response from the /rerank endpoint."""
    query: str
    results: List[RankedCandidate]
    ranker_used: str
    model_name: Optional[str] = None
    note: Optional[str] = None
