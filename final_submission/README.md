# NormWise: Final Frozen SIH 2024 Submission Dossier

**Release Version:** `v1.0.0-sih2024`  
**Base Commit:** `d205aeb`  
**Dataset Version:** `dataset-v2.1`  
**Evaluation Benchmark:** `eval-phase21-v1.0` (20 verified cases)  
**Date:** September 26, 2026

---

## Submission Package Contents

This directory contains the final frozen documentation, architecture blueprints, evaluation snapshots, live demonstration guides, and evaluator playbooks for the Smart India Hackathon (SIH 2024) Grand Finale evaluation.

### Core Dossier Documents
1. [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md): Executive overview, problem statement, core value proposition, and user personas.
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md): Complete three-tier architecture specification, tri-engine hybrid retrieval, and PostgreSQL + pgvector data flow.
3. [`FEATURES.md`](./FEATURES.md): Implemented capabilities, attribute extraction, currentness safety, allied knowledge graph, and QCO compliance.
4. [`EVALUATION.md`](./EVALUATION.md): Quantitative benchmark results (Recall@1 = 88.9%, Recall@5 = 94.4%, MRR = 0.903, 0 currentness violations).
5. [`FEASIBILITY.md`](./FEASIBILITY.md): Technical, data, operational, and deployment feasibility proofs.
6. [`RISKS.md`](./RISKS.md): Pragmatic risk analysis and architectural mitigations.
7. [`LIMITATIONS.md`](./LIMITATIONS.md): Transparent operational boundaries and dataset scope disclosures.
8. [`DEMO_GUIDE.md`](./DEMO_GUIDE.md): 5-minute timed live evaluator presentation script and quick-recovery procedures.
9. [`EVALUATOR_FAQ.md`](./EVALUATOR_FAQ.md): 15 direct, factual answers to anticipated technical and governance questions.
10. [`screenshots/`](./screenshots/README.md): Directory and capture guide for the 10 core application UI screens.
11. [`release/`](./release/README.md): Final release manifest, checksums, and deployment configuration pointers.

---

## Reproducibility & Quick Start

To verify and run the frozen release on any local development machine:

```bash
# 1. Start PostgreSQL with pgvector
docker compose up -d postgres

# 2. Run Backend & Verification Tests
cd server
npm install
npm test          # Runs 203 automated integration & security tests
npm start         # Backend runs on http://localhost:5001

# 3. Run Frontend Client (in second terminal)
cd ../client
npm install
npm run dev       # Frontend accessible on http://localhost:5173
```
