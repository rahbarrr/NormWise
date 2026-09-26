# NormWise: Hybrid Retrieval Explained Simply

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Target Audience:** Evaluators, Procurement Executives, Technical Judges  

---

## 1. Why Single-Strategy Search Fails for Procurement

When finding Indian Standards for government tenders, no single search method works reliably on its own:

1. **Exact Code Search Fails** when tender officers describe their equipment in free text without knowing the exact Bureau of Indian Standards (BIS) code number.
2. **Keyword / Full-Text Search Fails** when tenders use synonyms or colloquial terms that don't match the exact words in the official standard title (e.g., searching *"food preparation autoclave"* instead of *"pressure cooker"*).
3. **Pure AI / Vector Search Fails** when exact part numbers or section numbers matter (e.g. confusing *IS 10322 Part 5 Sec 3* with *IS 10322 Part 5 Sec 1*), because dense embeddings can smooth over critical numerical distinctions.

---

## 2. How NormWise's 3-Way Hybrid Retrieval Works

NormWise solves this by combining three distinct retrieval strategies in parallel, fusing their outputs using **Reciprocal Rank Fusion (RRF)**:

```text
       [ Procurement Requirement / Tender Text ]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  STRUCTURED   │   │    LEXICAL    │   │ DENSE VECTOR  │
│    SEARCH     │   │  (BM25 / FTS) │   │  (pgvector)   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │ Exact code &      │ Terminology &     │ Conceptual &  │
        │ alias lookup      │ keyword ranking   │ semantic match│
        │                   │                   │               │
        └───────────────────┼───────────────────┘
                            │
                            ▼
              [ Reciprocal Rank Fusion (RRF) ]
                            │
                            ▼
              [ Multi-Factor Score Merge ]
```

### 1. Structured Matching (Exact Precision)
- **What it does:** Looks up known BIS code numbers (e.g., `IS 2347`, `IS 10322`), ICS codes, and curated product aliases.
- **Why it matters:** If a tender explicitly mentions a standard number or exact standardized product name, structured matching ensures it is immediately captured with 100% precision.

### 2. Lexical Search (Keyword & Terminology Matching)
- **What it does:** Executes PostgreSQL full-text search (`to_tsvector` and `websearch_to_tsquery`) against standard titles, descriptions, and scopes.
- **Why it matters:** Finds exact technical vocabulary, engineering units, and statutory phrasing. It excels at ranking standards that share specific, specialized terms with the tender schedule.

### 3. Dense Vector Search (Semantic Understanding via pgvector)
- **What it does:** Uses dense mathematical embeddings stored in PostgreSQL via the `pgvector` extension to measure cosine similarity between query intent and standard scopes.
- **Why it matters:** Bridges vocabulary gaps. If a procurement officer writes *"commercial steam cooking pot for midday school meal canteen"*, vector search recognizes the underlying intent and matches `IS 2347` (Pressure Cookers), even without exact keyword overlap.

### 4. Reciprocal Rank Fusion (RRF)
- **What it does:** Combines candidate lists from all three strategies into a unified ranking:
  $$\text{RRF Score}(d) = \sum_{m \in \{\text{structured, lexical, vector}\}} \frac{w_m}{k + \text{rank}_m(d)}$$
- Candidates discovered by multiple retrieval strategies receive a significant rank boost.

---

## 3. Critical Safety Principle: Retrieval $\neq$ Final Recommendation

> **Crucial Rule:** In NormWise, semantic similarity or a high search match score **NEVER** automatically makes a standard the final recommendation.

Three independent, non-probabilistic validation layers evaluate the candidates before any recommendation is finalized:

```text
[ Top Candidate Standards from Hybrid Retrieval ]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Currentness is Validated Separately                      │
│    Is the standard active, superseded, or withdrawn?        │
│    An outdated standard with 99% similarity is NEVER        │
│    recommended as active. Successors are promoted instead.   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Compliance is Evaluated Separately                       │
│    Deterministic Quality Control Order (QCO) rules check    │
│    if mandatory ISI certification applies under the law.     │
│    The LLM has zero authority to override compliance rules.  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Evidence is Verified Separately                          │
│    Every recommendation must bind to real BIS clauses,      │
│    gazettes, and verified scope text.                       │
│    Zero synthetic evidence is permitted.                    │
└─────────────────────────────────────────────────────────────┘
```

By decoupling **retrieval** from **statutory validation** and **evidence verification**, NormWise prevents AI hallucinations and ensures public procurement officers can trust every recommendation.
