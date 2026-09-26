# NormWise Evaluation Methodology & Quality Testing Framework

**Document Version:** 1.0.0 (Phase 21)  
**System Module:** `server/src/services/evaluationService.js`  
**API Surface:** `/api/admin/evaluation/*`  
**CLI Suites:** `npm run evaluate:*`

---

## 1. Evaluation Objectives

The NormWise Evaluation Framework provides systematic, quantitative, and reproducible measurement of standards recommendation performance. Its primary engineering goals are:

1. **Retrieval Verification:** Determine whether the engine retrieves applicable Indian Standards and places the gold standard at the top of candidate rankings.
2. **Attribute Fidelity:** Verify whether extraction accurately parses product, material, application, capacity, ratings, and terminology.
3. **Ambiguity Safety:** Ensure underspecified requirements trigger `CLARIFICATION_REQUIRED` rather than forcing low-confidence matches.
4. **Currentness Integrity:** Guarantee that superseded or withdrawn standards are never silently recommended as active standards.
5. **Knowledge Graph Traversal:** Validate that allied standards (test methods, safety, components, materials) are correctly connected.
6. **Deterministic Compliance:** Verify that statutory QCO compliance evaluations run deterministically and are never overridden by LLM speculation.
7. **Evidence Groundedness:** Audit that all recommendations link directly to official BIS gazette clauses, scope definitions, and currentness records.
8. **Cross-Lingual Preservation:** Verify that multilingual inputs (Hindi, Marathi, Bengali) retrieve equivalent standards to their English baselines.

---

## 2. Evaluation Run Lifecycle & Reproducibility

Every evaluation run is tracked as a persistent, immutable record in PostgreSQL via Prisma:

```prisma
model EvaluationRun {
  id              String             @id @default(uuid())
  datasetVersion  String             @default("2026.09")
  engineVersion   String             @default("hybrid-v1")
  retrievalMode   String             @default("hybrid")
  embeddingModel  String             @default("sentence-transformers/all-MiniLM-L6-v2")
  totalCases      Int
  completedCases  Int                @default(0)
  failedCases     Int                @default(0)
  metricsSummary  Json?
  startedAt       DateTime           @default(now())
  completedAt     DateTime?
  createdBy       String?            @default("system")
  results         EvaluationResult[]
}
```

### Reproducibility Controls
- **Zero In-Place Overwrites:** Each execution generates a new unique `runId`. Prior runs remain permanently preserved for regression tracking.
- **Environment Telemetry:** Every run records `datasetVersion`, `engineVersion`, `retrievalMode`, and `embeddingModel`.
- **Reproducibility Guarantee:** Executing the evaluation against the same dataset version and engine configuration produces deterministic recall, currentness, and compliance metrics.

---

## 3. Retrieval Metrics Formulation

Retrieval metrics are computed **strictly over verified cases** with known gold standards (`verificationLevel === 'VERIFIED'`). Unverified cases and no-match cases are segregated to prevent metric pollution.

### Acceptable Standards
A recommendation is marked correct at rank $k$ if any standard in `expectedStandards` or `acceptableAlternatives` matches the standard at rank $k$ (e.g. `IS 2347:2023` matches `IS 2347`).

### 1. Recall@K
$$\text{Recall@K} = \frac{1}{|V|} \sum_{i \in V} \mathbb{I}(\text{rank}(i) \le K)$$
Where:
- $V$ is the set of verified evaluation cases having expected standards.
- $\text{rank}(i)$ is the 1-indexed position of the first matching expected or acceptable standard in the candidate list.
- $\mathbb{I}(\cdot)$ is the indicator function (1 if condition holds, 0 otherwise).
- Measured at $K \in \{1, 3, 5, 10\}$.

### 2. Mean Reciprocal Rank (MRR)
$$\text{MRR} = \frac{1}{|V|} \sum_{i \in V} \frac{1}{\text{rank}(i)}$$
If an expected standard is not present in top-10 candidates, $\frac{1}{\text{rank}(i)} = 0$.

---

## 4. Attribute Extraction Evaluation

The evaluation compares expected attributes against attributes extracted by the NLP and regex pipeline:

