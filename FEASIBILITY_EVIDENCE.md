# NormWise: System Feasibility & Viability Evidence

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Evaluation Scope:** Technical, Operational, Data, and Deployment Feasibility  

---

## 1. Technical Feasibility

NormWise is built entirely on mature, widely adopted open-source technologies, avoiding exotic, fragile, or non-deterministic dependencies:

| Subsystem | Implemented Technology | Feasibility Justification & Validation |
|---|---|---|
| **Frontend UI** | React 19 + Tailwind CSS | Fast initial paint; client-side routing via React Router v7; production bundle compiles via Vite in **372ms**. |
| **API Backend** | Node.js 20 LTS + Express.js | Non-blocking asynchronous I/O; native ES Modules; handles concurrent procurement queries with sub-40ms latency. |
| **Database & Search** | PostgreSQL 16 + native `pgvector` | Consolidates relational schemas, full-text GIN search, and vector cosine similarity in a single instance with zero synchronization lag. |
| **ORM Layer** | Prisma ORM 5.20+ | Type-safe migrations; zero raw SQL injection vulnerabilities; automated schema validation. |
| **Document Processing** | `pdf-parse`, `mammoth`, `tesseract.js` | Parses PDF, DOCX, and TXT tenders; local OCR fallback handles scanned images without sending sensitive data to external third parties. |
| **Architectural Constraint** | **Zero MongoDB, Zero Neo4j** | Strictly adheres to enterprise relational architecture, minimizing operational footprint and licensing complexity. |

---

## 2. Operational Feasibility

Public procurement requires rigorous compliance with the General Financial Rules (GFR), Central Vigilance Commission (CVC) guidelines, and CAG audit standards:

1. **Human-in-the-Loop Workflow:** Fits seamlessly into existing public tender committee workflows. The system assists the officer during discovery and drafting, but final approval remains with authorized human signatories.
2. **Statutory Auditability:** The PostgreSQL `AuditEvent` table provides an immutable, chronological record of every recommendation, document upload, reviewer note, and decision timestamp.
3. **Controlled & Versioned Rules:** Statutory Quality Control Orders (QCOs) are maintained as versioned schemas with effective gazette dates, allowing retrospective audits of past tenders under historical rules.

---

## 3. Data Feasibility & Provenance

1. **Public Gazette Ingestion:** Standards metadata, titles, scopes, amendments, and QCO orders are derived from public gazette notifications issued by the Bureau of Indian Standards and central ministries (DPIIT, Ministry of Power, etc.).
2. **Explicit Dataset Provenance:** Every standard, relationship edge, and compliance rule is tagged with its source publication. Demo data is clearly identified with `Demo Data` trust indicators.
3. **Realistic Dataset Scope:** The active demonstration database indexes 83 curated standards across core procurement domains. When queried on out-of-scope items, the engine safely returns `NO_MATCH` or `INSUFFICIENT_EVIDENCE` rather than fabricating data.

---

## 4. Deployment & Infrastructure Feasibility

1. **One-Command Setup:** `npm run setup:demo` (or `node scripts/setup-demo.js`) verifies environment variables, checks PostgreSQL and pgvector connectivity, applies Prisma migrations, and seeds the demonstration dataset in under 10 seconds.
2. **Containerization:** Multi-stage `Dockerfile` and `docker-compose.yml` enable standardized deployment across on-premise government servers, NIC cloud, or AWS/Azure.
3. **Automated Health Probes:**
   - Liveness Probe: `GET /api/health`
   - Readiness Probe: `GET /api/health/ready`
   - SIH Demo Readiness Probe: `GET /api/health/demo` (verifies Database, pgvector, Demo Dataset, Recommendation Engine, Compliance Engine).
