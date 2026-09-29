# NormWise

> **AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications**

NormWise is an intelligent compliance and recommendation platform designed for public and enterprise procurement officers. It analyzes procurement specifications, maps them to the Bureau of Indian Standards (BIS) repository, validates currentness and Quality Control Orders (QCO) mandates, and provides verifiable clause citations with human-in-the-loop technical review workflows.

---

## Architecture Overview

```
Frontend (React / Vite)
       │
       ▼ REST
Backend API (Node.js / Express)
       │
       ├─────────────────────────────────┐
       ▼ SQL / Vector                    ▼ REST (/rerank)
Supabase PostgreSQL               Python / FastAPI
(8-Table Architecture)            ML Service (Reranker)
```

### Recommendation Workflow

```
Requirement Entry ──▶ Requirement Processing ──▶ Candidate Retrieval
       │
       ▼
Ranking (Hybrid + ML) ──▶ Currentness Validation ──▶ Related Standards Graph
       │
       ▼
Certification / QCO Check ──▶ Grounded Evidence ──▶ Recommendation Output
       │
       ▼
Human Review ──▶ Immutable Audit Logging
```

---

## Repository Structure

```
normwise/
├── frontend/                     # React + Vite client (Thin UI)
│   ├── public/                   # Static assets & SVG icons
│   └── src/
│       ├── components/           # UI components
│       │   ├── common/           # Shared UI, layout & auth guards
│       │   ├── requirement/      # Requirement entry components
│       │   ├── recommendation/   # Results, cards & evidence drawers
│       │   └── review/           # Technical reviewer workflow
│       ├── pages/                # Primary product flows
│       │   ├── Requirement/      # Step 1: Input requirement
│       │   ├── Recommendation/   # Step 2: View results & evidence
│       │   └── Review/           # Step 3: Human decision queue
│       ├── services/api/         # Typed API clients
│       ├── hooks/                # Custom React hooks (useAuth)
│       ├── types/                # Frontend type definitions
│       ├── utils/                # Utility helpers & mock fallbacks
│       ├── constants/            # Client constants & routes
│       └── styles/               # Tailwind CSS stylesheets
│
├── backend/                      # Node.js + Express orchestration backend
│   ├── src/
│   │   ├── config/               # Environment & pipeline thresholds
│   │   ├── routes/               # Express route declarations
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── services/             # Modular recommendation pipeline
│   │   │   ├── requirement/      # Text normalization & extraction
│   │   │   ├── retrieval/        # FTS, keyword & vector search
│   │   │   ├── ranking/          # Multi-criteria scoring
│   │   │   ├── validation/       # Standard currentness checks
│   │   │   ├── related-standards/# Relationship graph traversal
│   │   │   ├── certification/    # QCO & ISI certification checks
│   │   │   ├── evidence/         # Grounded clause & evidence collection
│   │   │   └── recommendation/   # Pipeline orchestrator & review CRUD
│   │   ├── repositories/         # Database access layer
│   │   ├── models/               # Model definitions & table constants
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── middleware/           # Auth, rate limiting & error handling
│   │   └── utils/                # Response helpers
│   ├── tests/                    # Unit and integration tests
│   ├── scripts/                  # Management scripts
│   └── data/                     # Seed datasets and benchmarks
│
├── ml-service/                   # Python / FastAPI Reranking Microservice
│   ├── app/
│   │   ├── api/                  # FastAPI endpoints (/rerank)
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Ranker hierarchy (Passthrough, HF)
│   │   └── main.py               # Service entrypoint
│   ├── tests/                    # ML service unit tests
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile
│
├── supabase/                     # Supabase Database Migrations & Seeds
│   ├── migrations/               # Sequential SQL migrations (Sprint 1)
│   └── config.toml               # Local Supabase configuration
│
├── shared/                       # Cross-service types and constants
│   ├── constants/
│   └── types/
│
├── docs/                         # Technical documentation
│   ├── architecture/             # System & pipeline architecture
│   ├── database/                 # 8-Table schema definition
│   ├── ml/                       # ML & reranker documentation
│   └── api/                      # Recommendation REST API specification
│
├── tests/                        # Cross-service end-to-end tests
│   ├── e2e/                      # E2E workflow tests
│   └── fixtures/                 # Evaluation test fixtures
│
├── legacy/                       # Preserved non-MVP and historical modules
│
├── .env.example                  # Environment configuration template
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## 3-Screen MVP UI

The user experience centers around 3 primary screens:
1. **Requirement (`/recommend`)**: Enter procurement text or upload specification documents.
2. **Recommendation (`/results`)**: View matching standards, confidence scores, currentness badges, and grounded evidence.
3. **Review (`/review`)**: Procurement officer / technical reviewer approval workflow with audit trail.

---

## 8-Table MVP Database

The production MVP uses exactly 8 database tables:
1. `users`
2. `standards`
3. `recommendations`
4. `recommendation_standards`
5. `related_standards`
6. `evidence`
7. `documents`
8. `audit_events`

---

## Quick Start / Local Setup

### 1. Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- Docker (optional, for containerized run)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..

# ML Service
cd ml-service && pip install -r requirements.txt && cd ..
```

### 4. Running the Complete System
```bash
# Start Frontend & Backend concurrently
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

## Testing

```bash
# Frontend build & lint
npm run build --prefix frontend
npm run lint --prefix frontend

# Backend tests
npm test --prefix backend

# End-to-end fixture tests
npm run test:e2e
```

### Sprint 1 Supabase catalog

Apply `supabase/migrations/001_sprint1_eight_table_schema.sql` to the configured Supabase project, then run the server-side curated catalog workflow:

```powershell
npm run sprint1:seed --prefix backend
npm run sprint1:validate --prefix backend
npm run sprint1:test --prefix backend
```

See [docs/database/sprint1.md](docs/database/sprint1.md) and [docs/database/sprint1-verification.md](docs/database/sprint1-verification.md).
