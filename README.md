# NormWise

> **AI-Powered Indian Standards Intelligence for Procurement**  
> Identify applicable Indian Standards (IS), verify their current status, and understand why they apply.

---

## 📌 Overview
**NormWise** is an enterprise standards intelligence platform built for public sector undertakings (PSUs), government procurement officers, technical evaluation teams, and vendors. It bridges natural language procurement requirements with statutory Bureau of Indian Standards (BIS) specifications, mandatory Quality Control Orders (QCOs), and ready-to-use GeM (Government e-Marketplace) tender clauses.

---

## 🏛️ System Architecture

```text
NORMWISE
   │
   ▼
React + Vite (Frontend)
   │  REST API (/api)
   ▼
Node.js + Express (Backend)
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL Database
   │
   ├── Structured Standards & Amendments
   ├── Recommendations & Candidate Standards
   ├── Evidence Citations & Traceability
   ├── Human Reviews & Verification Checklists
   ├── Chronological Audit Trails
   └── Document Metadata & Processing State
   │
   ▼
[pgvector] (Prepared for Phase 10 Hybrid Retrieval & Semantic Search)
```

> **Note on pgvector:** Vector search extensions and hybrid embeddings retrieval are prepared in the database schema and architecture, and will be fully integrated in Phase 10 (Recommendation Engine).

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend:** Node.js, Express.js REST API
- **Database:** PostgreSQL 16
- **ORM:** Prisma ORM
- **Future Vector Retrieval:** pgvector
- **Security & Quality:** Helmet, CORS, Zod schema validation, centralized error handling

---

## 🛠️ Quickstart & Setup

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **PostgreSQL**: v14+ (or Docker)

### 1. Database Setup
Start a local PostgreSQL instance. If using Docker:
```bash
docker run -d --name normwise-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=normwise postgres:16-alpine
```

### 2. Environment Configuration
Copy the server environment template:
```bash
cp server/.env.example server/.env
```
Ensure your `DATABASE_URL` matches your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/normwise?schema=public"
PORT=5000
CLIENT_URL=http://localhost:5174
```

### 3. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 4. Database Migration & Demonstration Seed
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Start Development Server (Full Stack)
```bash
npm run dev
```
Starts both:
- **Vite Frontend Client**: `http://localhost:5174` (or `5173`)
- **Express Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🧭 Application Routes

| Route | View | Description |
|---|---|---|
| `/` | **Dashboard** | Executive summary, requirement input, quick chips, statistics, and recent evaluations |
| `/recommend` | **New Recommendation** | Procurement wizard with department classification and QCO options |
| `/analyze` | **Analysis Pipeline** | Step-by-step technical attribute parsing and Gazette verification engine |
| `/results` | **Recommendation Results** | Recommended standard, match rationale, amendments, evidence drawer, and GeM clause modal |
| `/evidence` | **Evidence Matrix** | Clause-by-clause traceability matrix and NABL proof parameters |
| `/review` | **Human Review Queue** | Reviewer verification checklist, technical notes, and decision workflows (Accept, Request Review, Clarification, Not Applicable) |
| `/history` | **Audit History** | Enterprise record table backed by PostgreSQL with status filtering and audit log viewer |
| `/saved` | **Saved Library** | Bookmarked standards and boilerplate tender clauses |
| `/settings` | **Settings** | Department profile and GeM integration configuration |
| `/help` | **Documentation & FAQ** | Standards intelligence guide, BIS Act 2016, and QCO legal overview |

---

## 📚 API Reference
Detailed REST API endpoint documentation is available at [`server/API.md`](server/API.md).

---

## 🏛️ Regulatory References
- **Bureau of Indian Standards (BIS) Act, 2016**
- **General Financial Rules (GFR), 2017 (Rule 144 & Rule 149)**
- **Government e-Marketplace (GeM) Procurement Guidelines**
- **DPIIT Quality Control Orders (QCOs)**
