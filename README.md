# NormWise

> **AI-Powered Indian Standards Intelligence for Procurement**  
> Identify applicable Indian Standards (IS), verify their statutory status, evaluate mandatory certification requirements, and generate tender-ready clauses.

---

## 📌 Overview
**NormWise** is an enterprise standards intelligence platform built for public sector undertakings (PSUs), government procurement officers, technical evaluation committees, and audit bodies. It bridges natural language procurement requirements with statutory Bureau of Indian Standards (BIS) specifications, mandatory Quality Control Orders (QCOs), and ready-to-use GeM (Government e-Marketplace) tender clauses.

---

## 🏛️ System Architecture

```text
                     INTERNET
                        │
                        ▼
                  HTTPS / Domain
                        │
                 ┌──────▼──────┐
                 │ Nginx Ingress│ (SSL Termination, Rate Limiting, Compression)
                 └──────┬──────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   /api/* (Port 5001)           /* (Port 80)
┌───────────────────────┐   ┌───────────────────────┐
│ NormWise Backend API  │   │ NormWise Frontend SPA │
│ (Node.js 20 Alpine)   │   │ (Nginx static build)  │
└───────────┬───────────┘   └───────────────────────┘
            │
            ├───────────────┐
            ▼               ▼
 ┌───────────────────┐ ┌──────────────┐
 │ PostgreSQL 16     │ │ Local Volume │
 │ + pgvector        │ │ /app/uploads │
 └───────────────────┘ └──────────────┘
```

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend:** Node.js 20, Express.js REST API
- **Database:** PostgreSQL 16 with `pgvector`
- **ORM:** Prisma ORM
- **Security & RBAC:**
  - `bcryptjs` password hashing with timing-safe verification
  - Server-backed sessions (`sessions` table) with SHA-256 hashed token storage
  - HTTP-only, SameSite, Secure cookies
  - Companion anti-CSRF token verification on state-changing requests
  - Sliding-window rate limiters on auth, uploads, and APIs
  - Helmet CSP, CORS allowlist binding, and Zod input validation
  - Append-only audit trails (`AuditEvent`)
- **Containerization & Deployment:** Docker, Docker Compose, Multi-Stage Builds, Nginx Reverse Proxy

---

## 🏆 Smart India Hackathon (SIH) Demonstration

NormWise features a dedicated **SIH Demonstration Mode (`/demo`)** designed for live presentation:
- **Case 1: Stainless Steel Pressure Cooker** (IS 2347:2023, DPIIT QCO mandatory ISI certification)
- **Case 2: Outdoor Municipal LED Street Luminaire** (IS 10322:2012, BIS CRS registration)
- **Case 3: Commercial Induction Cooking Range** (IS 302:2024, electrical safety & insulation testing)

👉 See the complete presentation script in [DEMO_GUIDE.md](DEMO_GUIDE.md).

---

## 👥 Roles & Test Users (Development Only)

NormWise supports 4 controlled institutional roles:

| Role | Test Email | Default Dev Password | Primary Responsibilities |
|---|---|---|---|
| `PROCUREMENT_OFFICER` | `officer@normwise.local` | `NormWise2026!` | Enter requirements, upload specs, generate recommendations, self-approval blocked |
| `TECHNICAL_REVIEWER` | `reviewer@normwise.local` | `NormWise2026!` | Review queue, clause evidence inspection, compliance approvals, clarification requests |
| `AUDITOR` | `auditor@normwise.local` | `NormWise2026!` | Strictly read-only access to recommendations, evidence, evaluation runs, and audit logs |
| `ADMIN` | `admin@normwise.local` | `NormWise2026!` | Manage users, telemetry monitoring, dataset imports, terminology normalization |

---

## 🐳 Quickstart with Docker Compose

Run the entire stack (Database + Backend + Frontend) with a single command:

```bash
# 1. Start containers in the background
docker compose up -d --build

# 2. Deploy database migrations
docker compose exec backend npx prisma migrate deploy

# 3. Seed reference standards catalog
docker compose exec backend npm run db:seed

# 4. Run automated smoke tests
docker compose exec backend npm run smoke:test
```

