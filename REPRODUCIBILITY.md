# NormWise: Complete Reproducibility & Deployment Guide

**Document Version:** 1.0.0 (SIH 2024 Final Submission)  
**Goal:** Step-by-step setup on a fresh machine to reproduce the exact demonstration and benchmark results.

---

## 1. System Prerequisites

Before starting, ensure the target host machine has:
- **Node.js:** Version 20.x LTS or higher (Node 22 / 24 also supported)
- **PostgreSQL:** Version 16.x
- **pgvector Extension:** Installed in PostgreSQL (`postgresql-16-pgvector`)
- **Package Manager:** `npm` (v10+)
- **Git:** Standard git client

---

## 2. Step-by-Step Clean Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/rahbarrr/NormWise.git
cd NormWise
```

### Step 2: Install Dependencies
```bash
# Install root (frontend) dependencies
npm install

# Install server (backend) dependencies
cd server && npm install && cd ..
```

### Step 3: Configure Environment
```bash
# Copy pre-configured demonstration environment template
cp server/.env.example server/.env

# Optional: configure root environment
cp .env.example .env
```

### Step 4: Verify PostgreSQL & Enable pgvector
Log into PostgreSQL via `psql` or database GUI and ensure the database and extension exist:
```sql
CREATE DATABASE normwise;
\c normwise
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 5: Execute One-Command Demo Setup
Run our automated setup runner:
```bash
npm run setup:demo
```
*What this automated script executes in under 10 seconds:*
1. Generates Prisma client
2. Synchronizes schema non-destructively (`prisma db push`)
3. Seeds users, demo standards, knowledge graph edges, and QCO rules (`prisma/seed.js`)
4. Verifies database connectivity and readiness probe

---

## 3. Running the Application

### Start Client & Server Concurrently
```bash
npm run dev
```

The system will start:
- **Frontend SPA:** `http://localhost:5173`
- **Backend API:** `http://localhost:5001/api`
- **Demo Readiness Probe:** `http://localhost:5001/api/health/demo`

---

## 4. Evaluator Login & Demo Workflow

1. Open your browser and navigate to `http://localhost:5173/login`.
2. Click the **"Procurement Officer"** 1-Click Login button (autofills `officer@normwise.gov.in` / `NormWise2026!`).
3. Click **Login** $\rightarrow$ Navigate to **New Recommendation** (`/new-recommendation`).
4. In the "Try an example" panel, click **Case 1: Clear Recommendation**.
5. Click **"Run Recommendation Engine"** $\rightarrow$ View recommendation results, "Why this standard?", evidence excerpts, allied standards, and compliance status.
6. Click **"Request Review"** in the bottom action bar.
7. Open the **Review Queue** (`/review`) $\rightarrow$ Check off verification items $\rightarrow$ Click **Accept**.
8. Navigate to **Audit Trail** (`/admin/audit`) to inspect the permanent PostgreSQL audit log.

---

## 5. Running Automated Tests & Benchmark Evaluation

### Execute the Automated Test Suite (188 Tests)
```bash
npm test
```
*Expected Result:* 188 passing tests across 11 test suites.

### Execute the Real-Case Benchmark Evaluation (Phase 21 Suite)
```bash
npm run evaluate:all
```
*Expected Result:*
- **Total Cases:** 20 (19 Verified, 1 Unverified)
- **Recall@1:** **88.9%**
- **Recall@5:** **94.4%**
- **MRR:** **0.903**
- **Currentness Safety Violations:** **0** (100% adherence)
- **Average Latency:** **30 ms/case**

---

## 6. Docker Containerized Alternative

If Docker and Docker Compose are preferred:
```bash
# Build and start all services (PostgreSQL + pgvector, Backend, Frontend Nginx)
docker compose up -d --build

# Run migrations and seed demo data inside container
docker compose exec api node scripts/setup-demo.js
```
The application will be accessible on `http://localhost`.
