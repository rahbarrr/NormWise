# NormWise: AI Safety Guardrails & Hallucination Controls

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Safety Protocol:** Grounded Verification & Zero-Fabrication Architecture  

---

## 1. Overview of Guardrails

In government procurement, hallucinating non-existent Bureau of Indian Standards (BIS) numbers or fabricating legal certification mandates exposes public bodies to severe financial, legal, and operational risks.

NormWise prevents hallucinations through **ten architecturally enforced safeguards**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TEN IMPLEMENTED AI GUARDRAILS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Evidence-Grounded Generation   │ 6. Deterministic QCO Rule Engine        │
│ 2. Zero Fabricated Clauses        │ 7. Transparent Uncertainty States       │
│ 3. Zero Unsupported Quotations    │ 8. Mandatory Human-in-the-Loop          │
│ 4. Structured Candidate Retrieval │ 9. Immutable Statutory Audit Trail      │
│ 5. Lifecycle Currentness Filter   │ 10. Explicit Dataset Provenance         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Technical Guardrails

### 1. Evidence-Grounded Generation
All generated explanations and recommendation summaries must bind directly to pre-ingested, verified records in the PostgreSQL database. The LLM is restricted from generating free-form standard citations that do not resolve to an active primary key in the `Standard` table.

### 2. Zero Fabricated Clauses
Normative clauses (e.g. Clause 4.1 on material grades or Clause 5 on testing pressure) are stored as verbatim text extracted from official gazettes and standards. The system does not allow generative rewriting of technical clause specifications.

### 3. Zero Unsupported Quotations
Any excerpt displayed in the UI or exported into a tender specification must be accompanied by its verified clause title, standard edition, and gazette publication date. Unverified or synthetic quotations are strictly blocked.

### 4. Structured Candidate Retrieval
Instead of asking an LLM to "guess" an Indian Standard from memory, candidates are retrieved deterministically through exact code matching, PostgreSQL BM25 full-text indexing, and `pgvector` dense vector similarity. The LLM only analyzes pre-retrieved candidates.

### 5. Lifecycle Currentness Validation
Semantic similarity scores NEVER override lifecycle status. If an outdated standard (e.g. `IS 2347:2014`) matches a query, the system identifies that it is superseded, promotes the active 2023 edition, and attaches a prominent supersede alert.

### 6. Deterministic Compliance Rule Engine
Statutory Quality Control Orders (QCOs) published by ministries (such as DPIIT or MeitY) are evaluated deterministically using structured condition logic in `complianceRuleService.js`. The LLM is architecturally isolated and prohibited from altering compliance determinations.

### 7. Transparent Uncertainty States
When requirements omit critical engineering parameters (e.g. *"Need standard for a pressure cooker"* lacking capacity or material), NormWise does NOT force an unverified match. It returns `CLARIFICATION_REQUIRED`, outlines missing attributes, and provides clarifying questions.

### 8. Mandatory Human-in-the-Loop Governance
Recommendations require technical reviewer verification. Reviewers complete interactive checklists, examine normative clauses in the Evidence Drawer, and record formal sign-off.

### 9. Immutable Statutory Audit Trail
Every recommendation, document parse, review decision, and status transition is recorded in the PostgreSQL `AuditEvent` table with actor identity, timestamp, and tamper-evident metadata.

### 10. Explicit Dataset Provenance
Demo standards, emerging technologies, and verified ground-truth cases are explicitly labeled (e.g. `Demo Data`, `VERIFIED`, `UNVERIFIED`). Unverified records are excluded from precision/recall metrics.
