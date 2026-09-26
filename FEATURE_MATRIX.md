# NormWise: Comprehensive Feature Matrix

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Standard of Verification:** Source of truth for presentation slides and technical evaluation.

---

## Complete Feature Matrix

| Feature | Implemented? | Backend | Frontend | Database | Tested? | Demo Ready? | Notes |
|---|---|---|---|---|---|---|---|
| **Plain Text Requirement Input** | Yes | Yes | Yes | Yes | Yes | Yes | Real-time word count, token estimation, and validation. |
| **Document Upload (PDF/DOCX/TXT)**| Yes | Yes | Yes | Yes | Yes | Yes | Multi-format parsing with size validation (25MB limit). |
| **OCR for Scanned Tender Documents**| Yes | Yes | Yes | No | Yes | Yes | Local `tesseract.js` fallback for image-based PDFs. |
| **Attribute Extraction** | Yes | Yes | Yes | Yes | Yes | Yes | Parses product, material, application, and capacity. |
| **Structured Code Lookup** | Yes | Yes | Yes | Yes | Yes | Yes | Exact standard number and product alias indexing. |
| **PostgreSQL Lexical Search (BM25)**| Yes | Yes | Yes | Yes | Yes | Yes | GIN full-text index on title and scope text. |
| **Dense Vector Search (pgvector)** | Yes | Yes | Yes | Yes | Yes | Yes | 1536-dimensional embeddings with cosine distance. |
| **Reciprocal Rank Fusion (RRF)** | Yes | Yes | Yes | No | Yes | Yes | Multi-vector candidate ranking and score fusion. |
| **Lifecycle Currentness Checking** | Yes | Yes | Yes | Yes | Yes | Yes | Identifies active, superseded, and withdrawn standards. |
| **Superseded Standard Routing** | Yes | Yes | Yes | Yes | Yes | Yes | Blocks outdated primary rec; promotes active edition. |
| **Allied Standards Knowledge Graph**| Yes | Yes | Yes | Yes | Yes | Yes | Recursive CTE traversal (depth $\le 3$) for materials/components. |
| **Deterministic QCO Enforcement** | Yes | Yes | Yes | Yes | Yes | Yes | Evaluates statutory ministry orders; zero LLM override. |
| **Normative Clause Evidence Binding**| Yes | Yes | Yes | Yes | Yes | Yes | Verbatim clause storage; slide-out Evidence Drawer. |
| **Multilingual Normalization** | Yes | Yes | Yes | No | Yes | Yes | Translates & normalizes Hindi, Marathi, and Bengali tenders. |
| **Uncertainty UX / Clarifications**| Yes | Yes | Yes | Yes | Yes | Yes | Returns `CLARIFICATION_REQUIRED` on underspecified input. |
| **"Why This Standard?" Breakdown**| Yes | Yes | Yes | No | Yes | Yes | Displays product, material, and application component scores. |
| **Human Review Workflow** | Yes | Yes | Yes | Yes | Yes | Yes | Review queue, verification checklists, reviewer notes. |
| **Formal Decision Persistence** | Yes | Yes | Yes | Yes | Yes | Yes | `APPROVE` / `REJECT` sign-offs stored in PostgreSQL. |
| **Statutory Audit Trail** | Yes | Yes | Yes | Yes | Yes | Yes | Append-only `AuditEvent` logging with actor and timestamp. |
| **RBAC Security (4 Roles)** | Yes | Yes | Yes | Yes | Yes | Yes | Officer, Reviewer, Admin, and Auditor role enforcement. |
| **Session Cookie Authentication** | Yes | Yes | Yes | Yes | Yes | Yes | HTTP-only, SameSite=Strict cookies with anti-CSRF token. |
| **Admin Evaluation Dashboard** | Yes | Yes | Yes | Yes | Yes | Yes | 8-tab analytical dashboard benchmarking Recall@K & MRR. |
| **Automated CLI Benchmark Suite** | Yes | Yes | No | Yes | Yes | Yes | `npm run evaluate:all` with 13-category error taxonomy. |
| **System Health Probes** | Yes | Yes | No | Yes | Yes | Yes | `GET /api/health/demo` probes all components. |
| **One-Command Demo Setup** | Yes | Yes | Yes | Yes | Yes | Yes | `npm run setup:demo` syncs DB and seeds catalog in <10s. |
| **Live BIS Portal Sync** | Planned | No | No | No | No | No | Post-hackathon feature requiring official BIS agreement. |
