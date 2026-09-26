# NormWise Phase 24: Final Blockers & Risk Registry

**Assessment Scope:** Pre-SIH Evaluation Red-Team Audit  
**Date:** September 2026  
**Auditor Status:** Red-Team Evaluator Review Complete

---

## Blocker Status Declaration

> **No known demo-blocking issues identified during the red-team audit.**

The core end-to-end user workflow:
```
Login → Requirement Input → Extraction → Hybrid Recommendation → "Why This Standard?" 
→ Currentness → Evidence Drawer → Allied Standards → QCO Compliance → Human Review 
→ Decision → Immutable Audit Log
```
has been verified end-to-end across multiple test runs, automated suites (203/203 passing tests), and clean-environment deployment checks.

*(Note: While zero demo-blocking defects exist, the project does not claim absolute bug-free status or complete coverage of all ~20,000 Indian Standards. Real-world boundaries are tracked below.)*

---

## Non-Blocking Operational & Scope Boundaries

While no P0 blockers prevent an SIH demonstration, the following technical and operational considerations are formally tracked for team awareness:

### Boundary NB-01: Dataset Scope Boundary
- **Severity:** P2 (Noticeable Scope Boundary)
- **Description:** NormWise demonstration database covers a curated set of Indian Standards across 6 major procurement domains (Kitchenware, Electrical/Lighting, Piping/Plumbing, Transformers/Power, Cement/Construction, Personal Safety). Queries outside these domains will trigger `NO_MATCH` or `CLARIFICATION_REQUIRED`.
- **Impact on SIH Demo:** None, provided the live demonstration utilizes verified procurement cases (e.g., Pressure Cooker, BLDC Fan, LED Street Light, HDPE Pipe).
- **Workaround / Defense:** Evaluator Q&A explicitly discloses dataset boundaries and demonstrates the system's safe failure mode (`NO_MATCH` with 0% false confidence).

### Boundary NB-02: External OCR Dependency on Low-DPI Scans
- **Severity:** P2 (Operational Consideration)
- **Description:** Ingesting blurred, low-resolution (<150 DPI) or handwritten PDF indents relies on client-side or server-side OCR via Tesseract.js, which may introduce character substitution errors.
- **Impact on SIH Demo:** None for standard electronic PDFs or text indents.
- **Workaround / Defense:** The UI features an editable Attribute Review card where the procurement officer can inspect and adjust extracted parameters before triggering the recommendation engine.

### Boundary NB-03: Mobile Viewport Horizontal Scrolling for Audit Table
- **Severity:** P3 (Cosmetic / UX)
- **Description:** On mobile viewports under 768px wide, wide multi-column data tables (Audit Log and Clause Compliance Matrix) require horizontal swiping.
- **Impact on SIH Demo:** Minimal. SIH evaluations are conducted on projector displays, laptops, or desktop monitors (1366x768 or 1920x1080).
- **Workaround / Defense:** All presentation and demonstration scripts are optimized for desktop browser viewports.

---

## Summary Matrix

| ID | Priority | Description | Demo Impact | Status |
| :---: | :---: | :--- | :---: | :---: |
| — | **P0** | *No P0 blockers identified* | None | **CLEARED** |
| NB-01 | **P2** | Catalog coverage limited to authorized demonstration domain | None for demo cases | **DOCUMENTED** |
| NB-02 | **P2** | OCR quality variance on degraded scans | None for text/digital PDFs | **DOCUMENTED** |
| NB-03 | **P3** | Mobile viewport table horizontal scrolling | None for laptop/projector demo | **DOCUMENTED** |
