# NormWise End-to-End Procurement Intelligence Workflow (Phase 20)

This document formalizes the complete 12-step user journey implemented in **NormWise**, from initial identity authentication to final audit log generation.

---

## 🗺️ The 12-Step Procurement Journey

```text
 ┌───────────────┐       ┌────────────────┐       ┌────────────────┐
 │ 1. Login &    │  ───> │ 2. Input Spec  │  ───> │ 3. Language &  │
 │ Authentication│       │ or Upload Tender       │ Terminology    │
 └───────────────┘       └────────────────┘       └────────────────┘
                                                           │
                                                           ▼
 ┌───────────────┐       ┌────────────────┐       ┌────────────────┐
 │ 6. Evidence   │  <─── │ 5. Standards   │  <─── │ 4. Hybrid      │
 │ Justification │       │ Ranking Results│       │ Vector Search  │
 └───────────────┘       └────────────────┘       └────────────────┘
         │
         ▼
 ┌───────────────┐       ┌────────────────┐       ┌────────────────┐
 │ 7. Compliance │  ───> │ 8. Allied      │  ───> │ 9. Tender Doc  │
 │ Rule Engine   │       │ Standards Graph│       │ Export / GeM   │
 └───────────────┘       └────────────────┘       └────────────────┘
                                                           │
                                                           ▼
 ┌───────────────┐       ┌────────────────┐       ┌────────────────┐
 │ 12. Immutable │  <─── │ 11. Dual-Eye   │  <─── │ 10. Technical  │
 │ Audit Logging │       │ Review Decision│       │ Review Request │
 └───────────────┘       └────────────────┘       └────────────────┘
```

---

## 🔍 Detailed Step-by-Step Breakdown

### Step 1: Authentication & Identity Resolution
- Procurement officers log in securely using email/password.
- An HTTP-only secure cookie and companion anti-CSRF token are generated.
- Identity payload includes user role (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `ADMIN`, `AUDITOR`).

### Step 2: Requirement Input or Tender Document Upload
- Officers can type or paste specifications directly or upload tender documents (PDF, DOCX, TXT up to 15MB).
- Uploaded files are virus-scanned, size-validated, and stored securely in `UPLOAD_DIR`.

### Step 3: Multilingual Translation & Technical Terminology Normalization
- Officer text in Indic languages (Hindi, Marathi, Bengali, Tamil, etc.) is detected.
- Domain-specific terminology (e.g., *दाब कुकर* -> *Pressure Cooker*, *आईएसआई मार्क* -> *ISI Mark*) is preserved without loss or corrupt translation.

### Step 4: Hybrid Semantic Retrieval (pgvector + Text Search)
- Requirements are embedded and searched against the PostgreSQL standard catalog using pgvector cosine similarity.
- Full-text search filters candidates by title, keywords, and domain categories.

### Step 5: Multi-Factor Scoring & Ranked Standards Presentation
- Candidates are evaluated across:
  - Text & Semantic Similarity (35%)
  - Product Scope & Category Match (25%)
  - Material & Technical Parameter Match (20%)
  - Currentness & QCO Mandate Status (20%)
- The primary standard is recommended with confidence score, currentness badge (`CURRENT`, `WITHDRAWN`, `UNDER_REVISION`), and QCO certification status.

### Step 6: Evidence & Clause Traceability
- For the selected standard, specific normative clauses, verbatim excerpts, and test requirements are displayed.
- Clear rationale is presented for why lower-ranked alternatives were not selected.

### Step 7: Compliance Rule Evaluation
- Evaluates statutory requirements against the tender:
  - Compulsory ISI Certification check under Ministry / DPIIT QCOs.
  - Test report validity requirements (NABL accredited laboratories).
  - Material specification conformance (e.g., food-grade stainless steel).

### Step 8: Allied Standards & Knowledge Graph
- Connected standards are traversed:
  - Test method standards (e.g., tensile testing, hydrostatic testing).
  - Material standards (e.g., IS 6911 stainless steel plate).
  - Superseded or amending standards.

### Step 9: Tender Specification & GeM Clause Export
- Officers can copy or export pre-formatted tender clauses ready for insertion into Government e-Marketplace (GeM) tenders or CPPP bids.

### Step 10: Technical Review Submission
- The submitting officer flags the recommendation for technical review.
- The system prevents self-approval: only an officer with `TECHNICAL_REVIEWER` or `ADMIN` role can sign off.

### Step 11: Dual-Control Review Decision
- Technical Reviewer audits the clauses, completes review checklists, attaches review notes, and records a formal decision:
  - `ACCEPTED`
  - `REJECTED`
  - `MODIFICATIONS_REQUESTED`

### Step 12: Immutable Audit Trail Logging
- Every action (recommendation generated, document uploaded, review requested, review approved/rejected) is written to the append-only `AuditEvent` table with timestamp, user ID, IP address, and correlation `requestId`.
