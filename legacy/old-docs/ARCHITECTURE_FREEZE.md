# NormWise Architecture Freeze Specification

**Status:** LOCKED & FROZEN FOR SIH DEMONSTRATION  
**Product:** NormWise (AI-Powered Indian Standards Intelligence Engine)  
**Date of Freeze:** September 26, 2026  
**Target Environment:** SIH 2024 / Production Evaluation  

---

## 1. Architecture Freeze Declaration

The software architecture, data store layer, external interface contracts, and core engine pipelines of NormWise are formally **FROZEN** for the Smart India Hackathon (SIH) final demonstration and evaluation.

### Database & Storage Invariants
- **Primary Relational & Vector Store:** **PostgreSQL 16** with the official `pgvector` extension.
- **ORM & Schema Management:** **Prisma ORM** (v5.20.0).
- **Prohibited Technologies:**
  - **No MongoDB / Mongoose:** Strictly prohibited; zero NoSQL document stores exist in the dependency tree or codebase.
  - **No Neo4j / Graph Databases:** Strictly prohibited; knowledge graph relationships are modeled natively in PostgreSQL using recursive CTEs and relational indexing.
  - **No Mock In-Memory Databases:** All operational state persists in PostgreSQL.

---

## 2. End-to-End System Topology

```text
                                [ CLIENT BROWSER ]
                                        │
                         HTTPS / TLS (Port 443 / 5173)
                                        │
                                        ▼
                             [ NGINX REVERSE PROXY ]
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
       [ FRONTEND APPLICATION ]                       [ BACKEND API SERVER ]
        React 19 + Vite + Tailwind                     Node.js 20 + Express 4.21
        Client-Side Routing (v7)                       Stateless RESTful Endpoints
        Modular Evaluation & Audit                     RBAC & Security Middlewares
                 │                                             │
                 └──────────────────────┬──────────────────────┘
                                        │
                                        ▼
                              [ PRISMA ORM LAYER ]
                           Schema Validation & Queries
                                        │
                                        ▼
                         [ POSTGRESQL 16 + pgvector ]
                     ├── Relational Tables (Standards, Rules)
                     ├── Dense Vector Embeddings (1536-dim)
                     ├── Full-Text Search (tsvector GIN)
                     └── Knowledge Graph (StandardRelationship)
```

---

## 3. Subsystem Architecture Specifications

### 3.1. Frontend Architecture
- **Framework:** React 19 with Vite 8 fast build engine.
- **Styling:** Tailwind CSS with consistent UI component primitives.
- **State Management & Routing:** React Router v7 (`BrowserRouter`) with protected route wrappers (`RequireAuth`).
- **Pages & Views:**
  - `/` (Landing & System Overview)
  - `/login` (Evaluator & Officer Authentication)
  - `/dashboard` (Procurement Officer Workspace & Quick Actions)
  - `/new-recommendation` (Requirement Specification & Tender Input)
  - `/results/:id` (Primary Results Canvas: Recommendation, Why This Standard, Evidence, Currentness, Allied Standards, Compliance, Review Decision)
  - `/history` (Procurement Recommendation History & Status Tracking)
  - `/admin/evaluation` (Evaluation Benchmark Dashboard with 8 Analytical Views)
  - `/admin/audit` (Statutory Audit Trail & Security Log Viewer)
  - `/standards` (BIS Catalog Directory & Knowledge Graph Explorer)

### 3.2. Backend Architecture
- **Runtime:** Node.js 20 LTS (ES Modules).
- **Web Framework:** Express 4.21 with production middlewares:
  - `helmet`: HTTP security headers (CSP, HSTS, X-Content-Type-Options).
  - `cors`: Strict origin validation with credential support.
  - `cookie-parser`: Secure HTTP-only session cookies (`SameSite=Strict`).
  - `zod`: Request payload schema validation and sanitization.
  - Rate Limiting: IP-based burst and window rate limits on auth and API endpoints.

