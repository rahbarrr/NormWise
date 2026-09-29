# NormWise API Regression Report (Phase 30)

**Document:** API Regression Verification Matrix  
**Phase:** 30 — Complete Regression & Release Candidate Verification  
**Target Release:** `v1.0.0-sih2024`  
**Test Date:** September 26, 2026  
**Environment:** Clean Local Verification (Port 5001 Express API + PostgreSQL 16 + pgvector)

---

## API Regression Verification Matrix

| Endpoint | Method | Tested | Expected | Actual | Status |
| :--- | :---: | :---: | :--- | :--- | :---: |
| `/api/health` | GET | Yes | HTTP 200 `{"status":"ok"}` | HTTP 200 `{"status":"ok","service":"normwise-api"}` | **PASS** |
| `/api/health/ready` | GET | Yes | HTTP 200 DB, pgvector, storage OK | HTTP 200 `{"status":"ready","database":"ok","vectorStore":"ok","storage":"ok"}` | **PASS** |
| `/api/health/demo` | GET | Yes | HTTP 200 system demo readiness | HTTP 200 `{"status":"READY","database":"READY","pgvector":"READY",...}` | **PASS** |
| `/api/version` | GET | Yes | HTTP 200 app version metadata | HTTP 200 `{"name":"NormWise","version":"1.0.0-mvp",...}` | **PASS** |
| `/api/auth/login` | POST | Yes | HTTP 200 + Session Cookie + CSRF | HTTP 200 + `normwise_session` + permissions array | **PASS** |
| `/api/auth/me` | GET | Yes | HTTP 200 with authenticated session | HTTP 200 + User Profile (`PROCUREMENT_OFFICER`) | **PASS** |
| `/api/auth/logout` | POST | Yes | HTTP 200 + Session invalidated | HTTP 200 + Cleared session cookie | **PASS** |
| `/api/auth/csrf` | GET | Yes | HTTP 200 with CSRF token | HTTP 200 `{"csrfToken":"..."}` | **PASS** |
| `/api/recommend` | POST | Yes | HTTP 200 + Top candidate + score + evidence | HTTP 200 + `IS 2347:2023` (Score: 0.92, QCO Mandated) | **PASS** |
| `/api/recommend` (Length >10k) | POST | Yes | HTTP 400 Payload too large error | HTTP 400 `{"error":"Requirement text exceeds maximum allowed length..."}` | **PASS** |
| `/api/recommendations` | GET | Yes | HTTP 200 Paginated recommendations | HTTP 200 `items: [...]`, pagination & statistics | **PASS** |
| `/api/recommendations/:id` | GET | Yes | HTTP 200 Nested relations (standards, evidence) | HTTP 200 Full graph with `recommendationStandards`, `evidence` | **PASS** |
| `/api/recommendations/:id/save`| PATCH | Yes | HTTP 200 Toggled bookmark status | HTTP 200 `{"id":"...","saved":true}` | **PASS** |
| `/api/recommendations/:id/review`| POST | Yes | HTTP 200 Review state transition | HTTP 200 `status: "ACCEPTED"`, audit logged | **PASS** |
| `/api/recommendations/:id/review` (Self-Approve) | POST | Yes | HTTP 403 Forbidden self-approval | HTTP 403 `SELF_APPROVAL_FORBIDDEN` | **PASS** |
| `/api/recommendations/:id/compliance` | GET | Yes | HTTP 200 Deterministic QCO evaluation | HTTP 200 `outcome: "POTENTIALLY_APPLICABLE"`, rule conditions | **PASS** |
| `/api/recommendations/:id/audit`| GET | Yes | HTTP 200 Immutable audit trail | HTTP 200 Chronological events (`RECOMMENDATION_CREATED`, etc.) | **PASS** |
| `/api/standards` | GET | Yes | HTTP 200 Filtered standards catalog | HTTP 200 List of 19 BIS standards with amendments | **PASS** |
| `/api/standards/:id` | GET | Yes | HTTP 200 Standard detail with clauses | HTTP 200 Full standard metadata, edition, status | **PASS** |
| `/api/standards/:id/related` | GET | Yes | HTTP 200 Graph relations via recursive CTE | HTTP 200 7 allied standards with relationship types | **PASS** |
| `/api/documents/upload` | POST | Yes | HTTP 201 File stored, metadata created | HTTP 201 `{"documentId":"...","status":"UPLOADED"}` | **PASS** |
| `/api/documents/:id/process` | POST | Yes | HTTP 200 Extracted text & attributes | HTTP 200 `{"status":"COMPLETED","extractedRequirements":{...}}` | **PASS** |
| `/api/admin/users` (Officer role)| GET | Yes | HTTP 403 Forbidden for non-admin | HTTP 403 `FORBIDDEN` error | **PASS** |
| `/api/admin/users` (Admin role) | GET | Yes | HTTP 200 User list with roles | HTTP 200 Array of users without password hashes | **PASS** |
| `/api/evaluation/runs` | GET | Yes | HTTP 200 Benchmark run history | HTTP 200 Historical runs with Recall@K and MRR | **PASS** |
| `/api/evaluation/run` | POST | Yes | HTTP 200 Trigger new benchmark run | HTTP 200 Run executed, archived to DB (20 cases in ~600ms) | **PASS** |

---

## API Summary Statistics
- **Total Endpoints Tested:** 26
- **Passed:** **26 / 26 (100%)**
- **Failed:** **0**
- **Regression Bugs Discovered:** **0**
