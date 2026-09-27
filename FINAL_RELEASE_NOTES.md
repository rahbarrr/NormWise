# NormWise — Final Release Notes

**Version:** `v1.0.0-sih2024-final`  
**Release Date:** 27 September 2026  
**Phase:** 32 — SIH Demo, Validation & Submission Freeze  
**Repository:** `main` branch — commit `339da56`+  
**Build:** Vite 8.3.1 | Node.js 20 LTS | PostgreSQL 16 + pgvector 0.8.6  

---

## ✅ Implemented & Verified Functionality

### Core Recommendation Engine
- **Tri-engine hybrid retrieval:** Structured code matching + BM25 full-text search + pgvector HNSW dense vector similarity
- **Reciprocal Rank Fusion (RRF):** Merges ranked results from all three engines with configurable weights
- **Multi-factor scoring:** Product (30%), Application (25%), Material (15%), Technical Characteristics (10%), Semantic (20%)
- **Safety states:** `RECOMMENDED`, `CLARIFICATION_REQUIRED`, `NO_MATCH` — no false-positive inventions
- **Currentness invariant:** Withdrawn/superseded standards flagged; active edition promoted automatically
- **Performance:** Recommendation pipeline completes in < 200ms end-to-end

### Evidence System
- 10 evidence records per recommendation, each linked to PostgreSQL `Evidence` table
- Evidence types: `SCOPE`, `CURRENTNESS`, `CERTIFICATION`, `QCO`, `TECHNICAL`
- Zero fabricated clauses — all content from seeded BIS demonstration catalog
- Evidence displayed on Results, RecordDetail, and dedicated Evidence page

### Compliance Engine
- Deterministic QCO rule evaluation (no LLM guesswork)
- Outcomes: `POTENTIALLY_APPLICABLE`, `NOT_IDENTIFIED`, `REQUIRES_REVIEW`, `INSUFFICIENT_EVIDENCE`
- Gazette citations and effective dates evaluated from PostgreSQL

### Human Review Workflow
- Four-role RBAC: `ADMIN`, `TECHNICAL_REVIEWER`, `PROCUREMENT_OFFICER`, `VIEWER`
- Self-approval prevention enforced at server side (HTTP 403 `SELF_APPROVAL_FORBIDDEN`)
- Review checklist, notes, and status transitions persisted to PostgreSQL
- Immutable audit trail on every state change

### Authentication & Security
- Argon2id password hashing
- Iron Session HTTP-only cookies (15-minute expiry)
- CSRF double-submit token enforcement (X-CSRF-Token header)
- File upload sanitization (MIME, extension, 10MB max)
- No secrets committed to repository

### Document Processing
- PDF.js text extraction for procurement tender PDFs
- Mammoth DOCX parser for Word documents
- Tesseract.js OCR fallback for scanned images
- Attribute extraction from uploaded documents

### Dashboard (Live Data)
- `StatsCards`: Live recommendation count, standards count, accepted/under-review stats
- `RecentRecommendations`: Live 6-item table from PostgreSQL with real standard numbers
- Both fall back gracefully to mock data if API unavailable

### History & Audit
- Paginated, searchable, filterable history of all recommendations
- Per-record detail page with Overview, Evidence, Review, and Audit tabs
- Audit trail shows timestamped, actor-attributed events from PostgreSQL

### Standards Catalog
- 23 standards in database (21 CURRENT, 2 others)
- Covers: Kitchenware, Lighting, Piping, Electrical, Transformers, Cement, Safety sectors
- Structured relationships: supersedes, superseded-by, referenced-by, material-for

---

## 🗄️ Database State (Production Seed)

| Entity | Count |
|--------|-------|
| Standards | 23 |
| Standard Relationships | 11 |
| QCO Rules | 3 |
| Evidence Records | ~2,660+ (10 per recommendation) |
| Recommendations | 266+ (grows with demos) |
| Users | 9 (including demo accounts) |

---

## ⚠️ Known Limitations (Non-Blocking)

1. **Demo Catalog Scope:** 23 standards cover 6 procurement sectors. Out-of-scope queries safely yield `NO_MATCH`. Full coverage (~20,000 standards) requires BIS API data agreement.

2. **Multilingual Depth:** English and Hindi (Devanagari) fully supported. Regional languages (Tamil, Telugu, Bengali) have keyword indexing only.

3. **OCR Accuracy:** Degraded/handwritten scans may produce incomplete extraction. Users can manually correct attributes in the Attribute Review step.

4. **Bundle Size:** Production JS bundle is ~922KB (gzipped: ~223KB). Code-splitting is a future optimization.

5. **Mobile Layout:** Audit tables require horizontal scrolling on screens < 768px. Desktop-first design optimized for SIH panel presentation.

6. **Analysis Progress Indicator:** 5-stage Analyze.jsx animation simulates pipeline stages visually. Real-time WebSocket streaming is planned for future enterprise release.

---

## 🔧 Environment Requirements

```
Node.js    >= 20.0.0 LTS
npm        >= 10.0.0
PostgreSQL >= 15 with pgvector extension
```

### Environment Variables (see server/.env.example)
```
DATABASE_URL=postgresql://...
IRON_SESSION_SECRET=<min 32 char secret>
CSRF_SECRET=<32 char secret>
PORT=5001
NODE_ENV=production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

---

## 🚀 Setup Commands (Fresh Environment)

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and secrets

# 3. Database setup
cd server
npx prisma migrate deploy
npx prisma db seed

# 4. Development
npm run dev          # Frontend (port 5173)
cd server && npm start  # Backend (port 5001)

# 5. Production build
npm run build
```

---

## 🧪 Test Results (Final)

| Suite | Tests | Pass | Fail |
|-------|-------|------|------|
| Authentication | 28 | 28 | 0 |
| Recommendation Engine | 41 | 41 | 0 |
| Evidence System | 22 | 22 | 0 |
| Compliance Rules | 18 | 18 | 0 |
| Standards API | 19 | 19 | 0 |
| Review Workflow | 24 | 24 | 0 |
| Security (Red Team) | 17 | 17 | 0 |
| Document Processing | 14 | 14 | 0 |
| Health/System | 20 | 20 | 0 |
| **TOTAL** | **203** | **203** | **0** |

---

## 📌 Release Freeze Notice

After this release:
- **NO new features** will be added
- Only **P0/P1 bug fixes** and **demo-blocking issues** are permitted
- See `RELEASE_FREEZE.md` for the formal freeze declaration
