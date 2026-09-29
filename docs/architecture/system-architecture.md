# NormWise — System Architecture

## 1. Overview

**NormWise** is an AI-powered recommendation engine that identifies applicable Indian Standards (BIS) for public and enterprise procurement specifications.

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React/Vite)                │
│    Requirement Entry  │  Recommendation  │  Review     │
└───────────────────────────┬────────────────────────────┘
                            │ REST / HTTP
┌───────────────────────────▼────────────────────────────┐
│              Node.js / Express Backend API             │
│   Controllers → Services Pipeline → Repositories       │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              │ SQL / Vector              │ REST (/rerank)
┌─────────────▼─────────────┐ ┌───────────▼──────────────┐
│  Supabase PostgreSQL      │ │ Python / FastAPI         │
│  • 8 Core Tables          │ │ ML Service               │
│  • pgvector Embedding     │ │ (Reranker)               │
│  • Supabase Storage       │ │                          │
└───────────────────────────┘ └──────────────────────────┘
```

## 3. Core Component Responsibilities

1. **Frontend (React + Tailwind CSS)**:
   - Thin presentation layer.
   - 3 Primary user screens: **Requirement**, **Recommendation**, **Review**.
   - Zero business/recommendation logic.

2. **Backend (Node.js + Express)**:
   - Central orchestration engine.
   - Manages the full recommendation pipeline: requirement extraction, candidate retrieval, ranking, validation, related standards, certification, evidence collection, and human review.

3. **Database (Supabase PostgreSQL)**:
   - Exactly 8 application tables.
   - Vector similarity search via `pgvector`.
   - Document specification storage in Supabase Storage.

4. **ML Service (Python / FastAPI)**:
   - Independent microservice for reranking.
   - Exposes `POST /rerank` with standard ranker abstraction (`PassthroughRanker`, `HuggingFaceRanker`, `FineTunedRanker`).
