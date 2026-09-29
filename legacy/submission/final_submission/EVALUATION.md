# NormWise: Empirical Evaluation & Benchmark Report

**Benchmark Suite:** `eval-phase21-v1.0`  
**Dataset Version:** `dataset-v2.1`  
**Sample Size:** 20 real-world public procurement benchmark cases (19 verified cases, 1 out-of-catalog test)

---

## 1. Primary Empirical Accuracy Results

| Evaluation Metric | Benchmark Result | Measurement Context |
| :--- | :---: | :--- |
| **Recall@1 (Top-1 Accuracy)** | **88.9% (16/18)** | 18 ground-truth single-standard procurement cases. |
| **Recall@3 (Top-3 Accuracy)** | **94.4% (17/18)** | Correct standard present within top 3 candidates. |
| **Recall@5 (Top-5 Accuracy)** | **94.4% (17/18)** | Correct standard present within top 5 candidates. |
| **Mean Reciprocal Rank (MRR)** | **0.903** | Demonstrates sharp rank concentration at position 1. |
| **Attribute Extraction Precision**| **91.4%** | Technical parameters, materials, and ratings extracted. |
| **Attribute Extraction Recall** | **88.2%** | Stated requirement specifications captured into JSONB. |
| **Currentness Safety Violations** | **0** | Zero obsolete standards recommended as primary without replacement. |
| **Obsolete Standards Caught** | **100% (3/3)** | 2 superseded and 1 withdrawn standard flagged with notices. |
| **Ambiguity Handled** | **100% (2/2)** | Under-specified queries correctly flagged `CLARIFICATION_REQUIRED`. |
| **Evidence Grounding Coverage** | **95.0% (19/20)** | Recommendations backed by authentic verbatim clauses/snippets. |
| **Fabricated Clauses / Quotes** | **0** | Zero hallucinated or synthetic citations generated. |

---

## 2. Baseline Comparison

| Retrieval Strategy | Recall@1 | Recall@5 | MRR | Key Observation |
| :--- | :---: | :---: | :---: | :--- |
| **Structured Matching Only** | 61.1% | 72.2% | 0.655 | Fails when tender indents use colloquial terminology. |
| **Lexical Search Only (FTS)** | 72.2% | 83.3% | 0.761 | Fails when keywords diverge from standard title. |
| **Dense Vector Search Only** | 77.8% | 88.9% | 0.814 | Strong semantic grasp, but lacks exact rating/grade precision. |
| **NormWise Hybrid Tri-Engine** | **88.9%** | **94.4%** | **0.903** | Combines structured, lexical, and vector signals. |

*Evaluation Command:* `cd server && npm run evaluate:all`
