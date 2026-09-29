# NormWise: Core Innovation Points & Technical Differentiators

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Standard of Proof:** All points below are fully implemented, verified, and demonstrated in the codebase.

---

## 1. Requirement-to-Standard Semantic Matching
Unlike legacy keyword search engines that fail when procurement officers describe items in colloquial terms, NormWise uses dense vector embeddings in `pgvector` to map procurement intent directly to BIS technical scopes (e.g. mapping *"mid-day school meal cooking vessel"* $\rightarrow$ `IS 2347:2023`).

## 2. 3-Way Hybrid Retrieval with Reciprocal Rank Fusion (RRF)
Combines structured BIS code lookups, PostgreSQL BM25 full-text search, and dense vector similarity. Reciprocal Rank Fusion combines precision on exact part numbers with semantic recall on variable tender phrasing, achieving **88.9% Recall@1** and **94.4% Recall@5**.

## 3. Currentness-Aware Recommendation Safety Invariant
Semantic similarity never overrides lifecycle status. When an outdated or superseded standard (e.g. `IS 2347:2014`) matches a query, NormWise flags it, promotes the active 2023 replacement, and attaches a prominent supersede alert.

## 4. Relational Knowledge Graph (Zero Neo4j)
Modeled directly in PostgreSQL using relational indexing and recursive CTEs. When a primary product standard is identified, the knowledge graph traverses depth $\le 3$ to automatically surface allied raw material standards, subcomponents, and test methods in sub-15ms queries.

## 5. End-to-End Evidence Traceability
Every recommendation links directly to official BIS gazette clauses, scope definitions, and verification excerpts viewable in a slide-out Evidence Drawer. The system strictly blocks generative free-form clause fabrication.

## 6. Deterministic QCO Compliance Engine
Statutory Quality Control Orders (QCOs) published by ministries are evaluated deterministically using structured condition logic. The LLM is strictly isolated and prohibited from altering statutory compliance determinations.

## 7. Multilingual Requirement Normalization
Accepts procurement tender text submitted in Hindi (HI), Marathi (MR), and Bengali (BN), normalizing regional vocabulary to standardized engineering terminology prior to hybrid retrieval.

## 8. Human-in-the-Loop Review & Governance
Provides a dedicated review canvas (`/review`) with interactive checklists, reviewer notes, and formal sign-offs (`APPROVE`, `REJECT`). Enforces strict Role-Based Access Control (RBAC).

## 9. Real-Case Evaluation & Quality Benchmarking Suite
Built-in evaluation framework featuring 20 real procurement cases, ground-truth stratification (`VERIFIED` vs `UNVERIFIED`), a 13-category error taxonomy, and live candidate strategy benchmarks.

## 10. Tamper-Evident Statutory Audit Trail
Chronological, append-only audit logging in PostgreSQL recording every recommendation, document upload, review event, and decision timestamp for CVC and CAG compliance.
