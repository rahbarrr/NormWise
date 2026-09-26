# NormWise Hybrid Retrieval & Semantic Recommendation Engine

## Phase 15 System Architecture & Engineering Specification

> **CRITICAL LEGAL & REGULATORY NOTICE:**  
> The ranking weights, match scores, and decision thresholds described in this document and utilized throughout NormWise are internal **MVP engineering parameters** designed to assist procurement officers and technical evaluators. They are **not official Bureau of Indian Standards (BIS) criteria**, nor do they constitute legal certification or statutory compliance guarantees. All recommended standards and supporting evidence originate strictly from the project's verified PostgreSQL dataset. The AI/LLM layer is strictly forbidden from inventing standards, clauses, amendments, or compliance obligations.

---

## 1. System Overview & Architecture

NormWise provides intelligent standards recommendation for public and enterprise procurement in India. The Hybrid Retrieval & Recommendation Engine converts natural-language procurement requirements (e.g., *"Stainless steel pressure cooker, 5 litre, for institutional kitchen use"*) into ranked, evidence-backed Indian Standards.

### Retrieval Pipeline

```
       User Natural-Language Requirement
                     │
                     ▼
       Requirement Normalization & Synonyms
         (server/src/services/requirementNormalizationService.js)
                     │
                     ▼
  ┌─────────────────────────────────────────────────────────┐
  │ Candidate Retrieval (Parallel Multi-Signal Pool)        │
  │                                                         │
  │  1. Structured Match      2. Lexical Search             │
  │     (Attributes & Specs)     (PostgreSQL FTS + ILIKE)   │
  │                                                         │
  │  3. Vector Search (pgvector Cosine Similarity)          │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
     Candidate Deduplication & Retrieval Tracking
       (retrievedBy: ["structured", "lexical", "vector"])
                             │
                             ▼
     Multi-Factor Deterministic Reranking
       (30% Product + 25% App + 15% Material + 10% Tech + 20% Semantic)
                             │
                             ▼
     Currentness Filtering & Status Decoupling
       (CURRENT: 1.0x, SUPERSEDED: 0.70x, WITHDRAWN: 0.40x, UNKNOWN: 0.85x)
                             │
                             ▼
     Evidence Enrichment & Allied Standards Integration
       (Real DB clauses, normative references, QCO rules)
                             │
                             ▼
     Final Recommendation States & Alternatives
       (RECOMMENDED | CLARIFICATION_REQUIRED | INSUFFICIENT_EVIDENCE | NO_MATCH)
```

---

## 2. Requirement Normalization & Synonym Handling

Located in [`server/src/services/requirementNormalizationService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/requirementNormalizationService.js).

- **Deterministic Extraction:** Extracts `product`, `category`, `material`, `capacity`, `application`, and `technicalCharacteristics` using regex patterns anchored on verified engineering terminology.
- **No Hallucination:** Fields not found in the input query remain `null` or empty.
- **Controlled Terminology:** Applies canonical harmonization for obvious linguistic and spelling variants (e.g., `pressure-cooker` ➔ `pressure cooker`, `die-cast aluminium` ➔ `die-cast aluminum`, `LED luminaire` ➔ `LED street light luminaire`). Aggressive semantic expansion is strictly prohibited to avoid false positives.
- **Ambiguity Detection:** Detects broad or underspecified queries (e.g., *"Need electrical equipment"*) and generates specific clarifying questions:
  - *"What specific product or equipment type is required?"*
  - *"Where will this equipment be installed or operated?"*

---

## 3. Candidate Retrieval Layer

NormWise retrieves candidate standards across three parallel strategies, merging results by `standardId`:

### A. Structured Retrieval
- Handled by [`server/src/services/structuredMatchService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/structuredMatchService.js).
- Deterministically matches normalized product taxonomy, category, application, and materials against verified PostgreSQL metadata (`applicableProducts`, `materials`, `applications`, `category`).
- If the requirement lacks an identifiable product or category, structured matching yields zero candidates to avoid spurious generic material matches.

