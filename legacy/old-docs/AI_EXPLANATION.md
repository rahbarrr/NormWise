# NormWise: Architectural Division — Deterministic Logic vs. AI-Assisted Intelligence

**Core Philosophy:** In public procurement and statutory compliance, non-deterministic AI must never make unchecked decisions. NormWise strictly segregates **AI-Assisted Discovery** from **Deterministic Validation & Governance**.

---

## 1. Where AI / Machine Learning Is Applied

| AI / Semantic Component | Mechanism / Model | Purpose in System | Fallback / Guardrail |
| :--- | :--- | :--- | :--- |
| **Multilingual Requirement Understanding** | Cross-lingual embedding alignment & Devanagari technical token mapping | Bridges vocabulary differences between colloquial tender phrasing (English/Hindi) and official BIS standard terminology. | Controlled technical dictionaries and unit protection tokens (`TOKEN_UNIT_XXX`). |
| **Semantic Vector Retrieval** | 1536-dimensional dense embeddings with `pgvector` HNSW cosine distance search | Captures conceptual similarity when a procurement indent describes a product without mentioning the official BIS title. | Hard threshold cutoff ($< 0.25$ triggers `NO_MATCH`); combined with structured and lexical matching. |
| **Document OCR Feature Extraction** | Tesseract.js neural OCR engine | Extracts raw text from scanned, non-searchable PDF and rasterized image tender indents. | Editable Attribute Review card allows officer to correct OCR misreads before retrieval. |

---

## 2. Where Deterministic Logic Is Strictly Enforced

| Deterministic Subsystem | Mechanism | Why Non-Deterministic AI Is Forbidden Here |
| :--- | :--- | :--- |
| **Currentness & Lifecycle Engine** | Relational status checks (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`), amendment dates, and successor pointers in PostgreSQL | An obsolete standard cannot be made "current" by semantic similarity. Obsolescence is a legal binary fact. |
| **Statutory QCO Compliance Engine** | Deterministic rule engine (`complianceRuleService.js`) matching standard numbers to Gazette Quality Control Orders | Statutory certification mandates are legal requirements under Section 16 of the BIS Act. AI hallucination here creates criminal/legal liabilities. |
| **Allied Standards Knowledge Graph** | PostgreSQL recursive Common Table Expressions (`WITH RECURSIVE`) up to depth 3 | Relational dependency between product standards, raw materials (`IS 6911`), and test methods (`IS 513`) is normative and exact. |
| **Candidate Scoring & Ambiguity Detection** | Weighted arithmetic formula ($0.30 \times P + 0.25 \times A + 0.20 \times V + 0.15 \times M + 0.10 \times T$) | Ensures predictable, reproducible scoring; score gap $< 0.06$ deterministically triggers `CLARIFICATION_REQUIRED`. |
| **Evidence Assembly & Justification** | Grounded template engine extracting verbatim clauses from database records | Prevents generative hallucination of fake clauses (e.g., "Clause 99.4") or invented test thresholds. |
| **Authorization & Separation of Duties** | Server-side Express middleware (`forbidSelfApproval`) enforcing RBAC across 4 roles | A procurement officer cannot legally approve their own indent under General Financial Rules (GFR 2017). |
| **Audit Trail & Event Logging** | Append-only database table with cryptographic SHA-256 event integrity hashing | Vigilance compliance requires an immutable, tamper-evident record of all human decisions and timestamps. |

---

## Summary for Evaluators

NormWise uses AI solely for **discovery and semantic matching** where natural language ambiguity exists. It relies on **100% deterministic code** for scoring formulas, statutory compliance, currentness safety, evidence linking, and procurement governance.
