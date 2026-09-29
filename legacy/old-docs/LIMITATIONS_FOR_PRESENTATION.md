# NormWise: System Limitations (Presentation Slide Content)

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Slide Purpose:** Clear, honest disclosure for Hackathon Judges and Procurement Evaluators  

---

## Slide Content: Known Limitations & System Boundaries

### 1. Catalog Coverage Depends on Authorized Ingestion
- Current database indexes **83 curated Bureau of Indian Standards (BIS)** across core public procurement categories.
- Requirements for unindexed specialized domains (aerospace, cryogenic valves) safely return `NO_MATCH` or `INSUFFICIENT_EVIDENCE`.

### 2. Standards Lifecycle & Gazette Dynamics
- Standards change through revisions, amendments, and sectional committee withdrawals.
- While the active catalog reflects published gazette orders up to 2024, real-time live synchronization requires official BIS API integration.

### 3. Ambiguous Requirements Require User Clarification
- Underspecified tenders lacking critical dimensions, wattage, or material grades cannot produce an authoritative single match.
- The engine prompts for clarification (`CLARIFICATION_REQUIRED`) rather than guessing.

### 4. OCR Sensitivity on Degraded Documents
- Scanned tender PDFs processed via OCR (`tesseract.js`) require at least 200 DPI resolution.
- Degraded photocopies or unaligned tables require manual verification of extracted numbers.

### 5. Compliance Assessment Requires Formal Review
- The deterministic compliance engine models active statutory QCOs for core categories.
- Special ministerial waivers, MSME exemptions, or defense exemptions require human legal officer verification.

### 6. Preliminary Evaluation Corpus
- Empirical validation is based on **20 real procurement cases** (19 verified).
- Full statistical generalization across all 20,000+ Indian Standards requires ongoing dataset expansion.

---

> **Key Evaluator Takeaway:**  
> NormWise does not claim to replace procurement committees or autonomously approve contracts. It is an **assistive intelligence tool** designed to accelerate standards discovery, highlight regulatory risks, and maintain complete auditability.
