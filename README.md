# NormWise

> **AI-Powered Indian Standards Intelligence for Public Procurement**  
> Identifies applicable Bureau of Indian Standards (BIS) specifications, validates lifecycle currentness, checks mandatory Quality Control Orders (QCOs), traverses allied standards knowledge graphs, and maintains an auditable human review workflow.

---

## Problem

Public procurement across Indian government bodies (GeM, Indian Railways, CPWD, Defence, State Canteens) requires exact citations of applicable Bureau of Indian Standards (BIS). However, procurement officers face systemic bottlenecks:

1. **Information Overload:** Over 20,000 active Indian Standards exist across hundreds of technical sectional committees.
2. **Obsolete & Superseded Standards:** Tenders frequently reference withdrawn or superseded editions (e.g. citing an obsolete 1992 standard), creating statutory risks and tender disputes.
3. **Mandatory QCO Compliance:** Central ministries issue Quality Control Orders (QCOs) mandating compulsory ISI mark certification under penalty of law, but finding applicable QCO rules is manual and error-prone.
4. **AI Hallucination:** Generic LLMs frequently fabricate standard numbers, invent non-existent clauses, and quote misleading certification rules.

---

## Solution

NormWise is an evidence-backed intelligence engine that bridges raw procurement specifications with official Indian Standards:

- **Multi-Factor Hybrid Retrieval:** Combines structured code matching, PostgreSQL BM25 full-text search, and dense vector similarity via `pgvector` and Reciprocal Rank Fusion (RRF).
- **Currentness Safety Invariant:** Match score NEVER overrides currentness; superseded standards automatically promote the active edition with prominent warnings.
- **Relational Knowledge Graph:** Surfaces allied raw materials, components, and test method standards stored natively in PostgreSQL.
- **Deterministic Compliance:** Evaluates statutory QCO applicability through deterministic rule logic completely isolated from probabilistic LLM hallucinations.
- **Traceable Clause Ground Truth:** Every recommendation links directly to official BIS gazette clauses, scope definitions, and verification excerpts.
- **Human-in-the-Loop Workflow:** Mandatory technical reviewer checklists, sign-offs, and an immutable statutory audit trail.

---

## Architecture

NormWise runs on a strictly consolidated architecture with zero NoSQL or external graph databases:

```text
                                [ CLIENT BROWSER ]
                                        │
                         HTTPS / TLS (Port 443 / 5173)
                                        │
                                        ▼
                             [ NGINX REVERSE PROXY ]
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
       [ FRONTEND APPLICATION ]                       [ BACKEND API SERVER ]
        React 19 + Vite + Tailwind                     Node.js 20 + Express 4.21
        Client-Side Routing (v7)                       Stateless RESTful Endpoints
        Modular Evaluation & Audit                     RBAC & Security Middlewares
                 │                                             │
                 └──────────────────────┬──────────────────────┘
                                        │
                                        ▼
                              [ PRISMA ORM LAYER ]
                           Schema Validation & Queries
                                        │
                                        ▼
                         [ POSTGRESQL 16 + pgvector ]
                     ├── Relational Tables (Standards, Rules)
                     ├── Dense Vector Embeddings (1536-dim)
                     ├── Full-Text Search (tsvector GIN)
                     └── Knowledge Graph (StandardRelationship)
```

---

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend:** Node.js 20 LTS, Express.js 4.21 REST API
- **Database & Storage:** PostgreSQL 16 with native `pgvector` extension
- **ORM:** Prisma ORM 5.20+
- **Document Intelligence:** `pdf-parse`, `mammoth` (DOCX), `tesseract.js` (OCR fallback)
- **Security:** Helmet, CORS with credentials, HTTP-only SameSite cookies, CSRF protection, Zod validation, sliding-window rate limiters, bcryptjs
- **Prohibited Technologies:** Strictly NO MongoDB, NO Mongoose, NO Neo4j (fully relational & vector in PostgreSQL).

---

## Features

1. **Intelligent Requirement Extraction:** Extracts product type, material grade, capacity ratings, and application domain from free text or tender documents.
2. **Multilingual Processing:** Normalizes procurement tenders submitted in Hindi (HI), Marathi (MR), and Bengali (BN).
3. **Transparent "Why this standard?":** Explains recommendations using quantitative score breakdowns and qualitative attribute alignments.
4. **Allied Standards Traversal:** Traverses relational graph connections to identify component, material, and test method standards.
5. **Deterministic QCO Enforcement:** Flags mandatory ISI certification requirements under statutory orders.
6. **Uncertainty UX:** Returns `CLARIFICATION_REQUIRED` on underspecified requirements rather than forcing low-confidence guesses.
7. **Document Intelligence:** Uploads `.pdf`, `.docx`, or `.txt` tender schedules, extracts specifications, and feeds them into the analysis pipeline.
8. **Human Compliance Review Queue:** Formal reviewer checklists, notes, and approval/rejection workflows.
9. **Statutory Audit Trail:** Chronological, tamper-evident log of all recommendation, review, and administrative actions.
10. **Admin Evaluation Dashboard:** 8-tab analytical dashboard benchmarking Recall@K, MRR, error distributions, and candidate generation strategies.

---

## Setup

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 16 with `pgvector` extension installed
- Git

### Installation
Clone the repository and install root and server dependencies:
```bash
git clone https://github.com/rahbarrr/NormWise.git
cd NormWise
npm install
cd server && npm install && cd ..
```

---

## Environment Variables

