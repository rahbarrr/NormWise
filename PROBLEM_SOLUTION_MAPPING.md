# NormWise: Problem-to-Solution Architecture Mapping

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Mapping Model:** Procurement Challenge $\rightarrow$ NormWise Capability $\rightarrow$ Technical Mechanism $\rightarrow$ Concrete User Benefit  

---

## Systematic Problem-Solution Matrix

| # | Public Procurement Challenge | Implemented NormWise Capability | Underlying Technical Mechanism | Concrete User Benefit |
|---|---|---|---|---|
| **1** | **Manual Standard Identification:** Officers manually search 20,000+ standards, taking hours to identify applicable codes. | AI-Powered Hybrid Recommendation Engine | 3-way retrieval (Structured + BM25 Lexical + pgvector Cosine Distance) fused via RRF. | Rapid discovery of candidate standards based on plain English or Indic tender text. |
| **2** | **Citing Superseded / Obsolete Standards:** Tenders cite outdated editions, risking vendor disqualification and disputes. | Lifecycle Currentness Validation & Replacement Routing | Relational status tracking (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`); supersede alert injection. | Eliminates obsolete standard citations; automatically promotes active editions. |
| **3** | **Missing Mandatory QCO Orders:** Failure to mandate compulsory ISI certification violates central ministry orders. | Deterministic QCO Compliance Rule Engine | Precondition rule engine evaluating statutory orders independently of probabilistic LLMs. | Alerts officers to compulsory ISI marking requirements before tender publication. |
| **4** | **Incomplete Specifications (Missing Material/Components):** Single-standard citations overlook critical raw materials and gaskets. | Relational Knowledge Graph (Allied Standards) | Directed graph in PostgreSQL `RelatedStandard` queried via recursive CTEs (depth $\le 3$). | Surfaces companion material (e.g. IS 6911) and component standards for full tender schedules. |
| **5** | **AI Hallucination & Fake Clauses:** Generic AI models invent non-existent standard numbers and fictitious clauses. | Evidence Traceability & Grounded Clause Binding | Verbatim clause storage; strict generative constraint binding recommendations to database records. | 100% auditable evidence; officers inspect exact official clause text before adoption. |
| **6** | **Underspecified / Ambiguous Requirements:** Broad descriptions lead generic search tools to return inappropriate standards. | Ambiguity Detection & Clarification Workflow | Missing attribute analysis triggers `CLARIFICATION_REQUIRED` and provides clarifying questions. | Prevents forced wrong matches; guides officers to provide missing engineering ratings. |
| **7** | **Language Barriers in Regional Procurement:** Tenders submitted in Hindi, Marathi, or Bengali fail on English portals. | Multilingual Normalization Engine | Regional technical lexicons and transliteration dictionaries mapping Indic text to standard terms. | Enables state and municipal officers to enter specifications in their native working language. |
| **8** | **Unstructured Tender PDFs / Scanned Schedules:** Specifications buried in multi-page tender documents require manual re-typing. | Document Intelligence & OCR Pipeline | Native PDF stream extraction (`pdf-parse`), DOCX AST parsing (`mammoth`), and OCR fallback (`tesseract.js`). | Ingests complex tender schedules directly into the recommendation engine. |
| **9** | **Lack of Post-Tender Auditability:** CAG and vigilance bodies cannot verify how standards were selected. | Immutable Statutory Audit Trail | PostgreSQL `AuditEvent` table recording recommendation generation, review notes, and timestamps. | Complete compliance defense during post-procurement vigilance and statutory audits. |
| **10** | **Lack of Accountability in Automated Tools:** "Black box" AI software makes decisions without human oversight. | Human-in-the-Loop Review Queue | Interactive verification checklist, reviewer notes, and formal RBAC sign-off (`APPROVE`/`REJECT`). | Ensures legal accountability remains firmly with the authorized human officer. |