Access the application at `http://localhost:3000` (or port 80).

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v20 or higher
- **PostgreSQL**: v16+ with `pgvector` extension

### 2. Install & Configure
```bash
# Install root and backend dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env
cp server/.env.example server/.env

# Run database migrations and seed
cd server
npx prisma migrate deploy
npm run db:seed
cd ..
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend API (Port 5001)
cd server && npm run dev

# Terminal 2: Frontend App (Port 5173)
npm run dev
```

---

## 🧪 Automated Testing & Smoke Test

NormWise includes 174 automated unit, integration, and security tests plus a live production smoke test suite:

```bash
cd server

# Run full test suite (174 tests across 10 suites)
npm test

# Run live non-destructive smoke test
npm run smoke:test

# Run backup and restore scripts
npm run db:backup
npm run db:restore
```

---

## 🧭 Application Routes

| Route | View | Access Role | Description |
|---|---|---|---|
| `/login` | **Authentication** | Public | Secure email/password login with dev role selectors |
| `/` | **Dashboard** | All Authenticated | Executive summary, requirement input, statistics |
| `/demo` | **SIH Demo Mode** | All Authenticated | Interactive 3-scenario walkthrough for SIH evaluators |
| `/recommend` | **New Recommendation** | Officer, Reviewer, Admin | Multi-attribute procurement wizard and BIS matching |
| `/results/:id` | **Results** | All Authenticated | Recommended standard, match rationale, evidence drawer |
| `/evidence/:id` | **Evidence Matrix** | All Authenticated | Clause-by-clause traceability matrix |
| `/review/:id` | **Human Review Queue** | Reviewer, Admin | Technical verification checklist and decision workflows |
| `/documents` | **Upload Specification** | Officer, Reviewer, Admin | PDF/DOCX tender extraction pipeline |
| `/history` | **Audit History** | All Authenticated | Append-only procurement audit logs |
| `/admin/monitoring` | **System Monitoring** | Admin Only | Real-time telemetry, service health, response latency |
| `/admin/users` | **User Management** | Admin Only | User directory, role reassignments, and account activation |
| `/admin/security` | **Security Check** | Admin, Auditor | Automated defense-in-depth configuration report |
| `/admin/data` | **Dataset Admin** | Admin Only | Standards JSON/CSV/XLSX import pipeline |
| `/admin/terminology` | **Terminology Review** | Admin Only | Multilingual Indic technical term normalization |
| `/admin/evaluation` | **Evaluation Benchmark** | Admin, Auditor | Precision/Recall@K quality benchmarks |
| `/saved` | **Saved Library** | All Authenticated | Bookmarked standards and tender clauses |
| `/settings` | **Settings & Security** | All Authenticated | User profile, password change, session logout |
| `/help` | **Documentation & FAQ** | All Authenticated | Standards intelligence guide, BIS Act 2016, QCOs |

---

## 📚 Documentation Directory

- **Deployment Guide:** [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Docker Architecture:** [`DOCKER.md`](DOCKER.md)
- **Backup & Disaster Recovery:** [`BACKUP_AND_RESTORE.md`](BACKUP_AND_RESTORE.md)
- **System Monitoring & Telemetry:** [`MONITORING.md`](MONITORING.md)
- **Pre-Flight Deployment Checklist:** [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
- **SIH Demonstration Walkthrough:** [`DEMO_GUIDE.md`](DEMO_GUIDE.md)
- **12-Step Procurement Journey:** [`END_TO_END_WORKFLOW.md`](END_TO_END_WORKFLOW.md)
- **UI States Specification:** [`UX_STATES.md`](UX_STATES.md)
- **Security Architecture:** [`SECURITY.md`](SECURITY.md)
- **Granular RBAC Policy:** [`server/AUTHORIZATION.md`](server/AUTHORIZATION.md)
- **REST API Specification:** [`server/API.md`](server/API.md)