Copy the provided `.env.example` templates:
```bash
# Backend environment
cp server/.env.example server/.env

# Root/Frontend environment (optional)
cp .env.example .env
```

Key variables in `server/.env`:
- `DATABASE_URL`: `postgresql://normwise:normwise_password@localhost:5432/normwise?schema=public`
- `PORT`: `5001`
- `CLIENT_URL`: `http://localhost:5173`
- `AUTH_SECRET`: Random 32+ character string
- `AUTH_COOKIE_NAME`: `normwise_session`

---

## Database Setup

1. Ensure PostgreSQL is running on port 5432.
2. Ensure the `pgvector` extension is available:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Synchronize schema via Prisma:
   ```bash
   npm run db:push
   ```

---

## Demo Setup (One-Command Setup)

To verify the environment, synchronize the database schema, and seed the demo standards catalog in one command:
```bash
npm run setup:demo
```
*Alternatively:* `node scripts/setup-demo.js` or `./scripts/setup-demo.sh`.

---

## Running the Application

Start both client and server concurrently:
```bash
npm run dev
```

The application will be accessible at:
- **Frontend SPA:** `http://localhost:5173`
- **Backend API:** `http://localhost:5001/api`
- **Demo Readiness Probe:** `http://localhost:5001/api/health/demo`
- **System Version:** `http://localhost:5001/api/version`

---

## Testing

Run the automated test suite (188 tests across 11 suites):
```bash
# Run all server tests
npm test

# Run security and RBAC tests
cd server && npm run test:security
```

---

## Evaluation (Phase 21 Benchmark Suite)

NormWise includes an empirical evaluation suite evaluating 20 authentic public procurement cases against the project's authorized database:

```bash
# Run full evaluation benchmark
npm run evaluate:all

# Targeted CLI suites
npm run evaluate:recommendations
npm run evaluate:retrieval
npm run evaluate:multilingual
npm run evaluate:currentness
npm run evaluate:compliance
```

### Measured Benchmark Telemetry
- **Recall@1:** **88.9%** (Target standard positioned at Rank 1)
- **Recall@5:** **94.4%** (Target standard present in Top-5)
- **MRR:** **0.903** (Mean Reciprocal Rank)
- **Currentness Safety Violations:** **0** (100% safety adherence)
- **Average Latency:** **30 ms/case**

---

## Project Structure

```text
NormWise/
├── ARCHITECTURE_FREEZE.md        # Architecture lock document for SIH submission
├── SIH_DEMO_SCRIPT.md            # Step-by-step evaluator walkthrough (5-7 mins)
├── TECHNICAL_DEMO_SCRIPT.md      # Deep-dive architecture and retrieval script
├── LIMITATIONS.md                # Total transparency & system boundary disclosures
├── SIH_READINESS_CHECKLIST.md    # Comprehensive verification checklist
├── DEMO_CREDENTIALS.md           # Pre-configured demo accounts
├── evaluation-report.md          # Certified Phase 21 validation report
├── package.json                  # Root scripts & client dependencies
├── scripts/
│   ├── setup-demo.js             # One-command reproducible setup runner
│   └── setup-demo.sh             # Shell setup wrapper
├── src/                          # React 19 Frontend
│   ├── components/               # Modular UI components (results, review, documents)
│   ├── pages/                    # Route canvases (Recommend, Results, Review, Admin)
│   └── services/                 # Frontend API client layer
└── server/                       # Node.js + Express Backend
    ├── data/evaluation/          # Real-case evaluation dataset (20 cases)
    ├── prisma/                   # PostgreSQL schema and seed scripts
    ├── src/
    │   ├── controllers/          # Express route controllers
    │   ├── middleware/           # Security, Auth, RBAC, CSRF, Error handling
    │   ├── routes/               # API route definitions
    │   └── services/             # Hybrid retrieval, QCO compliance, evaluation
    └── tests/                    # 11 automated test suites (188 tests)
```

---

## Security

- **Authentication:** Server-backed session store in PostgreSQL with HTTP-only, SameSite=Strict cookies.
- **CSRF Protection:** Double-submit companion anti-CSRF token verification on state-changing requests.
- **RBAC:** Four authorization tiers (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `ADMIN`, `AUDITOR`).
- **Input Validation:** Strict Zod schema parsing and sanitization across all API endpoints.
- **Error Sanitization:** Centralized error handler masks raw database errors and stack traces in production.
- **Notice:** This software is configured for demonstration and testing. Do not expose development secrets in production.

---

## Limitations

- **Catalog Breadth:** Ingested database contains 83 curated standards focusing on core public procurement categories (pressure cookers, street lighting, wiring accessories, fans, HDPE pipes).
- **Specialized Domains:** Niche sectors (aerospace hydraulics, cryogenic valves) are unindexed and return `NO_MATCH` / `INSUFFICIENT_EVIDENCE`.
- **Statutory Non-Guarantee:** NormWise is an assistive decision-support tool. It does not replace mandatory human review or constitute official statutory BIS certification.
*For full disclosures, see [`LIMITATIONS.md`](file:///Users/rahbarraza/Downloads/NormWise/LIMITATIONS.md).*

---

## SIH Demo

For hackathon evaluators and live demonstrations:
1. Run `npm run setup:demo` to verify all systems.
2. Run `npm run dev` to launch the client and server.
3. Open `http://localhost:5173/login` and use 1-click login for **Procurement Officer**.
4. Follow the step-by-step guide in [`SIH_DEMO_SCRIPT.md`](file:///Users/rahbarraza/Downloads/NormWise/SIH_DEMO_SCRIPT.md).
