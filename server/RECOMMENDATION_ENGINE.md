# NormWise Recommendation Engine — Architecture & Specification

## Executive Summary
NormWise replaces black-box LLM hallucinations with a deterministic, evidence-grounded recommendation pipeline:

```text
User Requirement
       │
       ▼
Requirement Extraction (Deterministic + Zod Schema Validation)
       │
       ├── Product
       ├── Material
       ├── Application
       ├── Capacity
       └── Technical Features
       │
       ▼
Candidate Retrieval (Hybrid Multi-Signal)
       │
       ├── PostgreSQL Full-Text Search (tsvector / GIN Index)
       ├── Structured Metadata Overlap
       └── pgvector Semantic Retrieval (Cosine HNSW Index)
       │
       ▼
Candidate Scoring (Transparent 5-Factor Weighted Model)
       │
       ▼
Currentness Validation (Catalog State, Amendments, Supersession)
       │
       ├── CURRENT (Proceed as primary)
       ├── SUPERSEDED (Penalize & recommend successor)
       └── WITHDRAWN (Bar from primary citation)
       │
       ▼
Related Standards & Knowledge Graph (Normative references, materials, testing)
       │
       ▼
Certification & Statutory Rules (DPIIT QCO, Scheme I ISI, CRS mandates)
       │
       ▼
Evidence Collection (Clause-level references & anti-hallucination guard)
       │
       ▼
Grounded Explanation (Zero-unsupported-claims principle)
       │
       ▼
Human Review Queue & Traceable Audit Trail
```

---

## 1. Requirement Extraction (`requirementService.js`)
- **MVP Implementation**: High-precision deterministic regex pattern matching for core procurement entities:
  - **Product**: Direct matching against known equipment taxonomies (Pressure Cookers, LED Street Luminaires, Induction Hobs, BLDC Fans, etc.).
  - **Material**: Alloy and material detection (Grade 304 Stainless Steel, Die-cast Aluminum, Ceramic Glass, HDPE PE-100, etc.).
  - **Capacity / Rating**: Numeric units with standardized formatting (`5 Litre`, `120 Watt`, `3.5 kW`, `1200 mm`, `33 kV`, etc.).
  - **Application**: Operational environment (Institutional Canteen Kitchen, Municipal Highway, Railway Base Kitchen, Substation, etc.).
  - **Technical Characteristics**: Ingress protection (IP66), impact resistance (IK08), surge suppressors (10kV), safety valves, BEE star rating.
- **Production Extension**: Optional LLM-assisted entity extractor constrained by Zod schema (`requirementSchema`), returning `null` when uncertain rather than hallucinating missing attributes.

---

## 2. Candidate Retrieval (`retrievalService.js`)
Hybrid retrieval combines three complementary signals without loading the full database into memory:
1. **PostgreSQL Full-Text Search**:
   - Uses `to_tsvector('english', ...)` combined with PostgreSQL `ts_rank` over standard title, description, and scope.
   - GIN index on text search and array columns (`keywords`, `applicableProducts`, `materials`, `applications`).
2. **Structured Field Matching**:
   - Array overlap queries (`@>` and `&&`) directly querying PostgreSQL array columns.
3. **pgvector Semantic Search**:
   - Cosine distance index (`hnsw (embedding vector_cosine_ops)`).
   - Searches top 20 nearest embeddings when vector embeddings are configured.
   - Gracefully bypassed when embeddings are unconfigured, falling back seamlessly to keyword/structured search.

---

## 3. Candidate Scoring (`scoringService.js`)
Transparent scoring model using configurable engineering weights (`server/src/config/recommendationConfig.js`):

| Signal | MVP Weight | Description |
|---|---|---|
| **Product Match** | `30%` | Exact or taxonomic match against standard title and product keywords |
| **Application & Scope** | `25%` | Operating domain alignment against standard scope |
| **Material Compatibility**| `15%` | Alloy/material compliance against material clause metadata |
| **Technical Features** | `10%` | Match on ratings, IP codes, and safety mechanisms |
| **Semantic Similarity** | `20%` | pgvector cosine similarity score (redistributed if unconfigured) |

