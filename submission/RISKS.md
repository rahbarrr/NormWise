# Submission: Risk Analysis & Mitigation

NormWise implements pragmatic, multi-layered mitigations designed to ensure graceful failure and operational safety:

---

## Key Risk Mitigations

1. **Copyright & Data Licensing:** Ingestion focuses on public gazettes, standard titles, scopes, and regulatory mandates. Proprietary full-text PDFs are not hosted or distributed.
2. **Standards Amendments & Withdrawals:** Relational status tracking (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`). Superseded citations automatically promote active replacements with prominent warnings.
3. **Complex Multi-Standard Tenders:** Relational knowledge graph separates primary product standards from companion raw material standards, subcomponents, and test methods.
4. **Ambiguous Specifications:** Missing attribute analysis triggers `CLARIFICATION_REQUIRED`, outlines missing fields, and poses clarifying questions rather than forcing unsupported guesses.
5. **OCR Degradation on Scanned Documents:** Extraction quality checks fall back to `tesseract.js` with manual parameter verification prompts.
6. **AI Hallucinations:** Generative free-form quoting is strictly blocked. Explanations bind to pre-indexed database clauses; structured retrieval gates LLM generation.
7. **Statutory Compliance Misinterpretation:** Deterministic rule engine evaluates QCO orders without probabilistic LLM involvement.
8. **Incomplete Catalog Boundaries:** Explicit uncertainty states (`NO_MATCH`, `INSUFFICIENT_EVIDENCE`) surface when requirements fall outside the authorized catalog.

---

*For the comprehensive risk analysis matrix, see [RISK_MITIGATION.md](../RISK_MITIGATION.md).*
