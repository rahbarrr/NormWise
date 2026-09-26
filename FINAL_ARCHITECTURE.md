# NormWise: Final System Architecture

**Document Version:** 1.0.0 (SIH 2024 Final Submission)  
**Architecture Status:** Production Design / Locked & Verified  
**Database Engine:** PostgreSQL 16 + native `pgvector`  

---

## 1. System Topology Overview

NormWise is structured as a modular, three-tier enterprise web application designed for high-throughput public procurement workflows, auditable record persistence, and sub-40ms standards intelligence queries:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                    │
│   React 19 SPA (Vite 8, Tailwind CSS v4, React Router v7, Lucide Icons)     │
│   ├── Officer Recommendation Canvas   ├── Human Reviewer Queue              │
│   ├── Document Intelligence Workspace ├── Evaluation Benchmark Dashboard    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / TLS (JSON / REST API)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API GATEWAY & WEB TIER                          │
│   Node.js 20 LTS + Express.js 4.21 Application Server                       │
│   ├── Security Middlewares (Helmet CSP, CORS Allowlist, Rate Limiters)      │
│   ├── Session & Auth (HTTP-Only Secure Cookies, SameSite=Strict, CSRF)     │
│   └── Input Validation & Sanitization (Zod Schemas)                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE SERVICES LAYER                               │
│   ├── requirementAnalysisService   : NLP & Attribute Extraction             │
│   ├── multilingualService          : Indic Transliteration & Normalization  │
│   ├── documentProcessingService    : PDF/DOCX Parsing & OCR Extraction      │
│   ├── recommendationService        : 3-Way Candidate Retrieval & RRF Fusion │
│   ├── currentnessService           : Lifecycle Invariants & Replacement     │
│   ├── relationshipService          : Knowledge Graph Traversal (Depth <= 3) │
│   ├── complianceRuleService        : Deterministic QCO Evaluation           │
│   ├── evidenceService              : Normative Clause Binding & Provenance  │
│   └── evaluationService            : Real-Case Quality Benchmarking         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma ORM (v5.20+)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL 16 DATA TIER                             │
│   ├── Relational Store: Standards, Amendments, Users, Sessions, Audits      │
│   ├── Full-Text Search: GIN Indexes on to_tsvector(title || ' ' || scope)   │
│   ├── Dense Vector Store: pgvector Extension (1536-dim Cosine Distance)     │
│   ├── Knowledge Graph: StandardRelationship Table with Recursive CTEs       │
│   └── Rule Repository: Statutory QCO Orders & Precondition Schemas          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Processing Path

Every procurement specification submitted to NormWise progresses through twelve distinct, deterministic processing stages:

```text
[1. Procurement Requirement / Tender Document]
                     │
                     ▼
[2. Multilingual Normalization] ────────► (Hindi, Marathi, Bengali normalized to standard terms)
                     │
                     ▼
[3. Attribute Extraction] ──────────────► (Product, Material, Application, Capacity, Ratings)
                     │
                     ▼
[4. 3-Way Candidate Retrieval]
   ├── Structured Code Match ───────────► (IS 2347, IS 10322 exact lookup)
   ├── PostgreSQL Lexical Search ───────► (BM25 full-text matching over titles & scopes)
   └── Dense Vector Search ─────────────► (pgvector cosine similarity on semantic intent)
                     │
                     ▼
[5. Reciprocal Rank Fusion (RRF)] ──────► (Merged candidates ranked via multi-factor weights)
                     │
                     ▼
[6. Currentness Safety Filter] ─────────► (CURRENT vs SUPERSEDED vs WITHDRAWN; promote active)
                     │
                     ▼
[7. Knowledge Graph Traversal] ─────────► (Retrieve allied materials, components, test methods)
                     │
                     ▼
[8. Deterministic QCO Evaluation] ──────► (Evaluate statutory orders; isolated from LLM)
                     │
                     ▼
[9. Evidence Grounding & Traceability] ─► (Bind recommendations to official BIS clauses)
                     │
                     ▼
[10. Grounded Recommendation Canvas] ───► (Render Results, "Why this standard?", Trust Badges)
                     │
                     ▼
[11. Human Compliance Review Queue] ────► (Reviewer inspects evidence, completes checklist)
                     │
                     ▼
[12. Immutable Statutory Audit Trail] ──► (Persist decision, timestamp, actor ID in PostgreSQL)
```

---

## 3. Detailed Subsystem Implementation

### 3.1. Client Tier (Frontend SPA)
Built using React 19, Vite, and Tailwind CSS. All application routes are guarded with authentication wrappers (`RequireAuth`). State management relies on native React hooks (`useState`, `useCallback`, `useContext`) backed by clean service abstractions in `src/services/api.js`.

### 3.2. Server & Middleware Tier
Runs on Node.js 20 LTS and Express.js 4.21. Security hardening includes:
- **Helmet:** Content Security Policy and HTTP protection headers.
- **CORS:** Strict origin allowlist with credential validation.
- **Anti-CSRF:** Double-submit cookie verification on all POST/PATCH/DELETE endpoints.
- **Rate Limiting:** Sliding-window rate limiters protecting authentication routes and file upload endpoints.

### 3.3. Hybrid Retrieval & Ranking Engine
Unlike single-strategy search systems, NormWise generates candidate standards across three complementary vectors:
1. **Structured Search:** Instant exact code matching on standard numbers and product aliases.
2. **Lexical BM25 Search:** Full-text PostgreSQL search matching official BIS terminology and technical clauses.
3. **Dense Vector Search:** Vector embeddings indexed via `pgvector` HNSW indexes computing cosine distance to capture semantic equivalents.
4. **Reciprocal Rank Fusion (RRF):** Merges rankings with calibrated weights: Product Type (0.35), Material (0.20), Application (0.15), Ratings (0.15), Terminology (0.15).

### 3.4. Relational Knowledge Graph (Zero Neo4j)
Allied standards (raw materials, components, test methods, safety rules) are stored natively in the `RelatedStandard` PostgreSQL table. Traversal queries execute via recursive Common Table Expressions (CTEs) capped at depth $\le 3$, returning connected standards in under 15ms.

### 3.5. Deterministic Compliance Engine
Statutory Quality Control Orders (QCOs) published by ministries are evaluated deterministically via `complianceRuleService.js`. The engine matches extracted attributes against statutory condition sets. The LLM is architecturally isolated and prohibited from altering compliance determinations.

### 3.6. Persistent Storage & pgvector (Zero MongoDB)
All operational data, user credentials, sessions, documents, standard metadata, clause embeddings, and audit trails reside in a single **PostgreSQL 16** database.
