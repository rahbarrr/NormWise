# Submission: System Limitations & Scope Disclosures

**System Policy:** Total Transparency & Ethical AI Disclosure  

---

## Key System Boundaries

1. **Curated Demonstration Catalog:** Current database indexes **83 curated Bureau of Indian Standards (BIS)** records covering core public procurement categories. Unindexed specialized domains (aerospace, cryogenic valves) safely return `NO_MATCH` or `INSUFFICIENT_EVIDENCE`.
2. **Authorized Gazette Data:** Standards metadata and scopes are derived from public gazette releases; real-time live synchronization requires official BIS API integration.
3. **Ambiguous Requirements Require Clarification:** Underspecified tenders lacking critical engineering ratings trigger `CLARIFICATION_REQUIRED` rather than an unverified single guess.
4. **OCR Sensitivity:** Scanned documents require legible resolution ($\ge 200$ DPI); degraded photocopies require manual verification of extracted numbers.
5. **Preliminary Evaluation Sample Size:** Empirical evaluation is based on **20 authentic procurement cases** (19 verified).
6. **Mandatory Human Sign-Off:** NormWise does not autonomously approve contracts or grant legal compliance guarantees; authorized officers retain statutory responsibility.

---

*For full disclosures, see [LIMITATIONS.md](../LIMITATIONS.md) and [LIMITATIONS_FOR_PRESENTATION.md](../LIMITATIONS_FOR_PRESENTATION.md).*
