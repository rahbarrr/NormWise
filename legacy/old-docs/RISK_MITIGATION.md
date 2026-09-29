# NormWise: Risk Analysis & Mitigation Matrix

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**System Policy:** Pragmatic Risk Management & Operational Transparency  

---

## 1. Overview of Risk Strategy

Deploying AI intelligence tools in public procurement carries regulatory, legal, and operational risks. Rather than claiming "zero risk", NormWise implements pragmatic, multi-layered mitigations designed to minimize failure rates and ensure graceful degradation:

---

## 2. Risk & Mitigation Matrix

| Operational / Technical Risk | Impact | Implemented Mitigation Mechanism | Residual Risk Management |
|---|---|---|---|
| **1. BIS Data Access & Copyright Licensing** | High | Ingestion focuses strictly on public gazette notifications, titles, scopes, and regulatory mandates. Proprietary full-text PDFs are not hosted or distributed. | Enterprise deployments require official integration with BIS Manakonline APIs. |
| **2. Standards Lifecycle Drift (Amendments / Withdrawals)** | High | Relational status tracking (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`). Obsolete standards automatically surface active replacements with supersede alerts. | Moratorium periods between gazetting and tender cutoff dates require human reviewer verification. |
| **3. Complex Multiple-Standard Requirements** | Medium | Knowledge graph layer distinguishes primary product standards from allied raw material standards, subcomponents, and test methods. | Tenders involving complex multi-package assemblies require technical committee review. |
| **4. Ambiguous / Underspecified Specifications** | High | System detects missing dimensional, electrical, or material attributes and returns `CLARIFICATION_REQUIRED` rather than forcing an unsupported guess. | If a user ignores clarifying questions, recommendation confidence remains marked Low. |
| **5. OCR Degradation on Scanned Documents** | Medium | Multi-stage document parsing validates text density and falls back to `tesseract.js` with character confidence thresholds. | Degraded photocopies are flagged with extraction warnings, prompting user review of key parameters. |
| **6. AI Hallucination & Fabricated Clauses** | Critical | Generative free-form quoting is strictly blocked. Explanations bind to pre-indexed verbatim database clauses; structured retrieval gates LLM generation. | Reviewers must verify clause extracts in the Evidence Drawer before formal approval. |
| **7. Misinterpretation of Statutory Compliance** | High | Deterministic compliance rule engine (`complianceRuleService.js`) evaluates QCO mandates without probabilistic LLM involvement. | Specialized exemption clauses (e.g. defense R&D waivers) require human legal officer verification. |
| **8. Incomplete Standards Catalog Coverage** | Medium | Explicit uncertainty states (`NO_MATCH`, `INSUFFICIENT_EVIDENCE`) surface when requirements fall outside the authorized database catalog. | System limitations are prominently disclosed; unindexed domains cannot produce false positives. |

---

## 3. Honest Statement on Risk Elimination

> **Important Disclosure:**  
> Mitigations substantially reduce the probability of errors, but no algorithmic system can completely eliminate ambiguity in free-form human language. Therefore, **human technical verification and formal sign-off remain mandatory** for all final procurement tenders.
