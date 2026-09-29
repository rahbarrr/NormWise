# NormWise Recommendation Pipeline

## Pipeline Execution Stages

```
Requirement Text / Document
       │
       ▼
1. Requirement Processing
   ├── Normalization (text & units)
   └── Structured Attribute Extraction (Product, Material, Capacity, Characteristics)
       │
       ▼
2. Candidate Retrieval
   ├── Structured Keyword & Attribute Filter
   ├── Full-Text Search (PostgreSQL FTS)
   └── Semantic Vector Search (pgvector)
       │
       ▼
3. Candidate Ranking
   ├── Multi-Factor Scoring (Product, Material, Application, Scope)
   └── Optional ML Reranker (POST /rerank)
       │
       ▼
4. Currentness Validation
   └── Status Check (CURRENT vs SUPERSEDED vs WITHDRAWN)
       │
       ▼
5. Related Standards Graph
   └── Normative References, Test Methods, Component Standards
       │
       ▼
6. Certification & Compliance
   └── QCO Mandates, ISI Scheme, Hallmark Check
       │
       ▼
7. Evidence Assembly
   └── Grounded Excerpts & Clause Citations (No Hallucinations)
       │
       ▼
8. Final Recommendation Payload
       │
       ▼
9. Human Review & Decision
   └── ACCEPTED / UNDER_TECHNICAL_REVIEW / CLARIFICATION_REQUESTED / NOT_APPLICABLE
       │
       ▼
10. Immutable Audit Logging
```

## Resilience & Fallbacks

- **ML Service Unavailability**: Falls back immediately to deterministic multi-factor scoring.
- **pgvector Extension Inactive**: Gracefully degrades to hybrid Structured + PostgreSQL FTS.
- **Missing Supporting Evidence**: Returns `"Supporting evidence unavailable in current dataset"` rather than fabricating clause data.
