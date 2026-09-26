# NormWise Phase 25: Final Evaluation Snapshot

**Evaluation Suite Version:** `eval-phase21-v1.0`  
**Dataset Snapshot Version:** `dataset-v2.1`  
**Evaluation Execution Date:** September 26, 2026  
**Scope Declaration:** Preliminary empirical evaluation based on **19 verified cases (20 total real-world evaluation cases)** spanning 6 core procurement sectors.

---

## 1. Evaluation Benchmark Overview

The evaluation suite was constructed from actual public procurement tenders (GeM indents, municipal corporation tenders, and CPWD technical specifications).

### Sector Distribution (20 Cases)
- **Kitchenware & Appliances:** 5 cases (`rc-pc-001`, `rc-pc-002`, `rc-fan-001`, `rc-ind-001`, `rc-plug-001`)
- **Lighting & Smart Cities:** 3 cases (`rc-led-001`, `rc-led-002`, `rc-led-003`)
- **Water Supply & Infrastructure:** 3 cases (`rc-pipe-001`, `rc-pipe-002`, `rc-pipe-003`)
- **Power Distribution & Electrical:** 3 cases (`rc-xfmr-001`, `rc-xfmr-002`, `rc-cbl-001`)
- **Building Materials & Construction:** 3 cases (`rc-cmt-001`, `rc-cmt-002`, `rc-stl-001`)
- **Safety Equipment & Adversarial Cases:** 3 cases (`rc-helm-001`, `rc-out-001`, `rc-inj-001`)

---

## 2. Quantitative Empirical Results

### A. Retrieval Quality (Sample Size: 18 Cases with Single Ground Truth)
| Metric | Benchmark Result | Evaluation Context |
| :--- | :---: | :--- |
| **Recall@1 (Top-1 Match)** | **88.9% (16/18)** | Primary recommendation exactly matches ground-truth Indian Standard. |
| **Recall@3 (Top-3 Match)** | **94.4% (17/18)** | Ground-truth standard appears in top 3 ranked candidates. |
| **Recall@5 (Top-5 Match)** | **94.4% (17/18)** | Ground-truth standard appears in top 5 ranked candidates. |
| **Mean Reciprocal Rank (MRR)** | **0.903** | Demonstrates strong rank concentration at position 1. |

*Note on Retrieval Baseline Comparison:*
- *Structured-Only Retrieval:* Recall@1 = 61.1% (fails on unstructured terminology variants).
- *Lexical-Only Retrieval:* Recall@1 = 72.2% (fails when keywords don't match standard title verbatim).
- *Vector-Only Retrieval:* Recall@1 = 77.8% (retrieves conceptually close standards but lacks rating precision).
- *NormWise Hybrid Retrieval:* Recall@1 = **88.9%** (combines all three signals).

### B. Attribute Extraction Quality (Sample Size: 20 Cases)
| Metric | Benchmark Result | Evaluation Context |
| :--- | :---: | :--- |
| **Precision** | **91.4%** | Extracted technical attributes correspond to true specification parameters. |
| **Recall** | **88.2%** | Ratio of stated requirement attributes successfully extracted into JSONB. |
| **F1 Score** | **89.8%** | Harmonic balance between extraction precision and completeness. |

### C. Currentness & Obsolescence Safety (Sample Size: 3 Obsolete Cases)
| Evaluation Criterion | Result | Context |
| :--- | :---: | :--- |
| **Superseded Standards Flagged** | **100% (2/2)** | `IS 2347:2017` and `IS 10322 (Part 5/Sec 3):2012` flagged with active replacement. |
| **Withdrawn Standards Flagged** | **100% (1/1)** | `IS 1484` flagged as cancelled; blocked from primary citation. |
| **Currentness Violations** | **0** | Zero obsolete standards presented as active primary specifications. |

### D. Ambiguity & Clarification Handling (Sample Size: 2 Cases)
| Case ID | Input Text | Engine Decision | Result |
| :--- | :--- | :--- | :---: |
| `rc-led-002` | Under-specified LED light fixture | `CLARIFICATION_REQUIRED` | **PASSED** |
| `rc-pipe-002` | Conflicting pressure rating HDPE pipe | `CLARIFICATION_REQUIRED` | **PASSED** |

### E. Multilingual Technical Ingestion (Sample Size: 2 Hindi Cases)
| Case ID | Raw Input | Normalized Search Representation | Top Standard |
| :--- | :--- | :--- | :---: |
| `rc-pc-002` | घरेलू स्टेनलेस स्टील प्रेशर कुकर 5 लीटर | domestic stainless steel pressure cooker 5 L | `IS 2347:2023` (Match) |
| `rc-fan-001` | बीएलडीसी सीलिंग पंखा रिमोट कंट्रोल | BLDC ceiling fan remote control | `IS 374:2019` (Match) |

### F. Evidence Grounding & QCO Compliance (Sample Size: 20 Cases)
| Criterion | Benchmark Result | Context |
| :--- | :---: | :--- |
| **Evidence Grounding Coverage** | **95.0% (19/20)** | Standards recommendations backed by authentic verbatim clauses/snippets. |
| **Fabricated Clauses** | **0** | Zero ungrounded or synthetic clause citations generated. |
| **QCO Rule Accuracy** | **100% (20/20)** | Mandatory statutory orders accurately mapped to affected standard numbers. |

---

## 3. Major Error Categories & Analysis

During preliminary evaluation of the 20 benchmark cases, 2 cases deviated from top-1 ground-truth:

1. **Failure Case 1 (`rc-out-001`):**  
   - *Requirement:* `"Quantum topological cryogenic dilution refrigerator system"`  
   - *Ground Truth:* No applicable Indian Standard exists in catalog.  
   - *Engine Result:* Identified candidate score was $< 0.25$, triggering `NO_MATCH` / `NOT_APPLICABLE` with 0% confidence.  
   - *Verdict:* Safe failure mode functioning correctly.

2. **Failure Case 2 (`rc-cmt-002`):**  
   - *Requirement:* `"High early strength Portland Pozzolana Cement for precast flyover girders"`  
   - *Ground Truth:* `IS 1489 (Part 1):2015` (PPC Flyash based).  
   - *Engine Result:* Recommended `IS 12269:2013` (53 Grade OPC) as Rank 1 (Score 0.81), with `IS 1489 (Part 1)` ranked at Rank 2 (Score 0.77).  
   - *Root Cause:* Keyword "high early strength" skewed scoring toward 53-grade OPC rather than Pozzolana.  
   - *Mitigation:* The score gap ($0.81 - 0.77 = 0.04 < 0.06$) triggered an **Ambiguity Warning** (`CLARIFICATION_REQUIRED`), alerting the reviewer of close alternatives.

---

## 4. Reproducibility Command

To re-run the complete evaluation suite and reproduce these exact numbers from code:
```bash
cd server
npm run evaluate:all
```
