# NormWise Recommendation Quality Evaluation & Benchmarking Framework (Phase 17)

> **Core Philosophy:**  
> *"Evaluation metrics measure system behaviour on the available labelled dataset. They do not establish legal correctness or universal recommendation accuracy."*

---

## 1. Overview & Evaluation Philosophy

The NormWise Evaluation Framework is an empirical engineering system designed to systematically evaluate, benchmark, and debug the production recommendation pipeline. Rather than boiling recommendation performance down to a single subjective "accuracy" percentage, the framework provides deep diagnostics across:

1. **Retrieval Rank & Recall:** Where does the expected standard land among retrieved candidates?
2. **Retrieval Method Attribution:** Was the standard found via Structured, Lexical (FTS), or Semantic Vector search?
3. **Clarification Behavior:** Does the engine ask clarifying questions when information is incomplete, instead of guessing?
4. **Currentness Safety Rules:** Are withdrawn standards strictly barred from primary recommendation? Are superseded standards flagged?
5. **Evidence Coverage:** Does the system provide verified clauses, scope extracts, and compliance references?
6. **Multilingual Robustness:** Does Indic language normalization faithfully map to standard Indian Standards without token mutation?
7. **Error Classification:** Structured categorization of any recommendation failures.

---

## 2. Evaluation Dataset Structure

Located in [`server/data/evaluation/`](file:///Users/rahbarraza/Downloads/NormWise/server/data/evaluation/):

```
server/data/evaluation/
├── pressure-cooker/           # Kitchenware and domestic/commercial cooking vessels
├── led-lighting/              # Luminaires, street lighting, drivers, and modules
├── electrical-accessories/    # Switches, plugs/sockets, ceiling fans, safety
├── category-4/                # Piping & Tubing (HDPE, mild steel, fittings)
├── category-5/                # Materials (Stainless steel sheets, strips, low-nickel)
├── regression/                # Known bug edge cases, multilingual, and guardrails
└── multilingual/              # 11 Indian constitutional languages test suites
```

### Evaluation Case Schema

```json
{
  "id": "eval-pc-01",
  "requirement": "Stainless steel 5 litre pressure cooker for institutional canteen kitchen conforming to IS 2347",
  "language": "en",
  "evaluationType": "STANDARD_RETRIEVAL",
  "expectedAttributes": {
    "product": "Pressure Cooker",
    "material": "Stainless Steel",
    "application": "Institutional Canteen Kitchen",
    "capacity": "5 Litre"
  },
  "expectedStandardIds": ["IS 2347:2023"],
  "acceptableStandardIds": ["IS 2347"],
  "notes": "Verified against domestic & commercial pressure cooker baseline.",
  "source": "BIS Demonstration Catalog"
}
```

---

## 3. Evaluation Case Types

| Type | Objective | Expected Outcome |
|---|---|---|
| `STANDARD_RETRIEVAL` | Evaluate candidate ranking and recall for known standards | Expected standard retrieved at Rank 1 (or Top K) |
| `ATTRIBUTE_EXTRACTION` | Validate structured taxonomy normalization | Exact or normalized attribute match |
| `CLARIFICATION` | Test underspecified or ambiguous queries | State = `CLARIFICATION_REQUIRED`, questions generated |
| `NO_MATCH` | Out-of-domain products (e.g. handmade crafts) | State = `NO_MATCH` or zero confidence |
| `MULTILINGUAL` | Indic natural language input | Accurate language detection and search representation |
| `CURRENTNESS` | Superseded or withdrawn standards | Withdrawn barred from primary; superseded flagged |
| `RELATED_STANDARD` | Allied/component standards | Linked standard retrieved with relationship type |
| `COMPLIANCE` | Mandatory QCO or ISI certification | Applicable compliance rules linked with evidence |

---

## 4. Evaluation Retrieval Metrics

1. **Recall@1:** Expected standard was the top primary recommendation.
2. **Recall@3:** Expected standard was present in Top 3 candidates.
3. **Recall@5:** Expected standard was present in Top 5 candidates.
4. **Recall@10:** Expected standard was present in Top 10 candidates.
5. **MRR (Mean Reciprocal Rank):** $\frac{1}{N} \sum_{i=1}^{N} \frac{1}{\text{rank}_i}$, measuring average positional quality.

---

## 5. Error Classification Taxonomy

Located in [`server/src/services/errorAnalysisService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/errorAnalysisService.js):

- `WRONG_PRODUCT`: Retrieved product category differs from requirement.
- `WRONG_APPLICATION`: Operational environment mismatch.
- `WRONG_MATERIAL`: Material grade mismatch.
- `MISSING_TECHNICAL_MATCH`: Ratings/capacity omitted.
- `TRANSLATION_ERROR`: Indic connective translation failure.
- `TERMINOLOGY_ERROR`: Unrecognized dialect or synonym.
- `LEXICAL_MISS`: Candidate missed by PostgreSQL full-text search.
- `SEMANTIC_MISS`: Candidate scored low in pgvector embedding search.
- `CURRENTNESS_ERROR`: Withdrawn standard erroneously cited as primary.
- `INSUFFICIENT_EVIDENCE`: Standard recommended without supporting clauses.
- `AMBIGUOUS_REQUIREMENT`: Underspecified requirement forced into standard instead of clarification.
- `DATASET_GAP`: Expected standard is absent from current standards catalog.
- `OTHER`: Unclassified failure mode.

---

## 6. Deterministic Mock Embeddings (Offline Testing & CI)

When running offline or in CI environments without external API keys:
- Set `EMBEDDING_PROVIDER=mock`.
- The engine uses `generateDeterministicMockEmbedding(text)` based on SHA-256 content hashing to produce a 1536-dimensional unit vector.
- Guarantees identical embeddings for identical text without network dependency.

---

## 7. CLI Usage

Run complete evaluation:
```bash
npm run evaluate:recommendations
```

Target specific dataset category:
```bash
npm run evaluate:recommendations -- --dataset=pressure-cooker
```

Dry-run case verification (no DB modifications):
```bash
npm run evaluate:recommendations -- --dry-run
```

Limit number of evaluated cases:
```bash
npm run evaluate:recommendations -- --limit=15
```

---

## 8. Exporting Evaluation Reports

- API: `GET /api/admin/evaluation/:id/report?format=markdown`
- Dashboard: Available via the "Export Markdown" button at `/admin/evaluation`.

---

## 9. Known Limitations

1. **Catalog Dataset Size:** Benchmark metrics evaluate available verified records in PostgreSQL. Standards absent from the catalog are reported as `DATASET_GAP`.
2. **Labelled Ground Truth:** Evaluation cases represent controlled empirical samples; new domains require addition of curated test cases to maintain test coverage.
