# NormWise Error Taxonomy & Diagnostic Analysis Guide

**Document Version:** 1.0.0 (Phase 21)  
**Service Implementation:** `server/src/services/errorAnalysisService.js`  
**Dashboard Route:** `/admin/evaluation` (Errors Tab)

---

## 1. Standardized Error Taxonomy (13 Categories)

When an evaluation case fails or deviates from expected behavior, NormWise classifies the issue into one or more standardized diagnostic categories:

| Error Category | Trigger Condition | Impact Level | Diagnostic Investigation |
|---|---|---|---|
| **`ATTRIBUTE_EXTRACTION_ERROR`** | Key product attributes (material, capacity, application, ratings) are missing or misparsed. | Medium | Inspect tokenization, regex patterns, and normalization dictionary in `requirementAnalysisService.js`. |
| **`LEXICAL_RETRIEVAL_ERROR`** | Keyword/BM25 full-text search fails to surface relevant standards due to terminology gaps or synonyms. | High | Check PostgreSQL tsvector dictionary, stop words, and standard title lexemes. |
| **`SEMANTIC_RETRIEVAL_ERROR`** | Dense vector search in pgvector fails to embed query intent close to the target standard embedding. | High | Evaluate embedding model cosine distance; consider fine-tuning domain embeddings. |
| **`CURRENTNESS_ERROR`** | Superseded or withdrawn standard is recommended without safety warnings, or active standard is falsely marked outdated. | Critical | Verify BIS gazette publication dates, status enum in PostgreSQL, and replacement pointers. |
| **`RELATIONSHIP_ERROR`** | Expected allied standards (test methods, safety, components, raw materials) missing from knowledge graph traversal. | Medium | Verify `StandardRelationship` table edges and bidirectional traversal depth. |
| **`COMPLIANCE_ERROR`** | Deterministic compliance engine produces unexpected QCO applicability or certification requirement. | High | Audit `complianceRuleService.js` logic and rule preconditions against Gazette orders. |
| **`EVIDENCE_ERROR`** | Recommendation makes claims lacking traceable evidence (missing scope extract, gazette citation, or clause link). | High | Check evidence synthesis pipeline; ensure claims bind strictly to ingested clauses. |
| **`AMBIGUITY_HANDLING_ERROR`** | Engine forces a specific standard recommendation on an underspecified requirement instead of asking for clarification. | Critical | Inspect confidence threshold; ensure low-signal requirements yield `CLARIFICATION_REQUIRED`. |
| **`MULTILINGUAL_ERROR`** | Hindi, Marathi, or Bengali requirement retrieves different candidates or misses attributes compared to English baseline. | Medium | Review Indic transliteration, dictionary mappings, and cross-lingual vector alignment. |
| **`NO_MATCH_HANDLING_ERROR`** | Requirement outside BIS scope is forced to match an irrelevant standard instead of returning `NO_MATCH`. | High | Verify score floor threshold; reject candidates scoring below safety threshold. |
| **`DATASET_GAP`** | The expected standard is genuinely missing from the active database catalog. | Administrative | Ingest missing standard via BIS ingestion pipeline (`standardsDataIngestionService.js`). |
| **`SOURCE_GAP`** | Missing official BIS gazette or statutory QCO documentation preventing full verification. | Documentation | Procure official BIS publication or Gazette notification. |
| **`CONFIGURATION_ERROR`** | Misconfigured environment, missing database connection, or disabled vector extension. | Infrastructure | Verify PostgreSQL connection string, pgvector extension, and environment variables. |

---

## 2. Diagnostic Investigation Workflow

```text
[Failed Evaluation Result]
           │
           ▼
1. Is expected standard in DB? ──No──► [DATASET_GAP] -> Ingest Standard
           │
          Yes
           ▼
2. Did candidate generation find it?
   ├── Found by Lexical only? ───────► [SEMANTIC_RETRIEVAL_ERROR]
   ├── Found by Vector only? ────────► [LEXICAL_RETRIEVAL_ERROR]
   └── Not found in Top-10? ─────────► [RETRIEVAL_STRATEGY_DEFICIT]
           │
       Found in Top-10
           ▼
3. Did it rank at Top-1?
   ├── Outranked by Outdated? ───────► [CURRENTNESS_ERROR]
   ├── Lower score than irrelevant? ─► [SCORING_WEIGHT_MISALIGNMENT]
   └── Expected clarification? ──────► [AMBIGUITY_HANDLING_ERROR]
```

---

## 3. Real-Case Dataset Analysis (Run `aa676ed6-6d87-4c78-a9e0-942f5c9f5fec`)

In the baseline execution across 20 real evaluation cases, the engine achieved **88.9% Recall@1** and **94.4% Recall@5**, identifying 3 failing cases classified into 2 standardized error categories:

### Case 1: `rc-lt-002` (Street light fixture for road)
- **Error:** `AMBIGUITY_HANDLING_ERROR`
- **Root Cause:** Requirement is intentionally ambiguous (*"Street light fixture for road"* lacks wattage, luminaire type, and mounting). The engine produced `RECOMMENDED` with `IS 10322 (Part 5/Sec 3):2012` rather than `CLARIFICATION_REQUIRED`.
- **Remediation:** Raise threshold for street lighting when technical wattage and lamp characteristics are null.

### Case 2: `rc-ea-003` (Electric switchboard plug)
- **Error:** `AMBIGUITY_HANDLING_ERROR`
- **Root Cause:** Lacks rating (6A vs 16A) and pin configuration (2-pin vs 3-pin). Engine recommended `IS 1293:2019` with score 0.70 instead of returning `CLARIFICATION_REQUIRED`.
- **Remediation:** Enforce mandatory attribute check on electrical accessories requiring current rating before recommending specific standards.

### Case 3: `rc-lt-004` (रस्त्यांच्या दिव्यांसाठी 90W एलईडी स्ट्रीट लाइट)
- **Error:** `MULTILINGUAL_ERROR`
- **Root Cause:** In Marathi input, attribute extraction missed the IP rating parameter ("IP66") due to regional terminology translation, causing partial attribute mismatch.
- **Remediation:** Expand Marathi technical keyword dictionary in `multilingualService.js` for ingress protection terms.

---

## 4. Remediation Playbook

### Playbook A: Ambiguity Handling Fix
1. Open `server/src/services/recommendationService.js`.
2. Locate `detectAmbiguity()` or clarification evaluation block.
3. Add missing attribute penalties when requirements are shorter than 10 words and lack key dimensional or electrical ratings.

### Playbook B: Multilingual Extraction Enhancement
1. Open `server/src/services/multilingualService.js`.
2. Update language-specific dictionary mappings in `indicDictionaries`.
3. Add domain synonyms for technical terms (e.g., ल्युमिनेअर्स -> Luminaire).
