# NormWise SIH Release 1.0 — Release Notes

**Release Identifier:** `v1.0.0-sih2024`  
**Release Name:** NormWise Frozen SIH 2024 Edition  
**Release Date:** September 26, 2026  
**Target Event:** Smart India Hackathon 2024 Final Evaluation  
**Architecture:** React 19 + Vite + Tailwind CSS | Node.js 20 + Express API | Prisma ORM | PostgreSQL 16 + pgvector

---

## 1. Executive Summary

NormWise Release 1.0 represents the final frozen build of the AI-powered Indian Standards recommendation engine developed for public procurement specification identification. The system is engineered to solve the real-world challenge faced by procurement officials on portals like GeM (Government e-Marketplace) in discovering, verifying, and citing applicable Indian Standards (IS), ensuring Quality Control Order (QCO) compliance, and preserving immutable audit traceability.

---

## 2. Major Implemented Capabilities

### A. Requirement Processing & Attribute Extraction
- **Natural Language Parsing:** Direct entry of tender descriptions, indents, or specifications.
- **Multilingual Normalization:** English and Hindi terminology mapping (e.g., *कुकर* $\rightarrow$ *pressure cooker*, *स्टेनलेस स्टील* $\rightarrow$ *stainless steel*) with technical unit preservation.
- **Structured Attribute Decomposition:** Deterministic extraction of Product, Material Grade, Capacity/Rating, Application Duty, and Technical Parameters.
- **Document Ingestion & OCR:** PDF and DOCX document upload with PDF.js and Tesseract.js fallback for scanned indents.

### B. Hybrid Retrieval & Candidate Scoring
- **Tri-Engine Retrieval:** 
  1. *Structured Matching:* Relational filtering across product, material, and application columns.
  2. *Lexical Full-Text Search:* PostgreSQL `tsvector` / BM25 term weighting on standard titles and keywords.
  3. *Dense Vector Search:* pgvector 1536-dimensional cosine similarity over standard scope text.
- **Multi-Factor Ranking:** Weighted scoring combining product match (30%), application (25%), semantic vector similarity (20%), material grade (15%), and technical parameters (10%).

### C. Safety, Currentness & Lifecycle Verification
- **Currentness Validation:** Independent evaluation of standard lifecycle states (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNKNOWN`).
- **Supersession Defense:** Obsolete standards are automatically blocked from primary recommendation and redirected to active replacements (e.g., `IS 2347:2017` $\rightarrow$ `IS 2347:2023`).
- **Out-of-Catalog Safety:** Strict threshold cutoff ($< 0.25$) returns `NO_MATCH` with 0% false confidence on out-of-scope tenders.

### D. Allied Standards & Knowledge Graph
- **Relational Knowledge Graph:** Multi-hop relationship traversal implemented via PostgreSQL recursive Common Table Expressions (`WITH RECURSIVE`).
- **Allied Domains:** Links primary product standards to raw material specifications (e.g., `IS 6911`), component standards (e.g., `IS 7466`), and test methods (`IS 513`).

### E. Deterministic Statutory Compliance (QCO)
- **Quality Control Order Engine:** Evaluates mandatory certification orders (DPIIT, Ministry of Steel) against standard numbers and product types.
- **Grounded Status:** Differentiates `MANDATORY_QCO`, `VOLUNTARY_CERTIFICATION`, and `REQUIRES_REVIEW` with official statutory order citations.

### F. Human-in-the-Loop Governance & Audit Trail
- **Independent Technical Review:** Four distinct user roles (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `AUDITOR`, `ADMIN`).
- **Self-Approval Guardrail:** Procurement officers are strictly forbidden from approving their own authored recommendations (HTTP 403 `SELF_APPROVAL_FORBIDDEN`).
- **Immutable Audit Trail:** Cryptographic SHA-256 tamper-evident event logging tracking every creation, review checklist, note, and acceptance decision.

---

## 3. Verified System Versions

- **Application Release:** `v1.0.0-sih2024`
- **Database Schema Version:** `20260926_init_schema` (Prisma ORM)
- **Standards Dataset Version:** `dataset-v2.1`
- **Evaluation Benchmark Suite:** `eval-phase21-v1.0` (20 verified real-world cases)
- **Automated Tests:** **203 tests passing** across 18 test suites (`npm test`)

---

## 4. Known Boundaries & Limitations

1. **Catalog Domain Scope:** Demonstration repository covers a curated selection of Indian Standards across 6 major procurement domains (Kitchenware, Electrical/Lighting, Piping, Transformers, Cement, Personal Safety). Unindexed standards trigger `NO_MATCH`.
2. **Dynamic Standards Amendments:** Standards amendments are sourced from the snapshot catalog and require periodic synchronization with BIS gazette notifications.
3. **No Autonomous Legal Certification:** Recommendation scores are internal matching signals. Statutory liability remains with the human procurement reviewer.

---

## 5. Known Blockers

- **Zero Demo Blockers:** No P0 or P1 blockers exist in the release build.

---

## 6. Demo Configuration

- **Backend Port:** `http://localhost:5001`
- **Frontend Port:** `http://localhost:5173`
- **Database:** PostgreSQL 16 on `localhost:5432` with `pgvector` enabled.
- **Default Officer Account:** `officer@normwise.gov.in` / `Password123!`
- **Default Reviewer Account:** `reviewer@normwise.gov.in` / `Password123!`