### Match Explanation Output
Every scored candidate produces explicit human-readable reasons:
```json
{
  "standardNumber": "IS 2347:2023",
  "matchScore": 0.92,
  "reasons": [
    "Product classification 'Pressure Cooker' directly matches standard taxonomy.",
    "Operating application 'Institutional Canteen Kitchen' aligns with specified standard scope.",
    "Specified material 'Stainless Steel' is explicitly compliant with standard material clauses."
  ],
  "warnings": []
}
```

---

## 4. Currentness Validation (`currentnessService.js`)
Protects procurement officers from citing outdated specifications:
- **`CURRENT`**: Candidate can proceed as primary recommendation. Active amendments are counted and listed.
- **`SUPERSEDED`**: Candidate receives a scoring penalty (0.70x multiplier), generates a warning, and points to the successor standard (`SUPERSEDED_BY` link).
- **`WITHDRAWN`**: Standard receives a severe penalty (0.40x multiplier), cannot proceed as primary recommendation, and produces an explicit disqualification notice.
- **`UNDER_REVIEW`**: Flagged with an alert indicating that a BIS sectional committee draft amendment is pending.

---

## 5. Related Standards & Knowledge Graph (`relatedStandardsService.js`)
Traverses relational knowledge links in PostgreSQL:
- `MATERIAL` (e.g. IS 6911:2017 for stainless steel sheet/strip)
- `COMPONENT` (e.g. IS 7466 for rubber sealing gaskets)
- `SAFETY` (e.g. IS 302 Part 1 for electrical appliance baseline safety)
- `TEST_METHOD` (e.g. Proof pressure test procedures)
- `SUPERSEDED_BY` (Evolutionary standard lineage)

---

## 6. Certification & Statutory QCO Logic (`certificationService.js`)
**Anti-hallucination guard**: The LLM is never permitted to invent statutory compliance obligations.
- **Rule-based engine** provides verified statutory orders:
  - `IS 2347:2023`: Mandatory Scheme I (ISI Mark) under Domestic Pressure Cooker (Quality Control) Order, DPIIT.
  - `IS 10322 (Part 5/Sec 3):2012`: Mandatory CRS / Public Lighting Guidelines.
  - `IS 374:2019`: Mandatory BEE Star Labeling Schedule + BIS Scheme I license.
- Clearly marked as demonstration rules with versioned Gazette order references.

---

## 7. Evidence Collection (`evidenceService.js`)
- Queries verified clause citations linked to the candidate standard (`SCOPE`, `REQUIREMENT`, `MATERIAL`, `CURRENTNESS`, `CERTIFICATION`).
- **Strict Fallback Rule**: If exact source evidence is unavailable in the database, the engine returns:
  `"Supporting evidence unavailable in current dataset."`
- Never invents simulated clause numbers or fabricated BIS quotes.

---

## 8. Recommendation States
The engine returns one of four definitive states:

1. **`RECOMMENDED`**:
   - Top candidate score $\ge 0.60$.
   - Currentness status is acceptable (`CURRENT` or `UNDER_REVIEW`).
   - Supporting evidence exists.
2. **`CLARIFICATION_REQUIRED`**:
   - Top candidate score between $0.25$ and $0.60$, OR
   - Top two candidates are closer than the ambiguity threshold ($< 0.06$ gap), OR
   - Essential attributes (such as primary product type) were not provided.
3. **`INSUFFICIENT_EVIDENCE`**:
   - A candidate is partially matched, but mandatory verification evidence or standard validity is absent.
4. **`NO_MATCH`**:
   - No candidate standard in the repository scored $\ge 0.25$ (e.g. handcrafted heritage artifacts or completely uncataloged items). Zero confidence returned.

---

## 9. Grounded Explanation & Audit Trail
- **Grounded Synthesis**: Natural-language explanation generated strictly from verified attributes, reasons, currentness, certification rules, and related standards.
- **Traceable Traceability**: Every evaluation automatically creates an `AuditEvent` with action `RECOMMENDATION_CREATED`, storing the exact match score, timestamp, and actor ID.
