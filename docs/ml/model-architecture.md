# NormWise ML & Reranker Architecture

## Architecture

The ML service is an independent FastAPI microservice that provides ranking scores for candidate standards retrieved by the Node.js backend.

```
Node Backend ──── POST /api/v1/rerank ────▶ Python FastAPI ML Service
             ◀─── Ranked Candidate List ───
```

## Ranker Hierarchy

```python
Ranker (ABC)
├── PassthroughRanker   # Active MVP Default: returns candidates sorted by initial score
├── HuggingFaceRanker   # Sprint 8: BAAI/bge-reranker-base cross-encoder
└── FineTunedRanker     # Optional fine-tuned domain model placeholder
```

## Current Status

- **Sprint 0**: Structure established, `PassthroughRanker` active.
- **Sprint 8**: Optional fine-tuning and Hugging Face cross-encoder integration.
