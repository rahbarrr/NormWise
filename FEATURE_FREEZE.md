# NormWise Phase 25: Feature Freeze & Boundary Registry

**Freeze Status:** **FROZEN** (No new feature development permitted)  
**Release Tag:** `v1.0.0-sih2024`  
**Date:** September 26, 2026

---

## 1. Implemented Features (Verified in Code & Tested)

The following capabilities are fully implemented in the frontend, backend API, PostgreSQL persistence layer, and backed by automated tests:

1. **Procurement Requirement Input:**
   - Multi-line specification textarea with character count and validation.
   - Sample indent pre-population for rapid evaluator demonstration.
   - Bilingual support (English and Hindi script input).

2. **Attribute Extraction Pipeline:**
   - Deterministic extraction of Product, Material Grade, Capacity, Application, and Technical Characteristics.
   - Interactive Attribute Review card enabling procurement officer correction before retrieval.

3. **Document Processing & OCR:**
   - PDF and DOCX document file upload with MIME-type and 10 MB size validation.
   - Text parsing via `pdf-parse` and `mammoth`.
   - Optical Character Recognition (OCR) fallback via `tesseract.js` for scanned documents.
   - Directory traversal protection in local storage.

4. **Hybrid Candidate Retrieval Engine:**
   - Structured attribute exact/synonym matching.
   - Full-text search on PostgreSQL `tsvector` with Indian Standard terminology weighting.
   - Dense semantic vector search via `pgvector` HNSW index on 1536-dimensional embeddings.
   - Candidate list deduplication and merging.

5. **Multi-Factor Candidate Ranking:**
   - Configurable weighted scoring engine (Product 30%, Application 25%, Vector 20%, Material 15%, Technical 10%).
   - Ambiguity detection when score gap between top two candidates is $< 0.06$.
   - Hard score cutoff ($< 0.25$) triggering `NO_MATCH` status.

6. **Currentness & Lifecycle Verification:**
   - Independent verification of status (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNKNOWN`).
   - Replacement pointer logic directing users from superseded standards to active revisions.
   - Direct rejection of obsolete standards as primary recommendations.

7. **Allied Standards & Knowledge Graph:**
   - PostgreSQL relational table `RelatedStandard` queried using recursive Common Table Expressions (`WITH RECURSIVE`).
   - Traversal depth capped at 3 to prevent runaway queries.
   - Linkage across raw materials, gaskets, components, and test methods.

8. **Deterministic Compliance & QCO Rules:**
   - Rule engine mapping Quality Control Orders (QCOs) to standard numbers and categories.
   - Categorization into `MANDATORY_QCO`, `VOLUNTARY_CERTIFICATION`, and `REQUIRES_REVIEW`.
   - Explicit disclaimers on non-statutory decision-support role.

9. **Evidence Traceability & Grounded Explanations:**
   - Verbatim clause numbers, titles, and text snippets linked to recommendations.
   - Template-grounded explanation generation eliminating prompt injection hallucination.
   - Transparent display of `Pending Ingestion` when evidence is missing.

10. **Human-in-the-Loop Review Workflow:**
    - Role-based review lifecycle states (`PENDING_REVIEW`, `ACCEPTED`, `UNDER_TECHNICAL_REVIEW`, `CLARIFICATION_REQUESTED`, `NOT_APPLICABLE`).
    - Verification checklist enforcement.
    - Server-side self-approval guardrail blocking procurement officers from approving their own records.

11. **Cryptographic Audit Trail:**
    - Tamper-evident logging of every critical state change in `AuditEvent`.
    - Append-only API endpoints preventing log modification or deletion.
    - Audit log viewer with filters by action, actor, and date.

12. **Security & Session Authentication:**
    - Argon2id password hashing and Iron Session cookie management.
    - Granular permission mapping across 4 roles (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `AUDITOR`, `ADMIN`).
    - CSRF protection and auth endpoint rate limiting.

13. **Empirical Evaluation Framework:**
    - CLI batch evaluation runners (`npm run evaluate:all`).
    - 20 verified real-world benchmark cases measuring Recall@1, Recall@5, MRR, and currentness safety.

---

## 2. Partial Features (Functionally Bound)

1. **Multilingual Ingestion:**
   - *Status:* **Partial (English & Hindi)**
   - *Current Implementation:* Full automated normalization and translation for Hindi (Devanagari script) and English. 
   - *Boundary:* Regional Indian languages (Tamil, Telugu, Bengali, Gujarati) have terminology dictionaries indexed, but connective sentence translation defaults to English keywords.

2. **OCR Image Pre-processing:**
   - *Status:* **Partial (Single-page / Standard Resolution)**
   - *Current Implementation:* OCR parses standard PDF page images and extracts readable text.
   - *Boundary:* Severely skewed or handwritten documents may produce partial attribute extraction requiring manual officer correction.

---

## 3. Not Implemented in Release 1.0

1. **Direct Live BIS Website Scraping:**
   - *Status:* **Not Implemented (By Design)**
   - *Rationale:* Live scraping during tender evaluation introduces unpredictable latency, network fragility, and terms-of-service violations. NormWise relies on an authorized, ingested relational snapshot.

2. **Autonomous Tender Disqualification:**
   - *Status:* **Not Implemented (By Design)**
   - *Rationale:* Public procurement rules mandate that disqualification decisions remain the legal responsibility of the Tender Evaluation Committee.

---

## 4. Future Scope (Post-SIH Roadmap)

The following items are designated exclusively as **Future Scope** and must not be described as currently operational:

1. **Full-Catalog National Ingestion:** Expansion from the demonstration catalog of verified standards to the complete national repository of ~20,000 active Indian Standards under authorized data-sharing agreements with BIS.
2. **Automated GeM Bid API Integration:** Direct integration into the Government e-Marketplace (GeM) seller indent portal to suggest applicable standards during tender creation.
3. **Advanced Multilingual LLM Translation:** Incorporation of Bhashini API integration for all 22 scheduled Indian languages.
4. **Offline Mobile Inspection Client:** Offline PWA for site inspectors verifying standard marks at physical warehouse deliveries.
