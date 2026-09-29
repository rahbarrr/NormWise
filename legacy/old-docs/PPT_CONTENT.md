# NormWise: SIH 2024 Presentation Slide Package

**Target Presentation:** 12-Slide Final Pitch Deck  
**Guidelines:** Crisp, professional, evaluator-readable statements; zero unsupported claims.

---

### Slide 1: Title & Vision
- **Title:** NormWise
- **Subtitle:** AI-Powered Indian Standards Intelligence for Public Procurement
- **Team Name / Track:** Smart India Hackathon 2024
- **Core Vision:** Transforming public standards discovery from manual guesswork into a currentness-safe, evidence-backed, and auditable engineering workflow.

---

### Slide 2: The Core Procurement Challenges
- **Massive Catalog:** 20,000+ Indian Standards managed across hundreds of sectional committees.
- **Outdated Standards Risk:** Tenders frequently cite withdrawn or superseded specifications (e.g. 1992 codes).
- **Mandatory QCO Non-Compliance:** Unintentional omission of compulsory ISI mark certification under statutory Quality Control Orders.
- **AI Hallucination:** Generic LLMs invent fictitious standard numbers and fabricate nonexistent clauses.

---

### Slide 3: The Proposed Solution
- **Evidence-Backed Intelligence:** Matches procurement specifications to official Bureau of Indian Standards (BIS) specifications.
- **Hybrid Retrieval:** Structured matching + PostgreSQL BM25 full-text + dense vector embeddings via `pgvector`.
- **Currentness First:** Semantic similarity never overrides lifecycle status.
- **Deterministic Compliance:** Automated statutory QCO evaluation without LLM hallucination.
- **Human-in-the-Loop:** Verification checklists and immutable audit trails keep officers in legal control.

---

### Slide 4: How NormWise Works
- **Step 1:** Enter specification in plain English, Hindi, Marathi, Bengali, or upload PDF/DOCX.
- **Step 2:** System extracts structured engineering attributes (product, material, ratings).
- **Step 3:** 3-Way Hybrid Retrieval retrieves candidate standards and fuses them via Reciprocal Rank Fusion.
- **Step 4:** Lifecycle Currentness, Allied Standards, and QCO Compliance are evaluated.
- **Step 5:** Results are presented with full evidence, score breakdown, and human review routing.

---

### Slide 5: System Architecture
- **Consolidated Modern Stack:** React 19 + Node.js 20 Express + PostgreSQL 16 with native `pgvector` via Prisma ORM.
- **Architectural Feasibility:** **Zero MongoDB, Zero Neo4j** — All relational entities, full-text indexes, vector embeddings, and knowledge graph edges live in one unified PostgreSQL engine.
- **Sub-40ms Query Response:** Real-time multi-factor scoring and graph traversal.

---

### Slide 6: The Recommendation Engine
- **Three Retrieval Vectors:**
  - *Structured:* Exact code numbers and curated product aliases.
  - *Lexical:* BM25 keyword matching over standard titles and scopes.
  - *Semantic Vector:* `pgvector` dense cosine similarity for conceptual understanding.
- **Multi-Factor Score Merge:** Product Type (35%), Material (20%), Application (15%), Ratings (15%), Terminology (15%).
- **Uncertainty Handling:** Underspecified requirements safely return `CLARIFICATION_REQUIRED`.

---

### Slide 7: Evidence & Traceability
- **Zero Fabricated Clauses:** Verbatim clause extracts stored from official gazette publications.
- **Traceable Provenance:** Every recommendation displays standard edition, gazette date, amendment status, and clause excerpts.
- **Slide-out Evidence Drawer:** Officers click to read exact normative text before adopting tender clauses.

---

### Slide 8: Related Standards & Compliance
- **Relational Knowledge Graph:** Automatically retrieves companion raw materials (e.g. IS 6911 Stainless Steel) and components (e.g. IS 7466 Rubber Gaskets).
- **Deterministic QCO Enforcement:** Independent rule engine checks whether compulsory ISI marking applies under central ministry orders.
- **LLM Isolation:** The language model cannot override statutory compliance determinations.

---

### Slide 9: Human Review & Audit Governance
- **Assistive, Not Autonomous:** NormWise empowers the procurement officer; final statutory decisions remain with humans.
- **Review Queue Canvas:** Interactive verification checklists and contextual reviewer notes.
- **Immutable Audit Trail:** Append-only PostgreSQL logging for vigilance and CAG audit defense.

---

### Slide 10: Empirical Evaluation & Benchmarks
- **Real-Case Validation Corpus:** 20 authentic procurement specifications across 4 core domains.
- **Ground-Truth Stratification:** 19 verified cases (with official gazette citations) vs 1 unverified case.
- **Measured Performance (Run `aa676ed6`):**
  - **Recall@1:** **88.9%** (Primary recommendation accuracy)
  - **Recall@5:** **94.4%** (Candidate window retrieval)
  - **MRR:** **0.903** | **Currentness Violations:** **0**
- **Standardized Error Taxonomy:** 13 diagnostic error categories for systematic continuous improvement.

---

### Slide 11: Feasibility & Risk Management
- **Technical Feasibility:** Production-grade PostgreSQL + pgvector; zero exotic database dependencies.
- **Operational Feasibility:** Aligned with General Financial Rules (GFR) and Central Vigilance guidelines.
- **Pragmatic Risk Mitigation:**
  - Copyright risk managed by indexing public gazettes, titles, and scopes.
  - OCR degradation handled via confidence scoring and manual parameter verification.
  - Catalog boundaries explicitly disclosed (`Demo Data`, `NO_MATCH`).

---

### Slide 12: Impact & Roadmap
- **Immediate Impact:** Eliminates obsolete standards in tenders, prevents QCO non-compliance penalties, and drastically cuts specification drafting time.
- **Deployment Roadmap:**
  - Phase 1: Integration with GeM (Government e-Marketplace) buyer portal.
  - Phase 2: Live bidirectional sync with BIS Manakonline APIs.
  - Phase 3: Expansion of verified test cases to 500+ across all 15 BIS divisional councils.
