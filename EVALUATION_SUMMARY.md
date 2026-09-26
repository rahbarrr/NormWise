# NormWise: Evaluation Summary & Empirical Benchmark Results

**Evaluation Run ID:** `aa676ed6-6d87-4c78-a9e0-942f5c9f5fec`  
**Dataset Version:** `2026.09`  
**Evaluation Scope:** Preliminary evaluation on 19 verified cases (20 total real-world evaluation cases)  
**Date of Run:** September 26, 2026  
**Module:** `server/src/services/evaluationService.js`  

---

## 1. Evaluation Methodology & Scope Disclosures

> **Preliminary Evaluation Notice:**  
> The metrics presented in this summary are internal engineering diagnostic signals measured directly from the **20 authentic procurement test cases** in `server/data/evaluation/real-case/`. Because the benchmark corpus contains 19 verified cases, these results represent an empirical quality assessment of the core catalog rather than an exhaustive statistical proof across all 20,000+ Indian Standards.
>
> **Statutory Disclaimer:**  
> Recommendation scores are algorithmic matching signals, NOT official Bureau of Indian Standards (BIS) conformity scores or statutory compliance certifications.

---

## 2. Dataset Stratification & Category Breakdown

| Category | Cases Count | Primary Standards Evaluated | Typical Procurement Tender Application |
|---|---|---|---|
| **`pressure-cooker`** | 6 | `IS 2347:2023`, `IS 6911:2017`, `IS 7466:1994` | Mid-day meal schemes, institutional canteens, domestic utensils |
| **`lighting`** | 4 | `IS 10322 (Part 5/Sec 3):2012`, `IS 16103`, `IS 16102` | Municipal LED street lighting, highway road illumination |
| **`electrical-accessories`** | 5 | `IS 3854:1997`, `IS 1293:2019`, `IS 302 (Part 1):2024` | CPWD building wiring, commercial plugs/sockets, appliance safety |
| **`other-authorized-categories`** | 5 | `IS 374:2019`, `IS 1239:2004`, `IS 4984:2016` | Ceiling fans, HDPE potable water distribution pipes, out-of-scope negative controls |

### Verification Levels
- **`VERIFIED` (19 Cases):** Ground-truth standards corroborated against official BIS Gazette notifications and Ministry QCO orders. Included in precision/recall calculations.
- **`UNVERIFIED` (1 Case):** Emerging domain (solar hybrid agricultural inverter); excluded from recall calculations to prevent metric pollution.

---

## 3. Measured Retrieval Performance Metrics

*Measured strictly over the 18 verified labelled cases having expected standards in the authorized database.*

| Metric | Measured Score | Verified Labelled Cases | Engineering Interpretation |
|---|---|---|---|
| **Recall@1** | **88.9%** | 18 | Target standard correctly selected as the primary recommendation |
| **Recall@3** | **88.9%** | 18 | Target standard present within top-3 candidate recommendations |
| **Recall@5** | **94.4%** | 18 | Target standard present within top-5 candidate recommendations |
| **Recall@10** | **94.4%** | 18 | Target standard successfully retrieved in the candidate window |
| **Mean Reciprocal Rank (MRR)** | **0.903** | 18 | Harmonic mean of target standard ranking position |

---

## 4. Multi-Strategy Retrieval Benchmark Comparison

Empirical performance measured across the four candidate generation strategies on identical requirements:

| Retrieval Strategy | Recall@1 | Recall@5 | Avg Latency | Candidate Count | Primary Limitation / Failure Mode |
|---|---|---|---|---|---|
| **1. Structured Matching** | 22.2% | 22.2% | 4 ms | 1–2 | Misses unstructured tender descriptions lacking code numbers |
| **2. Lexical Search (BM25)** | 77.8% | 88.9% | 12 ms | 5–15 | Vulnerable to technical synonyms, transliterations, and typos |
| **3. Vector Search (pgvector)** | 72.2% | 88.9% | 22 ms | 10–20 | Lower lexical precision on specific sub-clauses and part numbers |
| **4. Hybrid Search (RRF)** | **88.9%** | **94.4%** | **30 ms** | **10–20** | **Optimal:** Combines exact standard number precision with semantic intent |

> **Evaluation Finding:** Measured results demonstrate that Hybrid Search outperforms single-mode retrieval by combining lexical precision on part numbers with dense vector tolerance for variable tender phrasing.

---

## 5. Currentness, Compliance, and Safety Invariants

- **Currentness Classification Accuracy:** **100.0%**
- **Safety Invariant Violations:** **0** (Zero superseded or withdrawn standards recommended as active)
- **Supersede Handling:** In `rc-pc-004` (tender citing superseded `IS 2347:2014`), the engine successfully promoted active `IS 2347:2023` and attached a supersede advisory.
- **Evidence Traceability Coverage:** **90.0%** of generated claims bound to official clauses.
- **Deterministic QCO Enforcement:** 100% adherence to deterministic rule evaluation; zero LLM compliance overrides.

---

## 6. Standardized Error Taxonomy Breakdown

The 3 failing cases in the 20-case evaluation run were classified into two standardized error categories:

```text
Error Taxonomy Distribution:
├── AMBIGUOUS_HANDLING_ERROR : 2 occurrences (rc-lt-002, rc-ea-003)
│   └── Root Cause: Underspecified requirements triggered recommendations rather than clarification.
└── MULTILINGUAL_ERROR       : 1 occurrence  (rc-lt-004)
    └── Root Cause: Marathi transliteration missed specific IP rating attribute token.
```
No critical errors occurred in `CURRENTNESS_ERROR`, `NO_MATCH_HANDLING_ERROR`, `COMPLIANCE_ERROR`, or `EVIDENCE_ERROR`.
