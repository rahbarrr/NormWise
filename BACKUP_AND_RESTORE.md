# NormWise Backup, Recovery & Disaster Restoration Guide (Phase 19)

This operational manual documents automated scripts, manual procedures, retention policies, and recovery steps for the NormWise PostgreSQL database and document storage.

---

## 1. Backup Strategy Overview

NormWise stores state in two places:
1. **PostgreSQL 16 Database**: Contains user accounts, standards catalog, vectors, recommendations, reviews, compliance rules, evidence links, and audit events.
2. **File Storage Directory (`UPLOAD_DIR`)**: Contains original uploaded procurement documents (PDFs, DOCX, TXT).

A valid disaster recovery point requires synchronizing both database state and document storage.

---

## 2. Automated CLI Backup Script

NormWise includes a built-in automated backup utility (`server/bin/backup.js`).

### Execution

```bash
# From server directory
cd server && npm run db:backup

# Or inside Docker container
docker compose exec backend npm run db:backup
```

### What It Does
- Reads `DATABASE_URL` from the active environment.
- Formats filename with ISO timestamp: `normwise-backup-YYYY-MM-DDTHH-mm-ss.sql`.
- Executes `pg_dump` with structured flags:
  - Clean schema drop/recreation (`--clean --if-exists`)
  - Full schema and data preservation
- Verifies output archive is non-empty.
- Enforces retention policy by automatically pruning backup archives older than `BACKUP_RETENTION_DAYS` (default: 30 days).

---

## 3. Automated CLI Restore Script

NormWise provides a corresponding restore script (`server/bin/restore.js`).

### Execution

```bash
# Restore latest backup automatically
cd server && npm run db:restore

# Restore specific backup file
cd server && BACKUP_FILE="/app/backups/normwise-backup-2026-09-26T12-00-00.sql" npm run db:restore

# Or inside Docker container
docker compose exec -e BACKUP_FILE="normwise-backup-2026-09-26T12-00-00.sql" backend npm run db:restore
```

### Safety Guard
- Refuses to restore if `NODE_ENV === "production"` unless `CONFIRM_PRODUCTION_RESTORE=true` is explicitly provided.
- Emits prompt and requires confirmation before replacing database tables.

---

## 4. Manual Backup & Restore Procedures

### Manual Backup with `pg_dump`

```bash
# Standalone PostgreSQL
pg_dump "postgresql://normwise:secret@localhost:5432/normwise?schema=public" \
  --format=plain \
  --clean \
  --if-exists \
  --file="normwise_manual_$(date +%Y%m%d_%H%M%S).sql"

# Docker Compose PostgreSQL
docker compose exec postgres pg_dump -U normwise -d normwise \
  --clean --if-exists > "normwise_docker_$(date +%Y%m%d_%H%M%S).sql"
```

### Manual Restore with `psql`

```bash
# Standalone PostgreSQL
psql "postgresql://normwise:secret@localhost:5432/normwise" < backup_file.sql

# Docker Compose PostgreSQL
cat backup_file.sql | docker compose exec -T postgres psql -U normwise -d normwise
```

---

## 5. Uploaded Documents Backup & Restore

To back up uploaded tender files:

```bash
# Backup uploads directory
tar -czvf "normwise_uploads_$(date +%Y%m%d_%H%M%S).tar.gz" -C server/uploads .

# Restore uploads directory
tar -xzvf normwise_uploads_20260926.tar.gz -C server/uploads
```

---

## 6. Backup Retention & Archiving Policy

| Tier | Frequency | Retention Duration | Destination |
|---|---|---|---|
| Hourly Snapshots | Every 1 hour | 24 hours | Local high-speed NVMe / Container volume |
| Daily Backups | Once daily at 02:00 UTC | 30 days | Dedicated backup volume + Object Storage (S3 Glacier / Azure Archive) |
| Weekly Backups | Sundays at 03:00 UTC | 90 days | Encrypted Off-site Cloud Storage |
| Monthly Milestones | First day of month | 1 year | Immutable write-once-read-many (WORM) storage for compliance audit |

---

## 7. Disaster Recovery Runbook (Step-by-Step)

In case of catastrophic host failure or data corruption:

1. **Provision New Host & Install Dependencies:**
   - Launch Ubuntu 22.04 LTS or container runner with Docker & Docker Compose.
2. **Deploy Application Infrastructure:**
   ```bash
   git clone https://github.com/rahbarrr/NormWise.git
   cd NormWise
   cp .env.example .env
   # Populate secrets (SESSION_SECRET, DB password, etc.)
   docker compose up -d postgres
   ```
3. **Restore Database from Encrypted Snapshot:**
   ```bash
   cat latest_healthy_backup.sql | docker compose exec -T postgres psql -U normwise -d normwise
   ```
4. **Restore Document Attachments:**
   ```bash
   docker compose cp ./uploads_archive/. normwise_backend:/app/uploads
   ```
5. **Launch Backend and Frontend Services:**
   ```bash
   docker compose up -d backend frontend
   ```
6. **Verify System Integrity:**
   ```bash
   docker compose exec backend npm run smoke:test
   ```
   Check that all 8 smoke tests report `[PASS]` and system telemetry is green.