### B. Lexical Full-Text Search
- Handled by [`server/src/services/retrievalService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/retrievalService.js).
- Leverages PostgreSQL's native `to_tsvector` and `to_tsquery` with `ts_rank` across `title`, `description`, and `scope`.
- Employs token and phrase matching via `ILIKE` on `standardNumber` and GIN array containment on `keywords`.

### C. pgvector Semantic Search
- Handled by [`server/src/services/vectorSearchService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/vectorSearchService.js).
- Computes cosine distance `(1 - (se.embedding <=> $1::vector))` against precomputed standard embeddings stored in the `standard_embeddings` table.
- Default candidate limit: `VECTOR_CANDIDATE_LIMIT=20`.

### Candidate Merging & Traceability
All retrieved standards are deduplicated into a single pool with provenance tracking:
```json
{
  "standardId": "std-2347",
  "standardNumber": "IS 2347:2023",
  "retrievedBy": ["structured", "lexical", "vector"]
}
```

---

## 4. Embedding Service & Content Hash Caching

Located in [`server/src/services/embeddingService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/embeddingService.js).

- **Standard Searchable Text:** Combines standard number, title, scope, category, and technical domain. Never embeds unsupported content.
- **SHA-256 Content Hashing:** Computes `contentHash` for standard content. If the text has not changed, existing database embeddings are reused. If modified, a new vector is generated and cached.
- **Provider Agnostic:** Configurable via environment variables:
  ```env
  EMBEDDING_PROVIDER=openai
  EMBEDDING_MODEL=text-embedding-3-small
  EMBEDDING_API_KEY=your_key_here
  ```
- **Transparent Fallback:** If `EMBEDDING_API_KEY` is omitted or vector generation fails, `generateEmbedding` gracefully returns `null`. The system automatically functions at 100% capacity using lexical and structured matching, redistributing semantic scoring weights proportionally.

---

## 5. Candidate Scoring & Reranking

Located in [`server/src/services/standardRankingService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/standardRankingService.js).

NormWise calculates five distinct component scores (0.0 to 1.0) and weights them according to Phase 10 standards:

| Component Score | Weight | Criteria |
| :--- | :---: | :--- |
| **Product Match** | 30% | Title and applicable product taxonomy alignment |
| **Application Match** | 25% | Scope, environment, and operational duty alignment |
| **Material Match** | 15% | Material grade, composition, and contact compliance |
| **Technical Characteristics** | 10% | Verified compliance with ratings (IP, IK, wattage, valves) |
| **Semantic Similarity** | 20% | Vector cosine similarity (or redistributed across non-semantic) |
| **Total Match Score** | **100%** | Internal engineering match metric |

```javascript
matchScore = 
    productScore * 0.30
  + applicationScore * 0.25
  + materialScore * 0.15
  + technicalScore * 0.10
  + semanticScore * 0.20;
```

Component scores are stored independently in `scoreBreakdown` on each `RecommendationStandard` record for auditing and UI explainability.

---

## 6. Currentness Decoupling & Penalties

