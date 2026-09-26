# NormWise: Comprehensive Technical Inventory

**Document Version:** 1.0.0 (SIH 2024 Final Submission)  
**Standard of Inventory:** Factual status tracking across all subsystems (`IMPLEMENTED`, `PARTIAL`, `PLANNED`).

---

## Technical Inventory by Subsystem

| Subsystem | Implemented Technology / Stack | Status | Verification & Test Evidence |
|---|---|---|---|
| **Frontend Application** | React 19, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7 | **IMPLEMENTED** | Production build compiles in 372ms (`npm run build`); 0 linter errors. |
| **Backend REST API** | Node.js 20 LTS, Express.js 4.21, ES Modules | **IMPLEMENTED** | Express API server; 188 automated unit/integration tests passing. |
| **Relational Database** | PostgreSQL 16 | **IMPLEMENTED** | Relational schemas for Standards, Amendments, Users, Sessions, AuditEvents. |
| **ORM & Data Modeling** | Prisma ORM 5.20+ | **IMPLEMENTED** | Validated `schema.prisma`; type-safe client generation; automated migrations. |
| **Dense Vector Layer** | PostgreSQL `pgvector` Extension | **IMPLEMENTED** | 1536-dimensional embeddings; cosine similarity search (`<=>`). |
| **Document Processing** | `pdf-parse`, `mammoth` (DOCX), `multer` | **IMPLEMENTED** | Uploads up to 25MB; parses schedules; extracts text sections. |
| **OCR Fallback** | `tesseract.js` | **IMPLEMENTED** | Optical character recognition on scanned PDFs/images; local processing. |
| **Recommendation Engine** | 3-way retrieval + Reciprocal Rank Fusion + Multi-factor scoring | **IMPLEMENTED** | Implemented in `recommendationService.js`; Recall@1: 88.9%, Recall@5: 94.4%. |
| **Currentness Checking** | Relational status filtering & active replacement promoter | **IMPLEMENTED** | 0 currentness violations; automatic supersede advisory injection. |
| **Knowledge Graph** | Relational `RelatedStandard` table with recursive CTEs (depth $\le 3$) | **IMPLEMENTED** | Surfaces allied raw materials, components, and safety standards in <15ms. |
| **Compliance Rule Engine** | Deterministic Quality Control Order (QCO) rule evaluator | **IMPLEMENTED** | Independent execution in `complianceRuleService.js`; isolated from LLM. |
| **Evidence Traceability** | Normative clause binding with verbatim gazette text extracts | **IMPLEMENTED** | Slide-out Evidence Drawer viewable in `/results/:id`. |
| **Multilingual Engine** | Indic tokenization & transliteration dictionaries (HI, MR, BN) | **IMPLEMENTED** | 100% Top-1 candidate retrieval across Indic test cases. |
| **Authentication & RBAC** | Bcryptjs, HTTP-only secure cookies (`SameSite=Strict`), CSRF protection | **IMPLEMENTED** | 4 roles (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `ADMIN`, `AUDITOR`). |
| **Human Review Workflow** | Interactive checklist inspection, reviewer notes, formal sign-offs | **IMPLEMENTED** | Fully operational at `/review` with database persistence. |
| **Statutory Audit Trail** | Append-only PostgreSQL `AuditEvent` logging with timestamps | **IMPLEMENTED** | Viewable at `/admin/audit`; logs recommendation, review, and admin actions. |
| **Evaluation Framework** | 20 real cases, 13-category error taxonomy, live strategy comparison | **IMPLEMENTED** | Accessible via CLI (`npm run evaluate:all`) and Admin UI (`/admin/evaluation`). |
| **Automated Testing** | Node.js native test runner (`node --test`) | **IMPLEMENTED** | 188 tests passing across 11 test suites. |
| **Deployment Engine** | Multi-stage `Dockerfile`, `docker-compose.yml`, Nginx reverse proxy | **IMPLEMENTED** | Verified containerized deployment configuration. |
| **System Health Probes** | `GET /api/health`, `/health/ready`, `/health/demo` | **IMPLEMENTED** | Probes Database, pgvector, Demo Dataset, Recommendation, and Compliance. |
| **Live BIS Portal Sync** | Direct real-time bidirectional API sync with BIS Manakonline | **PLANNED** | Requires official government data-sharing MoU/API agreement. |
| **GeM Buyer Portal Extension**| Chrome/Edge browser extension for 1-click tender drafting on GeM | **PLANNED** | Scheduled for post-hackathon Phase II rollout. |
