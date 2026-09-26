# NormWise Regression Testing & Quality Baseline Guide

**Document Version:** 1.0.0 (Phase 21)  
**Suite Command:** `npm run evaluate:all`  
**Storage Table:** `EvaluationRun`, `EvaluationResult` (PostgreSQL)

---

## 1. Objectives & Invariants

Regression testing guarantees that updates to the recommendation pipeline (e.g., embedding model updates, scoring weight adjustments, QCO rule modifications, or database schema changes) do not silently degrade recommendation quality or violate safety invariants.

### Key Invariants
1. **Never Block Development Arbitrarily:** Score changes are surfaced with clear diffs rather than causing cryptic pipeline crashes.
2. **Safety Rule Regressions Are Hard Failures:** Any change causing a superseded or withdrawn standard to be recommended as active, or causing an ambiguous requirement to force an unsupported standard, is flagged as a critical regression.
3. **Historical Run Immutability:** Historical evaluation runs are never overwritten; every test run produces a timestamped, immutable record.

---

## 2. Regression Test Procedures

### Step 1: Establish Initial Benchmark Baseline
Run the comprehensive real-case evaluation suite:
```bash
cd server
npm run evaluate:all
```
This stores an `EvaluationRun` with unique ID (e.g., `aa676ed6-6d87-4c78-a9e0-942f5c9f5fec`) and baseline metrics:
- Recall@1: `88.9%`
- Recall@3: `88.9%`
- Recall@5: `94.4%`
- Recall@10: `94.4%`
- MRR: `0.903`
- Currentness Safety: `100.0%` (0 violations)
- Evidence Coverage: `90.0%`

### Step 2: Make Engine Changes
Modify indexing, prompt engineering, tokenization, or scoring weights in `server/src/services/`.

### Step 3: Run Regression Verification
```bash
npm run evaluate:all -- --dataset=2026.09 --debug
```

### Step 4: Compare Against Baseline
The evaluation engine compares the new run against the latest baseline run:

```text
================================================================================
 REGRESSION COMPARISON REPORT
================================================================================
 Baseline Run ID:  aa676ed6-6d87-4c78-a9e0-942f5c9f5fec
 Current Run ID:   b345ef12-9901-41ab-8822-11ef88aa2233

 METRIC COMPARISON:
  - Recall@1:            88.9%  ──►  88.9%  (±0.0%)
  - Recall@5:            94.4%  ──►  94.4%  (±0.0%)
  - MRR:                 0.903  ──►  0.903  (±0.000)
  - Currentness Safety: 100.0%  ──► 100.0%  (Zero violations)
  - Evidence Coverage:   90.0%  ──►  90.0%  (±0.0%)

 CASE-LEVEL SHIFTS:
  - rc-pc-001: Rank 1 -> Rank 1 (No change)
  - rc-lt-001: Rank 1 -> Rank 1 (No change)
  - Newly failing cases: 0
  - Previously fixed cases that regressed: 0
================================================================================
```

---

## 3. Targeted Evaluation Commands

The CLI supports targeted evaluation across specific dimensions:

| Command | Purpose | Target Focus |
|---|---|---|
| `npm run evaluate:recommendations` | Full end-to-end evaluation | Recall@K, MRR, Ranking accuracy |
| `npm run evaluate:retrieval` | Candidate generation benchmark | Structured vs Lexical vs Vector vs Hybrid |
| `npm run evaluate:multilingual` | Indic language preservation | Hindi, Marathi, Bengali vs English |
| `npm run evaluate:currentness` | Standard lifecycle safety | Active vs Superseded vs Withdrawn |
| `npm run evaluate:compliance` | Statutory QCO rules | Deterministic compliance isolation |
| `npm run evaluate:all` | Comprehensive validation run | All 20 real cases + full markdown report |

### Command Flags
- `--dataset=<version>`: Select dataset version (default: `2026.09`).
- `--case=<caseId>`: Evaluate a single specific case (e.g., `--case=rc-pc-001`).
- `--mode=<hybrid|lexical|vector|structured>`: Force a specific retrieval mode.
- `--debug`: Enable verbose diagnostic telemetry including score components and candidate lists.

---

## 4. Human Review & Feedback Integration

For borderline or uncertain recommendations, technical reviewers can submit human labels via the Admin Evaluation Dashboard (`/admin/evaluation`):
- `CORRECT`
- `PARTIALLY_CORRECT`
- `INCORRECT`
- `INSUFFICIENT_EVIDENCE`
- `DATASET_ISSUE`

Human feedback is stored alongside the automated run results with reviewer ID and timestamp, providing an ongoing ground-truth calibration loop without contaminating automated metrics.
