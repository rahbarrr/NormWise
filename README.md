# NormWise

> **AI-Powered Indian Standards Intelligence for Procurement**  
> Identify applicable Indian Standards (IS), verify their current status, and understand why they apply.

---

## 📌 Overview
**NormWise** is an enterprise standards intelligence platform built for public sector undertakings (PSUs), government procurement officers, technical evaluation teams, and auditors. It bridges natural language procurement requirements with statutory Bureau of Indian Standards (BIS) specifications, mandatory Quality Control Orders (QCOs), and ready-to-use GeM (Government e-Marketplace) tender clauses.

---

## 🏛️ System Architecture

```text
                    ┌─────────────────┐
                    │   NormWise UI   │ (React + Vite + Tailwind)
                    └────────┬────────┘
                             │
                      Authentication (HTTP-Only Secure Cookie + CSRF)
                             ↓
                    ┌─────────────────┐
                    │ Auth Middleware │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Role / Permission│ (RBAC: Officer, Reviewer, Admin, Auditor)
                    │ Authorization   │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Express REST API│
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │   Prisma ORM    │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │   PostgreSQL    │ (+ pgvector for Hybrid Semantic Search)
                    └─────────────────┘
```

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend:** Node.js, Express.js REST API
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

---

## 👥 Roles & Test Users (Development Only)

NormWise supports 4 controlled institutional roles:

| Role | Test Email | Default Dev Password | Primary Responsibilities |
|---|---|---|---|
| `PROCUREMENT_OFFICER` | `officer@normwise.local` | `NormWise2026!` | Enter requirements, upload specs, generate recommendations, self-approval blocked |
| `TECHNICAL_REVIEWER` | `reviewer@normwise.local` | `NormWise2026!` | Review queue, clause evidence inspection, compliance approvals, clarification requests |
| `AUDITOR` | `auditor@normwise.local` | `NormWise2026!` | Strictly read-only access to recommendations, evidence, evaluation runs, and audit logs |
| `ADMIN` | `admin@normwise.local` | `NormWise2026!` | Manage users and roles, dataset import pipelines, terminology, system security check |

> ⚠️ **IMPORTANT:** These credentials are for local development and testing only. Never deploy them in production.

---

## 🛠️ Quickstart & Deployment

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **PostgreSQL**: v14+ (or Docker)

### 2. Environment Configuration
Copy the environment template in `server/`:
```bash
cp server/.env.example server/.env
```
Ensure key environment variables are set:
```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/normwise?schema=public"

# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Authentication & Session Security (Phase 18)
AUTH_SECRET="normwise-secure-high-entropy-secret-minimum-32-chars"
AUTH_COOKIE_NAME="normwise_session"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE="lax"
SESSION_EXPIRY_DAYS=7

# Rate Limiting
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_API_MAX=120
RATE_LIMIT_WINDOW_MS=900000
```

### 3. Database Migration & Seed
```bash
# Generate Prisma Client
cd server
npx prisma generate

# Apply Database Schema Migration
npx prisma db push

# Seed Baseline Standards & Development Users
node prisma/seed.js
cd ..
```

### 4. Running Locally in Development
```bash
# Start frontend & backend concurrently
npm install
cd server && npm install && cd ..
npm run dev
```

### 5. Production Build & Start
```bash
# Build frontend bundle
npm run build

# Start production server
cd server
npm run start
```

---

## 🧪 Testing

NormWise has 163 automated test suites covering Phases 10 through 18:
```bash
cd server

# Run full test suite (163 tests)
npm test

# Run dedicated security & RBAC tests (25 tests)
npm run test:security
```

---

## 🧭 Application Routes

| Route | View | Access Role | Description |
|---|---|---|---|
| `/login` | **Authentication** | Public | Secure email/password login with dev role selectors |
| `/` | **Dashboard** | All Authenticated | Executive summary, requirement input, statistics |
| `/recommend` | **New Recommendation** | Officer, Reviewer, Admin | Multi-attribute procurement wizard and BIS matching |
| `/documents` | **Upload Specification** | Officer, Reviewer, Admin | PDF/DOCX tender extraction pipeline |
| `/analyze` | **Analysis Pipeline** | All Authenticated | Requirement parsing and Gazette verification engine |
| `/results` | **Results** | All Authenticated | Recommended standard, match rationale, evidence drawer |
| `/evidence` | **Evidence Matrix** | All Authenticated | Clause-by-clause traceability matrix |
| `/review` | **Human Review Queue** | Reviewer, Admin | Technical verification checklist and decision workflows |
| `/history` | **Audit History** | All Authenticated | Append-only procurement audit logs |
| `/admin/users` | **User Management** | Admin Only | User directory, role reassignments, and account activation |
| `/admin/security` | **Security Check** | Admin, Auditor | Automated defense-in-depth configuration report |
| `/admin/data` | **Dataset Admin** | Admin Only | Standards JSON/CSV/XLSX import pipeline |
| `/admin/terminology` | **Terminology Review** | Admin Only | Multilingual Indic technical term normalization |
| `/admin/evaluation` | **Evaluation Benchmark** | Admin, Auditor | Precision/Recall@K quality benchmarks |
| `/saved` | **Saved Library** | All Authenticated | Bookmarked standards and tender clauses |
| `/settings` | **Settings & Security** | All Authenticated | User profile, password change, session logout |
| `/help` | **Documentation & FAQ** | All Authenticated | Standards intelligence guide, BIS Act 2016, QCOs |

---

## 📚 Security & Authorization References
- Detailed Security Architecture: [`SECURITY.md`](SECURITY.md)
- Granular Permission Matrix & RBAC Policy: [`server/AUTHORIZATION.md`](server/AUTHORIZATION.md)
- REST API Reference: [`server/API.md`](server/API.md)