| Classification | Definition | Scoring Weight |
|---|---|---|
| **`EXACT_MATCH`** | Normalized string exactly equals normalized expected value. | 1.0 |
| **`PARTIAL_MATCH`** | String contains expected value or vice versa (e.g., *"Stainless Steel AISI 304"* vs *"Stainless Steel"*). | 0.5 |
| **`MISSING`** | Attribute was expected in ground truth but extraction returned `null` or empty string. | 0.0 |
| **`INCORRECT`** | Attribute extracted does not overlap with expected attribute. | 0.0 |

$$\text{Attribute Accuracy} = \frac{\text{Exact Matches} + 0.5 \times \text{Partial Matches}}{\text{Total Evaluated Attributes}}$$

---

## 5. Currentness & Safety Invariants

NormWise enforces a strict safety invariant:
> **Core Invariant:** High semantic match score must NEVER override currentness constraints.

- **Status Categories:** `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, `UNKNOWN`.
- **Violation Condition:** If an evaluation case contains a known `WITHDRAWN` or `SUPERSEDED` standard and the engine recommends it as `CURRENT` without an active replacement warning, a `CURRENTNESS_SAFETY_VIOLATION` is triggered.
- **Expected Engine Behavior:**
  1. Identify current replacement candidate.
  2. Flag outdated candidate as `SUPERSEDED` or `WITHDRAWN`.
  3. Include prominent advisory notes.

---

## 6. Ambiguity Handling & Clarification Evaluation

Requirements lacking material, capacity, or rating must trigger clarification:

- **Target States:** `CLARIFICATION_REQUIRED`, `INSUFFICIENT_EVIDENCE`, `NO_MATCH`.
- **Metrics:**
  $$\text{Clarification Precision} = \frac{\text{Underspecified Cases Correctly Clarified}}{\text{Total Cases Triggering Clarification}}$$
  $$\text{Clarification Recall} = \frac{\text{Underspecified Cases Correctly Clarified}}{\text{Total Ground-Truth Ambiguous Cases}}$$

---

## 7. Deterministic Compliance Engine Isolation

NormWise separates compliance rule evaluation from LLM generation:
- QCO rules (e.g. Domestic Pressure Cookers Order, 2020) execute deterministically via `complianceRuleService.js`.
- The evaluation compares `expectedComplianceOutcome` against `rec.compliance.overallOutcome`:
  - `POTENTIALLY_APPLICABLE`
  - `NOT_IDENTIFIED`
  - `REQUIRES_REVIEW`
  - `INSUFFICIENT_EVIDENCE`
  - `UNKNOWN`
- **Integrity Rule:** The LLM is prohibited from modifying or overriding the deterministic compliance engine outcome.

---

## 8. Evidence Coverage Classification (Section 10)

For every recommendation, evidence claims are evaluated across six dimensions:

1. **Standard Identity:** Verified standard number present in official database (`SUPPORTED` / `NOT_AVAILABLE`).
2. **Standard Title:** Verified full official title present (`SUPPORTED` / `NOT_AVAILABLE`).
3. **Currentness:** Active status corroborated by gazette or directory (`SUPPORTED` / `UNSUPPORTED`).
4. **Relationships:** Normative references or allied standards linked (`SUPPORTED` / `UNSUPPORTED`).
5. **Compliance:** Statutory QCO reference or certified scheme attached (`SUPPORTED` / `UNSUPPORTED`).
6. **Recommendation Rationale:** Traceable match rationale referencing technical characteristics (`SUPPORTED` / `UNSUPPORTED`).

---

## 9. Multi-Strategy Retrieval Benchmark

NormWise evaluates four distinct candidate generation strategies on identical requirements:

1. **Structured Matching:** Exact matches on `standardNumber`, `codeNumber`, or product alias keys.
2. **Lexical / BM25:** Full-text PostgreSQL search matching titles, keywords, and description terms.
3. **Vector Search:** Dense embeddings in `pgvector` computing cosine similarity.
4. **Hybrid Search:** Reciprocal Rank Fusion (RRF) combining Structured, Lexical, and Vector candidates.

Metrics recorded per strategy:
- Recall@1, Recall@3, Recall@5, Recall@10
- Latency (ms)
- Candidate count
- Missing candidates & False candidates
