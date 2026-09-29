# NormWise: Features Specification & System Capabilities

**Status:** Verified & Operational in Release `v1.0.0-sih2024`

---

## 1. Feature Verification Matrix

| Subsystem | Feature Capability | Implementation Detail | Backend API | Frontend View | Verification Test |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Requirement Ingestion** | Natural Language Parsing | Tokenization and parameter extraction | `POST /api/recommend` | Textarea Input | Verified |
| | Bilingual Ingestion | English and Hindi technical dictionary mapping | `multilingualNormalizationService` | Language selector pill | Verified |
| | Document Upload & OCR | PDF/DOCX ingestion with Tesseract.js fallback | `POST /api/documents/upload` | Upload modal | Verified |
| **Hybrid Retrieval** | Structured Filtering | Exact matching on product/material/application | `retrievalService.js` | Match Score Breakdown | Verified |
| | Lexical Search (FTS) | PostgreSQL `tsvector` BM25 ranking | `retrievalService.js` | Match Score Breakdown | Verified |
| | Semantic Vector Search | pgvector 1536-dim HNSW cosine distance | `retrievalService.js` | Vector similarity badge | Verified |
| | Multi-Factor Ranking | Weighted scoring: Product 30%, App 25%, Vec 20% | `standardRankingService.js` | Candidate rank order | Verified |
| **Safety & Grounding** | Currentness Validation | Revisions, amendments, supersession tracking | `currentnessService.js` | Emerald/Red status badges | Verified |
| | Out-of-Catalog Safety | Score $< 0.25$ triggers `NO_MATCH` | `recommendationService.js` | `NO_MATCH` notice card | Verified |
| | Verbatim Evidence | Authentic clause snippets linked to standard | `evidenceService.js` | Evidence Drawer | Verified |
| **Knowledge Graph** | Allied Standards Layer | Recursive CTE traversal of connected standards | `relatedStandardsService.js` | Relationship network | Verified |
| **Statutory Compliance**| QCO Rule Engine | Deterministic mapping of gazette QCO mandates | `complianceRuleService.js` | Mandatory QCO Card | Verified |
| **Governance & RBAC** | Multi-Role Access Control| 4 roles: Officer, Reviewer, Auditor, Admin | `authorizationMiddleware.js` | Role-based navigation | Verified |
| | Self-Approval Guardrail | Prevents officers approving own recommendations | `forbidSelfApproval` (403) | Disabled action buttons | Verified |
| **Audit & Security** | Immutable Audit Trail | SHA-256 tamper-evident event logging | `audit.controller.js` | Audit Timeline View | Verified |
