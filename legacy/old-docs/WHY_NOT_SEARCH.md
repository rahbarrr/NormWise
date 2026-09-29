# Why Not a Standard Search Engine (Google, Bing, or Elasticsearch)?

**Evaluator Question:** *"Why can't a procurement officer simply use Google, Bing, or an internal Elasticsearch search box to find Indian Standards?"*

---

## Factual Architectural Comparison

| Dimension | General Search Engines (Google, Bing) | Generic Enterprise Search (Elasticsearch) | NormWise Intelligence Engine |
| :--- | :--- | :--- | :--- |
| **Primary Objective** | Web-page indexing for consumer keyword queries. | Inverted index document text matching. | Specialized Indian Standards discovery, verification, and procurement governance. |
| **Requirement Understanding** | None. Treats queries as flat text strings. | None. Tokenizes words and counts frequencies (TF-IDF/BM25). | Decomposes multi-line tender indents into structured engineering parameters (Product, Material Grade, Capacity, Application). |
| **Bilingual Technical Normalization** | General translation (often alters technical unit tokens). | Requires custom analyzers per language. | Preserves technical unit tokens (`TOKEN_UNIT_XXX`) while harmonizing Hindi engineering terms to canonical standards vocabulary. |
| **Currentness & Amendment Awareness** | Returns outdated blog posts, superseded revisions, and cached PDFs indiscriminately. | Keyword search cannot differentiate whether a standard is `CURRENT`, `SUPERSEDED`, or `WITHDRAWN`. | Independent lifecycle engine flags obsolete standards and automatically redirects to active replacement editions. |
| **Allied Standards Discovery** | Must be searched manually one by one. | Requires separate unlinked queries. | Traverses a relational knowledge graph (PostgreSQL recursive CTE) linking products to raw materials, components, and test methods. |
| **Statutory QCO Compliance** | Cannot interpret gazette orders or determine if an ISI mark is legally mandatory. | None. | Deterministic rule engine checks standard numbers against official DPIIT/Steel Quality Control Orders. |
| **Evidence Traceability** | Links to third-party web pages and forums. | Highlights matching sentences in text blobs. | Links verbatim clause numbers, test thresholds, and document page citations directly from standard records. |
| **Governance & Accountability** | Zero procurement workflow or role enforcement. | Search-only; no review lifecycle. | Enforces 4-role RBAC, prevents officer self-approval, requires reviewer checklists, and logs SHA-256 audit trails. |

---

## Summary Statement

Search engines answer: *"Where does this text appear on the web?"*  
NormWise answers: *"Which active Indian Standard governs this tender indent, what verbatim clauses prove it, is ISI certification legally mandatory under a QCO, what allied materials are required, and who verified and approved the decision?"*