### 3.3. Hybrid Retrieval Architecture
NormWise utilizes a 3-way hybrid candidate generation pipeline followed by Reciprocal Rank Fusion (RRF):
1. **Structured Matching:** Exact code number, title key, and product alias lookups.
2. **Lexical Retrieval:** PostgreSQL full-text search (`to_tsvector` / `websearch_to_tsquery`) with English and Hindi configuration dictionaries.
3. **Semantic Vector Retrieval:** `pgvector` dense vector cosine similarity ($1 - \text{cosine\_distance}$) over clause embeddings.
4. **Candidate Fusion & Scoring:** RRF ranking merged with multi-factor scoring (Product Type: 0.35, Material: 0.20, Application: 0.15, Ratings: 0.15, Terminology: 0.15).

### 3.4. Lifecycle & Currentness Safety
- **Strict Invariant:** Semantic match score NEVER overrides standard currentness.
- Standards categorized as `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, or `UNKNOWN`.
- Obsolete standards automatically surface active replacements with prominent warning advisories.

### 3.5. Knowledge Graph & Allied Standards
- Stored relationally in `StandardRelationship` table:
  - `sourceStandardId`, `targetStandardId`, `relationshipType` (`Test Method`, `Safety`, `Installation`, `Component`, `Material`, `Normative Reference`, `Equivalent`, `Superseded By`, `Mandatory Under`).
- Traversal depth capped at $\le 3$ with cycle detection.

### 3.6. Deterministic Compliance Engine
- Statutory Quality Control Orders (QCOs) evaluated deterministically via `complianceRuleService.js`.
- **Integrity Rule:** The LLM is strictly prohibited from overriding or altering deterministic QCO applicability outcomes (`POTENTIALLY_APPLICABLE`, `REQUIRES_REVIEW`, `NOT_IDENTIFIED`, `INSUFFICIENT_EVIDENCE`).

### 3.7. Document Intelligence Pipeline
- Accepts procurement tenders in `.pdf`, `.docx`, `.txt`.
- PDF text extraction with metadata parsing; scanned documents processed via `tesseract.js` OCR fallback.
- Extracted sections fed into the requirement analysis pipeline without synthetic fabrication.

### 3.8. Evaluation & Benchmarking Subsystem
- **Evaluation Dataset:** 20 real procurement cases in `server/data/evaluation/real-case/`.
- **Ground-Truth Stratification:** `VERIFIED` (19 cases) vs `UNVERIFIED` (1 case). Unverified cases excluded from precision/recall calculations.
- **Standardized Error Taxonomy:** 13 categories (`ATTRIBUTE_EXTRACTION_ERROR`, `LEXICAL_RETRIEVAL_ERROR`, `SEMANTIC_RETRIEVAL_ERROR`, `CURRENTNESS_ERROR`, `RELATIONSHIP_ERROR`, `COMPLIANCE_ERROR`, `EVIDENCE_ERROR`, `AMBIGUOUS_HANDLING_ERROR`, `MULTILINGUAL_ERROR`, `NO_MATCH_HANDLING_ERROR`, `DATASET_GAP`, `SOURCE_GAP`, `CONFIGURATION_ERROR`).

---

## 4. Technology Stack Verification Matrix

| Component | Authorized Technology | Prohibited Alternatives | Verification Status |
|---|---|---|---|
| Frontend UI | React 19 + Tailwind CSS | Legacy jQuery, Angular | Verified |
| Backend API | Node.js + Express | Python Flask, PHP | Verified |
| Relational DB | PostgreSQL 16 | MySQL, Oracle | Verified |
| Vector Store | PostgreSQL pgvector | Pinecone, Milvus, Chroma | Verified |
| Document Store | PostgreSQL JSONB | MongoDB, CouchDB | Verified (Zero MongoDB) |
| Graph Store | PostgreSQL Relational CTEs | Neo4j, Amazon Neptune | Verified (Zero Neo4j) |
| ORM | Prisma 5.20.0 | TypeORM, Sequelize | Verified |

---

*Architecture locked and certified for SIH 2024 final submission.*
