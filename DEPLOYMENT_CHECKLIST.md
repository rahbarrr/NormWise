# NormWise Production Deployment Pre-Flight Checklist (Phase 19)

Ensure all 18 verification points are validated and signed off before opening the system to procurement officers and external users.

---

## 🔒 Security Hardening

- [ ] **1. Default Passwords Removed**: Default passwords for all accounts (`admin@normwise.gov.in`, `officer@normwise.gov.in`, etc.) changed to cryptographically secure strings (16+ chars).
- [ ] **2. Strong Cryptographic Secrets Configured**:
  - `SESSION_SECRET` is a 64+ character random string generated via `openssl rand -hex 32`.
  - `JWT_SECRET` is set to an independent 64+ character random key.
- [ ] **3. No Plaintext Credentials in VCS**: Verified that `.env` files, database passwords, and API keys are strictly excluded from Git history via `.gitignore`.
- [ ] **4. Production Cookie Flags Active**:
  - `COOKIE_SECURE=true` is enabled in production.
  - `COOKIE_SAME_SITE=lax` is configured.
  - HttpOnly flag verified on all session cookies.
- [ ] **5. CORS Restricted**: `CORS_ORIGIN` is configured to the exact production domain(s) with no wildcards (`*`).
- [ ] **6. Non-Root Container Execution**: Backend container verified running as user `node` (UID 1000) rather than `root`.

---

## 💾 Database & Vector Search

- [ ] **7. Migrations Applied**: All Prisma migrations deployed cleanly (`npx prisma migrate deploy`).
- [ ] **8. pgvector Extension Active**: Verified `CREATE EXTENSION IF NOT EXISTS vector;` in PostgreSQL database.
- [ ] **9. Standards Catalog Seeded**: BIS standards catalog populated with current reference standards, amendments, and cross-references (`npm run db:seed`).
- [ ] **10. Connection Pooling Configured**: PostgreSQL connection limit sized appropriately for maximum expected concurrent procurement officers.

---

## 📁 Storage & Persistence

- [ ] **11. Volume Mounts Verified**: Persistent volumes mounted for PostgreSQL data (`normwise_pgdata`) and document uploads (`normwise_storage`).
- [ ] **12. Upload Directory Permissions**: Directory ownership configured to `node:node` with read/write permissions for document attachments.
- [ ] **13. Automated Backups Scheduled**: Scheduled backup cron or script (`npm run db:backup`) operational with backup archive retention policy.

---

## 🚦 System Health & Observability

- [ ] **14. Liveness Probe (`GET /api/health`)**: Verified returning HTTP 200 `{ status: "ok" }`.
- [ ] **15. Readiness Probe (`GET /api/health/ready`)**: Verified returning HTTP 200 with database, pgvector, and storage checks passing.
- [ ] **16. Telemetry & Admin Dashboard**: Verified `/admin/monitoring` renders live system metrics and database connection status.
- [ ] **17. Structured Logging**: Verified JSON logs are emitted with correlation `requestId` for all incoming requests.
- [ ] **18. Smoke Test Executed**: Complete smoke test suite passes with 0 failures (`npm run smoke:test`).

---

**Sign-off:**
- Deployer / SRE: _______________________
- Date / Time: ___________________________
- Release Version: _______________________
