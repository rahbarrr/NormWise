# NormWise ML Service — Cross-Encoder Reranker

## Purpose

The **NormWise ML Service** is a dedicated Python/FastAPI microservice providing second-stage neural reranking for the NormWise Indian Standards Recommendation Engine.

It takes candidate standards retrieved from first-stage search (Structured + PostgreSQL FTS + pgvector) and scores them against the procurement specification using a cross-encoder model.

---

## Architecture

```
Node.js / Express Backend
         │
         │ POST /api/v1/rerank (top 20 candidates)
         ▼
FastAPI ML Service (Port 8000)
         │
         ▼
Pydantic Request Validation (1 to 50 candidates, top_k in [1, 50])
         │
         ▼
BGERanker Service (app/services/ranker.py)
         │
         ▼
BGERerankerModel Singleton (app/models/reranker.py)
         │
         ▼
BAAI/bge-reranker-v2-m3 (sentence-transformers CrossEncoder)
         │
         ▼
Sigmoid-Normalized Relevance Scoring & Descending Sort
         │
         ▼
JSON Response with 1-based Ranks (top 5 returned)
```

---

## Model Information

- **Model Identifier:** `BAAI/bge-reranker-v2-m3`
- **Model Type:** Multi-lingual Cross-Encoder (Sentence Transformers)
- **Max Sequence Length:** 512 tokens
- **Model Source & Attribution:** Beijing Academy of Artificial Intelligence (BAAI)
- **Model License:** Apache-2.0

---

## Score Interpretation

- Output scores in `results[].rerank_score` are **sigmoid-normalized relevance scores** in the range `[0.0, 1.0]`.
- **Note:** These scores preserve monotonic ranking relevance for candidate comparison and are **NOT calibrated probabilities**. They should not be interpreted as absolute percentage likelihoods. Applicability in the backend pipeline is determined strictly by the **rank order**.

---

## Hardware & Resource Requirements

| Resource | Minimum | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Compute** | 2 vCPUs | 4+ vCPUs | CPU execution is standard; GPU is optional. |
| **RAM** | 4 GB | 8 GB | ~2.2 GB resident model weights in memory; ~3.2 GB peak during inference. |
| **Disk** | 5 GB | 10 GB | Base image + dependencies (~1.8 GB) + Hugging Face cache (~2.3 GB). |
| **Workers** | 1 Worker | 1 Worker | **Important:** Run with 1 Uvicorn worker to prevent duplicating the 2.2 GB model in RAM. |

---

## Running with Docker (Recommended for Production)

### 1. Build the Docker Image
```bash
docker build -t normwise-ml-service:latest ml-service/
```

### 2. Run the Container
```bash
docker run --rm -d \
  --name normwise-ml-service \
  -p 8000:8000 \
  -v huggingface-cache:/root/.cache/huggingface \
  normwise-ml-service:latest
```
*(Mounting the `huggingface-cache` volume ensures the model weights are downloaded once and persisted across container restarts).*

---

## Local Setup & Virtual Environment

### 1. Environment Setup
```bash
cd ml-service

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `MODEL_NAME` | `BAAI/bge-reranker-v2-m3` | Hugging Face model repository ID |
| `MODEL_MAX_LENGTH` | `512` | Maximum token length for cross-encoder |
| `DEVICE` | `auto` | Compute device: `auto`, `cpu`, or `cuda` |
| `RANKER` | `bge-reranker-v2-m3` | Active ranker: `bge-reranker-v2-m3` or `passthrough` |
| `PORT` | `8000` | Server listening port |

### 3. Start Local Server
```bash
# Production command (single worker, no reload):
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Development command (with hot reload):
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## API Specification

### Endpoints Overview

| Method | Endpoint | Description | Model Loading |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Liveness health check (`{"status": "ok"}`) | No |
| `GET` | `/version` | Service version, active ranker, and model ID | No |
| `GET` | `/docs` | OpenAPI / Swagger interactive documentation | No |
| `POST` | `/api/v1/rerank` | Rerank candidates for procurement query | Yes (on first call) |

---

### `POST /api/v1/rerank`

#### Request Body
```json
{
  "query": "5 litre stainless steel pressure cooker for institutional kitchen",
  "candidates": [
    {
      "id": "std-001",
      "standard_number": "IS 2347:2023",
      "title": "Domestic Pressure Cookers - Specification",
      "description": "Requirements for construction and safety devices for pressure cookers.",
      "initial_score": 0.85
    },
    {
      "id": "std-002",
      "standard_number": "IS 14756:2022",
      "title": "Stainless Steel Cookware - Specification",
      "description": "Requirements for domestic and commercial stainless steel cookware.",
      "initial_score": 0.72
    }
  ],
  "top_k": 5
}
```

#### Response Body
```json
{
  "query": "5 litre stainless steel pressure cooker for institutional kitchen",
  "results": [
    {
      "id": "std-001",
      "standard_number": "IS 2347:2023",
      "title": "Domestic Pressure Cookers - Specification",
      "rerank_score": 0.500662,
      "rank": 1,
      "ranker": "bge-reranker-v2-m3"
    },
    {
      "id": "std-002",
      "standard_number": "IS 14756:2022",
      "title": "Stainless Steel Cookware - Specification",
      "rerank_score": 0.500565,
      "rank": 2,
      "ranker": "bge-reranker-v2-m3"
    }
  ],
  "ranker_used": "bge-reranker-v2-m3",
  "model_name": "BAAI/bge-reranker-v2-m3",
  "note": "Reranked 2 candidate(s) to top 2 result(s)."
}
```

---

## Model Lifecycle & Cold-Start Behavior

1. **Singleton Management:** The model is managed as a thread-safe singleton (`BGERerankerModel.get_instance()`).
2. **Lazy Initialization:** The model is loaded into memory on the first request to `/api/v1/rerank` and stays resident in RAM.
3. **Cold-Start Latency:** The very first inference request in an un-cached environment downloads model weights (~2.2 GB) taking ~15–30s. Subsequent inference requests take **~0.2s–0.8s**.
4. **Health Check Isolation:** `GET /health` and `GET /version` execute in $<5\text{ms}$ and do not trigger model loading.

---

## Testing

### Automated Unit Tests (Fast, Model Mocked)
```bash
pytest tests/ -v
```
*Unit tests use mocked inference and will NOT download or load the model.*

### Real Model Smoke Test
```bash
python test_reranker.py
```
*Loads the real `BAAI/bge-reranker-v2-m3` weights and validates end-to-end forward inference, scoring, sorting, and top-k slicing.*

### Domain Evaluation
```bash
python -m app.evaluation.evaluate
```
*Runs the 25-query domain evaluation dataset against the active cross-encoder and outputs P@1, P@5, MRR, and failure analysis.*
