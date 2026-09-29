# NormWise Regression Bugs & Boundary Disclosures (Phase 30)

**Document:** Regression Bug & Scope Boundary Classification  
**Phase:** 30 — Complete Regression & Release Candidate Verification  
**Standard:** Rigorous Codebase Testing  
**Release Tag:** `v1.0.0-sih2024`  

---

## Severity Definitions
- **P0:** System unusable / core workflow blocked (Prevents demonstration, build, database, recommendation, or authentication).
- **P1:** Major feature broken with no workaround.
- **P2:** Important operational scope boundary or functional limitation (documented and defended).
- **P3:** Minor cosmetic, layout, or enhancement consideration.

---

## Regression Bug & Boundary Matrix

| ID | Severity | Area | Reproduction | Expected | Actual | Status |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **BUG-001** | P0 | — | *None* | Zero critical blockers. | Zero critical blockers found. | **NO BUG** |
| **BUG-002** | P1 | — | *None* | Zero unmitigated P1 defects. | Zero unmitigated P1 defects. | **NO BUG** |
| **BND-001** | P2 | Standards Ingestion Scope | Query tender outside the 6 seeded procurement domains (e.g., aerospace titanium alloy). | System returns appropriate outcome (`NO_MATCH` or `CLARIFICATION_REQUIRED`). | Catalog seeds 19 standards across 6 sectors; national BIS scaling requires data license. Evaluator defense slide 11 discloses scope. | **DISCLOSED BOUNDARY** |
| **BND-002** | P2 | Multilingual Regional Syntax | Submit complex compound sentences in Tamil or Bengali without English technical loanwords. | Normalized requirement extraction. | English & Hindi Devanagari fully translated; regional languages use keyword dictionaries. Bhashini API integration slated for phase 2. | **DISCLOSED BOUNDARY** |
| **BND-003** | P2 | Degraded Scan OCR | Upload heavily degraded, low-DPI handwritten scan. | 100% attribute extraction. | Tesseract.js extracts partial text; UI provides editable parameter card so procurement officer can verify before search. | **DISCLOSED BOUNDARY** |
| **COS-001** | P3 | Analysis Stage Telemetry | Inspect `/analyze` stage progression. | Live tick-by-tick WebSocket event stream from engine. | Engine finishes in $<200$ms; UI visualizes stages via animated sequence before redirecting. | **ACCEPTED BEHAVIOR** |
| **COS-002** | P3 | Mobile Viewport Table Scroll | View `/history` audit table on screens $< 768$ px wide. | Automatic column wrapping. | Multi-column audit table requires horizontal touch swipe on small mobile screens. | **ACCEPTED BEHAVIOR** |

---

## Summary of Active Blockers
- **P0 Blockers:** **0**
- **P1 Blockers:** **0**
- **P2 Operational Boundaries:** **3** (All defended and transparently disclosed)
- **P3 Minor / Cosmetic:** **2**
