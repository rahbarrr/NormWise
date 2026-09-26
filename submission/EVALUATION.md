# Submission: Empirical Evaluation Summary

**Evaluation Scope:** Preliminary evaluation on 19 verified cases (20 total real-world evaluation cases)  
**Dataset Version:** `2026.09`  
**Run ID:** `aa676ed6-6d87-4c78-a9e0-942f5c9f5fec`  

---

## 1. Measured Retrieval Performance

*Calculated strictly over the 18 verified labelled cases having expected Indian Standards in the database.*

| Metric | Measured Score | Engineering Meaning |
|---|---|---|
| **Recall@1** | **88.9%** | Correct standard selected as the primary recommendation |
| **Recall@3** | **88.9%** | Correct standard present in top-3 candidates |
| **Recall@5** | **94.4%** | Correct standard present in top-5 candidates |
| **Recall@10** | **94.4%** | Correct standard retrieved in initial candidate window |
| **Mean Reciprocal Rank (MRR)** | **0.903** | Harmonic mean of target standard ranking position |

---

## 2. Multi-Strategy Candidate Retrieval Benchmark

| Retrieval Strategy | Recall@1 | Recall@5 | Avg Latency | Candidate Count |
|---|---|---|---|---|
| **1. Structured Matching** | 22.2% | 22.2% | 4 ms | 1–2 |
| **2. Lexical Search (BM25)** | 77.8% | 88.9% | 12 ms | 5–15 |
| **3. Vector Search (pgvector)** | 72.2% | 88.9% | 22 ms | 10–20 |
| **4. Hybrid Search (RRF)** | **88.9%** | **94.4%** | **30 ms** | **10–20** |

---

## 3. Safety & Diagnostic Telemetry

- **Currentness Safety Adherence:** **100.0%** (Zero superseded or withdrawn standards recommended as active)
- **Evidence Traceability Coverage:** **90.0%** of generated claims bound to official clauses
- **Standardized Error Taxonomy (13 Categories):** All 3 failing cases systematically classified for continuous engineering remediation.

---

*For complete evaluation data, see [EVALUATION_SUMMARY.md](../EVALUATION_SUMMARY.md) and [evaluation-report.md](../evaluation-report.md).*
