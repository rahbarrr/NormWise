# NormWise Docker Architecture & Containerization Guide (Phase 19)

This document describes the container architecture, multi-stage builds, non-root security controls, volume strategies, and Docker Compose configurations for **NormWise**.

---

## 1. Container Topology

```text
┌────────────────────────────────────────────────────────┐
│                   Docker Compose Network                │
│                                                        │
│  ┌─────────────────────────┐                           │
│  │   normwise_frontend     │ Port 80 (Host: 80/3000)   │
│  │   Image: Nginx Alpine   │ Proxies /api -> backend   │
│  └────────────┬────────────┘                           │
│               │ http://backend:5001                    │
│               ▼                                        │
│  ┌─────────────────────────┐                           │
│  │   normwise_backend      │ Port 5001 (Internal)      │
│  │   Image: Node 20 Alpine │ Non-root user: node       │
│  │   Volumes:              │                           │
│  │     normwise_storage    │                           │
│  │     normwise_backups    │                           │
│  └────────────┬────────────┘                           │
│               │ postgresql://normwise:5432             │
│               ▼                                        │
│  ┌─────────────────────────┐                           │
│  │   normwise_db           │ Port 5432 (Internal)      │
│  │   Image: pgvector       │ Volume: normwise_pgdata   │
│  └─────────────────────────┘                           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Dockerfile Design Principles

### Backend (`Dockerfile.backend` / `server/Dockerfile`)

1. **Multi-Stage Build**:
   - `build` stage: Installs dependencies and runs `prisma generate` to produce compiled client bindings.
   - `production` stage: Copies only production dependencies, generated Prisma client, and server source code.
2. **Process Management**:
   - Uses `dumb-init` as PID 1 to properly handle UNIX signals (`SIGTERM`, `SIGINT`) and forward them to Node.js, ensuring clean graceful shutdowns.
3. **Least Privilege Non-Root Security**:
   - Drops privileges to user `node` (UID 1000). The process never runs as root.
   - Creates and sets ownership on `/app/uploads` and `/app/backups` before dropping privileges.
4. **Health Checking**:
   - Built-in Docker `HEALTHCHECK` probing `GET http://localhost:5001/api/health` every 30s.

### Frontend (`Dockerfile.frontend`)

1. **Multi-Stage Build**:
   - `builder` stage: Node 20 Alpine compiles React/Vite source code into `/app/dist`.
   - `runner` stage: Lightweight `nginx:alpine` image.
2. **Nginx Reverse Proxy & Static Hosting**:
   - Configured in `docker/nginx/frontend.conf`.
   - Reverse proxies `/api/*` to `http://backend:5001/api/*`.
   - Uses `try_files $uri $uri/ /index.html;` for seamless Single Page Application client-side routing.
   - Exposes `/health` returning HTTP 200 for load balancer checks.

---

## 3. Persistent Volumes

| Volume Name | Target Mount Point | Content Description | Backup Required |
|---|---|---|---|
| `normwise_pgdata` | `/var/lib/postgresql/data` | PostgreSQL database cluster files and indexes | **CRITICAL** |
| `normwise_storage` | `/app/uploads` | Uploaded procurement tenders, specs, and attachments | **CRITICAL** |
| `normwise_backups` | `/app/backups` | Database dump archives produced by backup scripts | Recommended |

---

## 4. Common Docker Commands

### Starting the Application
```bash
# Start all services in the background
docker compose up -d

# Start with live log streaming
docker compose up

# Rebuild images after code updates
docker compose up -d --build
```

### Checking Status and Logs
```bash
# View running container status and health
docker compose ps

# View backend logs
docker compose logs -f backend

# View frontend / reverse proxy logs
docker compose logs -f frontend

# View database logs
docker compose logs -f postgres
```

### Database Operations in Containers
```bash
# Apply pending Prisma migrations
docker compose exec backend npx prisma migrate deploy

# Seed demonstration standards catalog
docker compose exec backend npm run db:seed

# Bootstrap production admin
docker compose exec backend npm run db:bootstrap:admin

# Run automated smoke test
docker compose exec backend npm run smoke:test

# Perform PostgreSQL backup
docker compose exec backend npm run db:backup
```

### Stopping and Cleaning Up
```bash
# Stop containers without losing data
docker compose stop

# Stop and remove containers and network (preserves volumes)
docker compose down

# DANGER: Stop and remove containers AND delete all persistent volumes
docker compose down -v
```

---

## 5. Troubleshooting Docker Deployments

### Issue: Backend health check failing (`unhealthy`)
1. Inspect container logs:
   ```bash
   docker compose logs backend
   ```
2. Verify PostgreSQL is healthy:
   ```bash
   docker compose exec postgres pg_isready -U normwise -d normwise
   ```
3. Test health check manually from inside backend container:
   ```bash
   docker compose exec backend wget -qO- http://localhost:5001/api/health
   ```

### Issue: Permission denied in `/app/uploads`
If uploaded files cannot be written, verify the volume ownership matches UID 1000:
```bash
docker compose exec -u 0 backend chown -R node:node /app/uploads
```

### Issue: Database migration fails on container start
Ensure PostgreSQL has initialized and pgvector is enabled before running migrations:
```bash
docker compose exec postgres psql -U normwise -d normwise -c "CREATE EXTENSION IF NOT EXISTS vector;"
docker compose exec backend npx prisma migrate deploy
```