Currentness status is strictly decoupled from the technical match score:
- **Match score:** Indicates algorithmic compatibility with technical specifications.
- **Status:** Reflects official BIS catalog lifecycle state (`CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, `UNKNOWN`).

To prevent historical standards from topping recommendations:
- `CURRENT` standards: Full score (1.0x multiplier).
- `SUPERSEDED` standards: Deprioritized (0.70x multiplier). A warning badge is attached.
- `WITHDRAWN` standards: Heavily deprioritized (0.40x multiplier). Never recommended as primary.
- `UNKNOWN` standards: Moderated (0.85x multiplier) with manual review required.

---

## 7. Deterministic Recommendation States

The engine assigns one of four deterministic states:
1. **`RECOMMENDED`**: A strong candidate meeting the minimum threshold (≥ 0.60) exists with verified supporting database evidence.
2. **`CLARIFICATION_REQUIRED`**: Requirement is broad, ambiguous, missing essential product attributes, or two top candidates have a narrow score gap (< 0.12).
3. **`INSUFFICIENT_EVIDENCE`**: Potential candidate identified, but verified source clauses or currentness verification are absent.
4. **`NO_MATCH`**: No candidate achieves the minimum acceptable threshold (score < 0.25).

---

## 8. Frontend Display Guidelines (`/results`)

- **Primary Recommendation Card:**
  - Displays: `RECOMMENDED STANDARD`, standard number, title, `Match score: XX%`, and separate `Status: CURRENT` badge.
  - UI labels strictly adhere to *"Match score"* — terms like *"Accuracy"*, *"Probability"*, or *"Legally certified"* are prohibited.
- **"Why This Standard?" Expandable Panel:**
  - Concise checklist:
    - ✓ Product matches
    - ✓ Application matches
    - ✓ Material matches
    - ✓ Technical characteristics considered
  - Expandable breakdown dynamically populated from actual stored scores:
    - Product: Strong match
    - Application: Strong match
    - Material: Match found
    - Technical details: Partial match / Considered
    - Semantic similarity: Strong / Lexical fallback
    - Currentness: Current
- **Alternative Standards ("OTHER POSSIBLE MATCHES"):**
  - Displays non-primary candidates with their respective match scores and status badges.
  - Accompanied by the instruction: *"Review evidence before selecting."*
- **Clarification State:**
  - If ambiguous, displays *"More information is needed"* with bulleted clarifying questions and a direct action to refine the requirement.

---

## 9. Multilingual Preparation

- Heuristic script detection (Devanagari block `\u0900-\u097F` for Hindi, Latin for English).
- Raw original query is preserved verbatim in `rawText` and `originalText`.
- Controlled Hindi terminology mapping allows bilingual term extraction without external translation dependency.

---

## 10. Audit Provenance & Debug Mode

When a recommendation is created, the system stores:
- `standardsDatasetVersion` (e.g., `"2026.09"`)
- `importJobId` (link to DataImportJob from Phase 14)
- `engineVersion` (`"hybrid-v1"`)
- `retrievalMethod` (`"HYBRID"`)
- `embeddingModel` (e.g., `"text-embedding-3-small"`)

### Debug Mode API
Developers and administrators can inspect candidate generation internals by passing `?debug=true`:
```bash
curl -X POST http://localhost:5000/api/recommend?debug=true \
  -H "Content-Type: application/json" \
  -d '{"text": "Stainless steel pressure cooker 5L"}'
```
Returns:
```json
{
  "recommendationId": "...",
  "status": "RECOMMENDED",
  "matchScore": 0.92,
  "debug": {
    "retrievedBy": ["structured", "lexical"],
    "candidateCount": 8,
    "scoreBreakdown": { ... },
    "candidateSources": [ ... ]
  }
}
```

---

## 11. Offline Evaluation Framework

NormWise includes a controlled evaluation suite:
- **Dataset Directory:** [`server/data/evaluation/`](file:///Users/rahbarraza/Downloads/NormWise/server/data/evaluation/)
  - `01-pressure-cooker.json` (Expected: IS 2347:2023)
  - `02-led-street-lighting.json` (Expected: IS 10322 Part 5/Sec 3)
  - `03-electrical-accessory.json` (Expected: IS 3854:1997)
  - `04-piping-system.json` (Expected: IS 4984:2016)
- **Evaluation Runner:**
  ```bash
  npm run evaluate:recommendations
  ```
- **Metrics Reported:** Top-1 retrieval rate, Top-K coverage rate, candidate ranks, and execution times.

---

## 12. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `EMBEDDING_PROVIDER` | Embedding provider (`openai`, `mock`) | `openai` |
| `EMBEDDING_MODEL` | Embedding model identifier | `text-embedding-3-small` |
| `EMBEDDING_API_KEY` | Provider API key (optional; lexical fallback if omitted) | *(none)* |
| `VECTOR_CANDIDATE_LIMIT` | Candidates retrieved via vector search | `20` |
| `KEYWORD_CANDIDATE_LIMIT`| Candidates retrieved via lexical search | `20` |
| `STRUCTURED_LIMIT` | Candidates retrieved via structured search | `20` |
| `FINAL_CANDIDATES` | Maximum ranked candidates retained | `10` |

---

## 13. Known Limitations

1. **Demonstration Dataset Scope:** Embeddings and lexical indexes reflect only standards currently ingested into the PostgreSQL database. Standards not in the database cannot be retrieved.
2. **Offline Vector Search:** When `EMBEDDING_API_KEY` is not provided, the engine operates exclusively on lexical full-text and structured attribute matching.
3. **Multilingual Coverage:** Current multilingual extraction supports English and basic Hindi transliterations; regional Indian language support (Tamil, Telugu, Bengali) will be expanded in future phases.
