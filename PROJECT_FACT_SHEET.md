# NormWise: Project Fact Sheet

**Product Name:** NormWise  
**Product Tagline:** AI-Powered Indian Standards Intelligence Engine for Public Procurement  
**Primary Domain:** Public Procurement, Government Tenders, Standards Conformity, Regulatory Compliance  
**Target Event:** Smart India Hackathon (SIH) 2024 / Final Submission  
**Implementation Status:** SIH Demo Ready & Fully Operational  

---

## 1. The Problem

Public procurement officers across Indian government entities (including the Government e-Marketplace [GeM], Indian Railways, CPWD, Defence, and State Undertakings) must specify exact Bureau of Indian Standards (BIS) specifications for thousands of tenders. In practice, procurement teams face substantial systemic challenges:

1. **Massive Standards Catalog:** Over 20,000 active Indian Standards exist across hundreds of sectional technical committees, making manual identification slow and prone to oversight.
2. **Obsolete & Superseded Citations:** Tenders frequently cite withdrawn or superseded standards (e.g. citing an obsolete 1992 standard), creating legal disputes, vendor rejection risks, and tender cancellations.
3. **Mandatory QCO Compliance Bottlenecks:** Central ministries publish statutory Quality Control Orders (QCOs) mandating compulsory ISI mark certification under penalty of law. Discovering which specific QCO applies to an exact product grade is complex and manual.
4. **Generic AI Hallucinations:** Conventional large language models hallucinate non-existent standard numbers, invent fabricated clauses, and quote false certification requirements.

---

## 2. The Solution

NormWise is an evidence-backed standards intelligence platform that bridges natural language procurement requirements with official Bureau of Indian Standards (BIS) specifications and statutory QCO mandates.

- **Hybrid Standards Retrieval:** Combines structured code lookups, PostgreSQL BM25 full-text keyword search, and dense semantic vector similarity via `pgvector` and Reciprocal Rank Fusion (RRF).
- **Currentness Safety Guarantee:** Internal matching score NEVER overrides lifecycle currentness. Superseded standards automatically surface their active replacement with prominent warnings.
- **Relational Knowledge Graph:** Surfaces allied raw materials, components, and test method standards stored natively in PostgreSQL.
- **Deterministic Compliance:** Evaluates statutory QCO rules through deterministic rule engines isolated from probabilistic LLM generation.
- **Traceable Ground Truth:** Every recommendation links to verified BIS gazette clauses, scope definitions, and verification excerpts.
- **Human-in-the-Loop Governance:** Mandatory reviewer checklists, sign-offs, and an immutable statutory audit trail ensure human oversight remains central.

---

## 3. Primary User Personas

| User Persona | Key Organizational Role | Primary NormWise Interaction |
|---|---|---|
| **Procurement Officer** | Central/State Procurement Executive, GeM Buyer | Enters requirements, reviews AI-generated candidate standards, inspects "Why this standard?", requests technical review. |
| **Technical Reviewer** | Sectional Engineer, Standards Specialist | Inspects normative clauses in the Evidence Drawer, verifies checklist items, submits formal review decisions (`APPROVE`, `REJECT`, `NEEDS_REVISION`). |
| **Tender / Evaluation Committee** | Bid Evaluation Committee, Tender Approver | Reviews tender-ready compliance clauses, evaluates allied component standards, confirms QCO statutory requirements. |
| **Statutory Compliance Auditor** | Vigilance Officer, CAG Auditor, Quality Auditor | Inspects the immutable chronological audit trail (`/admin/audit`), verifying evidence provenance and decision timestamps. |
| **System Administrator** | IT Administrator, Data Steward | Ingests new standards, monitors system health probes (`/api/health/demo`), and runs benchmark evaluations (`/admin/evaluation`). |

---

## 4. Core Implemented Capabilities (100% Operational & Verified)

All capabilities listed below are fully implemented, verified, and tested in the active codebase:

1. **Requirement Input Canvas:** Rich text entry with real-time character/word counts, language auto-detection, and three evaluator-ready demonstration presets (Clear, Allied, Ambiguous).
2. **Document Processing Pipeline:** Uploads `.pdf`, `.docx`, or `.txt` tender schedules up to 25MB, parses text streams, and extracts technical specifications with OCR fallback (`tesseract.js`).
3. **Structured Requirement Extraction:** Automatically extracts product type, material grade, application context, capacity ratings, and operational parameters.
4. **Hybrid Retrieval Engine:** Three-way candidate generation combining Structured code match + PostgreSQL full-text (BM25) + dense vector similarity (`pgvector`) via Reciprocal Rank Fusion.
5. **Semantic Matching:** Dense embedding cosine similarity matching technical intent even when procurement text uses colloquial or non-standard synonyms.
6. **Lifecycle Currentness Checking:** Rigorously classifies standards as `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, or `UNKNOWN`. Superseded citations automatically link to active successors.
7. **Allied Standards Knowledge Graph:** Traverses relational graph connections in PostgreSQL (depth $\le 3$) to retrieve connected raw materials, components, and test methods.
8. **Deterministic Compliance Rule Engine:** Independent evaluation of statutory Quality Control Orders (QCOs) with zero probabilistic LLM override.
9. **Evidence Traceability:** Every recommendation links to verified clauses, gazette notifications, and exact text excerpts viewable in a slide-out drawer.
10. **Multilingual Normalization:** Ingests and normalizes tender specifications submitted in Hindi (HI), Marathi (MR), and Bengali (BN).
11. **Human Compliance Review Workflow:** Complete review queue (`/review`) with interactive verification checklists, reviewer notes, and persisted decisions.
12. **Statutory Audit Trail:** Chronological, tamper-evident log recording every recommendation, document upload, review event, and administrative action.
13. **Real-Case Evaluation Framework:** Built-in benchmarking suite with 20 real procurement cases, 13 standardized error categories, and live recall/MRR calculation.

---

## 5. Technology Stack Summary

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend API:** Node.js 20 LTS, Express.js 4.21 REST API
- **Database:** PostgreSQL 16 with native `pgvector` extension
- **ORM:** Prisma ORM 5.20+
- **Architectural Constraints Verified:** **Zero MongoDB, Zero Neo4j** (fully relational & vector in PostgreSQL).
