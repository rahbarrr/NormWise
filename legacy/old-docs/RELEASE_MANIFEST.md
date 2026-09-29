# NormWise SIH Release Manifest

**Release Name:** NormWise SIH 2024 Frozen Edition  
**Release Tag / Identifier:** `v1.0.0-sih2024`  
**Base Git Commit:** `d205aeb`  
**Release Timestamp:** 2026-09-26T22:00:00+05:30  
**Target Event:** Smart India Hackathon 2024 Grand Finale

---

## 1. Version Identifiers

| Component | Identifier | Description |
| :--- | :--- | :--- |
| **Application Release** | `v1.0.0-sih2024` | Core frozen web application and services |
| **Database Schema** | `20260926_init_schema` | Prisma relational PostgreSQL + pgvector migration |
| **Standards Dataset** | `dataset-v2.1` | Curated authorized demonstration standards catalog |
| **Evaluation Suite** | `eval-phase21-v1.0` | 20 real-world public procurement benchmark cases |
| **Frontend Bundle** | `vite-v8.3.1-dist` | Optimized React 19 production build (`dist/`) |
| **Docker Base** | `postgres:16-alpine` + `pgvector/pgvector:pg16` | Containerized database and vector engine |

---

## 2. Component Checksums & File Registry

| File / Component Path | Purpose | Verification Status |
| :--- | :--- | :---: |
| `server/prisma/schema.prisma` | PostgreSQL relational schema & enums | **VERIFIED** |
| `server/src/services/recommendationService.js` | 13-stage recommendation orchestrator | **VERIFIED** |
| `server/src/services/retrievalService.js` | Tri-engine hybrid retrieval (Structured/BM25/pgvector) | **VERIFIED** |
| `server/src/services/currentnessService.js` | Standard lifecycle & supersession validator | **VERIFIED** |
| `server/src/services/complianceRuleService.js` | Deterministic Quality Control Order (QCO) engine | **VERIFIED** |
| `server/src/services/relatedStandardsService.js` | PostgreSQL recursive CTE knowledge graph | **VERIFIED** |
| `server/src/services/evidenceService.js` | Verbatim clause citation & grounding service | **VERIFIED** |
| `server/src/middleware/authorizationMiddleware.js` | Server-side RBAC & self-approval guardrail | **VERIFIED** |
| `server/tests/redteam.test.js` | 15 adversarial security attack tests | **VERIFIED** |
| `client/src/App.jsx` | React root navigation & route protection | **VERIFIED** |

---

## 3. Technology Stack Invariants

- **Web Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend API:** Node.js 20, Express, Zod validation, Helmet security.
- **Persistence & ORM:** Prisma ORM, PostgreSQL 16.
- **Vector Search:** `pgvector` HNSW index with 1536-dimensional cosine distance.
- **Graph Processing:** PostgreSQL native recursive Common Table Expressions (`WITH RECURSIVE`).
- **Forbidden Dependencies Confirmed Absent:**
  - `mongodb` package: **NOT INSTALLED**
  - `neo4j-driver` package: **NOT INSTALLED**
