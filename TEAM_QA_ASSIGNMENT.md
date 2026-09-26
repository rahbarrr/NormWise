# NormWise SIH 2024: Team Q&A Assignment Matrix

**Strategy:** Clean, confident division of jury questions to prevent team members talking over one another or showing hesitation during evaluation.

---

## Conceptual Role Assignments

### 1. Primary Presenter (Problem Statement & Demo Flow Lead)
- **Primary Domains:**
  - Public procurement problems (GeM indents, supplier challenges).
  - Step-by-step live demo walkthrough (`FINAL_5_MINUTE_DEMO.md`).
  - Business impact and time savings in tender preparation.
- **Assigned Question Categories:**
  - Round 1: Basic understanding (Q1–Q7).
  - Round 11: Demo interruptions and navigation requests.
  - Overall pitch opening and closing remarks.

### 2. Technical Architect (Architecture, AI & Retrieval Lead)
- **Primary Domains:**
  - Unified PostgreSQL 16 + pgvector stack.
  - Absence of MongoDB and Neo4j (recursive CTE graph mechanics).
  - Tri-engine hybrid retrieval (Structured + Lexical + pgvector HNSW).
  - Hallucination prevention and prompt-injection defense.
- **Assigned Question Categories:**
  - Round 2: System processing pipeline (Q1–Q5).
  - Round 3: AI & retrieval mechanics (Q1–Q10).
  - Round 6: Architecture choices (Q1–Q10).
  - Technical deep-dives on scalability and containerization.

### 3. Data & Standards Lead (Standards Catalog, Currentness & Provenance)
- **Primary Domains:**
  - BIS dataset provenance, metadata structure, and licensing boundaries.
  - Active, superseded, and withdrawn standard lifecycle states.
  - Amendment tracking and sectional committee updates.
  - Allied standards relationships (raw materials, components, testing).
- **Assigned Question Categories:**
  - Round 4: Data questions and copyright/licensing (Q1–Q9).
  - Round 2: Currentness validation (Q6–Q7).
  - Handling out-of-catalog and unindexed standards.

### 4. Evaluation & Metrics Lead (Benchmark Rigor & Limitations)
- **Primary Domains:**
  - Empirical evaluation benchmark (`eval-phase21-v1.0`).
  - Accuracy metrics: Recall@1 (88.9%), Recall@5 (94.4%), MRR (0.903).
  - Baseline comparison (Hybrid vs Vector vs Lexical vs Structured).
  - Error analysis of the 2 failure cases (`rc-out-001` and `rc-cmt-002`).
- **Assigned Question Categories:**
  - Round 5: Recommendation quality and metrics (Q1–Q10).
  - Defense of sample sizes and preliminary evaluation status.

### 5. Governance & Compliance Lead (QCO Rules, Human Review & Audit)
- **Primary Domains:**
  - Deterministic Quality Control Orders (QCO) and statutory gazette citations.
  - Human-in-the-loop review governance and review statuses.
  - Server-side RBAC and officer self-approval prevention (`forbidSelfApproval`).
  - Cryptographic SHA-256 tamper-evident audit trail.
- **Assigned Question Categories:**
  - Round 7: Statutory compliance questions (Q1–Q6).
  - Round 8: Human review and auditability (Q1–Q6).
  - Vigilance and General Financial Rules (GFR 2017) compliance.
