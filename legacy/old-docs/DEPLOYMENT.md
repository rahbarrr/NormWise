# NormWise Production Deployment Guide (Phase 19 & 20)

This guide documents the procedures for deploying **NormWise** across local development, multi-container Docker Compose environments, and production platforms with managed PostgreSQL and pgvector.

---

## 1. Architecture Overview

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
 │ PostgreSQL + pgvector│ │ Local Volume │
 │ (Prisma ORM)      │ │ /app/uploads │
 └───────────────────┘ └──────────────┘
```

---

## 2. Environment Configuration

Copy the example environment configuration into both root and server directories:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

### Key Environment Variables

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Enables production optimizations and security headers |
| `PORT` | No | `5001` | Backend HTTP listening port |
| `DATABASE_URL` | Yes | `postgresql://normwise:secret@postgres:5432/normwise?schema=public` | PostgreSQL connection string with pgvector |
| `DIRECT_URL` | No | `postgresql://...` | Direct connection string for Prisma migrations (if pooling) |
| `SESSION_SECRET` | Yes | 64+ char random string | Cryptographic key for session signing and hashing |
| `JWT_SECRET` | Yes | 64+ char random string | Fallback JWT secret |
| `CORS_ORIGIN` | Yes | `https://normwise.gov.in` | Whitelist allowed web origins (comma-separated) |
| `COOKIE_SECURE` | Yes | `true` (in prod) | Requires HTTPS for session cookies |
| `COOKIE_SAME_SITE` | Yes | `lax` | Cookie CSRF protection attribute |
| `UPLOAD_DIR` | Yes | `/app/uploads` | Path for document storage |
| `MAX_UPLOAD_SIZE_MB` | No | `15` | Document upload ceiling |
| `RATE_LIMIT_MAX` | No | `100` | Global requests per window per IP |

---

## 3. Deployment Method A: Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ with `pgvector` extension installed
- Git

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rahbarrr/NormWise.git
   cd NormWise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure Environment:**
   Create `.env` in `server/` pointing to your local database:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/normwise?schema=public"
   SESSION_SECRET="dev-insecure-secret-key-replace-in-production-12345"
   NODE_ENV="development"
   PORT=5001
   CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
   ```

4. **Run Migrations & Seed Catalog:**
   ```bash
   cd server
   npx prisma migrate deploy
   npm run db:seed
   cd ..
   ```

5. **Start Development Servers:**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   npm run dev
   ```

Access the frontend at `http://localhost:5173` and API at `http://localhost:5001/api`.

---

## 4. Deployment Method B: Docker Compose (Single Host / Self-Hosted)

NormWise includes production-ready Docker Compose configurations.

### 1. Build and Run Containers

```bash
docker compose up -d --build
```

This starts:
- `normwise_db`: PostgreSQL 16 with `pgvector` (`pgvector/pgvector:pg16`)
- `normwise_backend`: Node 20 Alpine running backend API
- `normwise_frontend`: Nginx serving static Vite bundle and reverse proxying `/api`

### 2. Run Database Migrations in Container

```bash
docker compose exec backend npx prisma migrate deploy
```

### 3. Bootstrap Administrator Account

```bash
docker compose exec -e ADMIN_EMAIL="admin@agency.gov.in" -e ADMIN_PASSWORD="SecurePass2026!" backend npm run db:bootstrap:admin
```

### 4. Seed Reference BIS Standards Catalog

```bash
docker compose exec backend npm run db:seed
```

### 5. Verify Installation

```bash
docker compose exec backend npm run smoke:test
```

---

## 5. Deployment Method C: Production on Cloud & Managed PostgreSQL

For enterprise cloud deployments (AWS ECS/EKS, Azure Container Apps, Google Cloud Run):

### Database Provisioning
1. Provision a PostgreSQL 15 or 16 managed database (e.g., AWS RDS, Supabase, Neon).
2. Enable the `pgvector` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Set connection pooling parameters (ensure max connections accommodates concurrent officers).

### Running Production Migrations
Always run Prisma migrations in a deployment pipeline or pre-start hook:
```bash
npx prisma migrate deploy
```

### Storage Configuration
In containerized environments with multiple replicas, mount an Amazon S3 / Azure Blob volume or configure `UPLOAD_DIR` to a shared Persistent Volume Claim (PVC) / NFS mount.

### SSL Termination & Reverse Proxy
Deploy an Application Load Balancer or Ingress Controller:
- Terminate SSL with valid CA certificates.
- Set `X-Forwarded-Proto: https` and `X-Forwarded-For`.
- Enable HTTP/2 and gzip/brotli compression.

---

## 6. Pre-Flight Smoke Test Verification

Execute the non-destructive smoke test suite after deployment:

```bash
API_URL="https://normwise.gov.in/api" \
SMOKE_EMAIL="officer@normwise.local" \
SMOKE_PASSWORD="NormWise2026!" \
ADMIN_EMAIL="admin@normwise.local" \
ADMIN_PASSWORD="NormWise2026!" \
npm run smoke:test
```

Checks verified:
1. `GET /api/health` — API server liveness
2. `GET /api/health/ready` — PostgreSQL connectivity, pgvector extension, storage directory read/write
3. `GET /api/version` — Deployed version and environment
4. `GET /api/standards` — Standards catalog read performance
5. `POST /api/recommend` — End-to-end recommendation engine retrieval and scoring
6. `POST /api/auth/login` — Authentication and secure session issuance
7. `GET /api/auth/me` — Authenticated identity resolution
8. `GET /api/admin/system/health` — RBAC enforcement and system telemetry

---

## 7. Troubleshooting Common Deployment Issues

### Database Connection Refused
- Verify `DATABASE_URL` hostname matches Docker service name (`postgres`) or external DB endpoint.
- Verify security group / firewall allows port 5432 ingress from the backend host.

### pgvector Extension Missing
- Execute in PostgreSQL database:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  SELECT * FROM pg_extension WHERE extname = 'vector';
  ```

### File Upload Permissions (EACCES)
- The backend runs as non-root user `node` (UID 1000). Ensure the mounted storage directory has ownership `node:node`:
  ```bash
  chown -R 1000:1000 /path/to/uploads
  ```

### CORS Failures
- Verify `CORS_ORIGIN` matches the exact frontend domain, including protocol and port (no trailing slashes):
  ```env
  CORS_ORIGIN="https://normwise.gov.in"
  ```
