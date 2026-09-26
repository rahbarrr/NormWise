# NormWise Authorization Matrix & RBAC Policy (Phase 18)

This document formalizes the backend permission model, role assignments, and authorization boundaries enforced across the NormWise Indian Standards Intelligence API.

---

## 1. Controlled User Roles

| Role Identifier | Title | Primary Responsibility |
|---|---|---|
| `PROCUREMENT_OFFICER` | Procurement Officer | Enters requirements, uploads tender documents, generates recommendations, tracks own history. |
| `TECHNICAL_REVIEWER` | Technical Standards Reviewer | Inspects clause evidence, validates compliance rules, accepts/rejects recommendations. |
| `AUDITOR` | Compliance & Process Auditor | Read-only inspection across recommendations, evidence trails, checklists, and audit events. |
| `ADMIN` | System Administrator | User account lifecycle, dataset imports, terminology management, and evaluation benchmarks. |

---

## 2. Granular Permissions Definition

| Permission Key | Description |
|---|---|
| `RECOMMENDATION_CREATE` | Generate initial Indian Standard recommendations from requirements |
| `RECOMMENDATION_READ` | Retrieve and view recommendation details |
| `RECOMMENDATION_REVIEW` | Submit recommendations for review or request technical clarification |
| `RECOMMENDATION_DECIDE` | Formally accept, reject, or mark a recommendation NOT_APPLICABLE |
| `DOCUMENT_UPLOAD` | Upload RFP / technical specification documents (PDF / DOCX) |
| `DOCUMENT_READ` | View uploaded documents and their extracted procurement clauses |
| `DOCUMENT_DELETE` | Delete or archive uploaded procurement specifications |
| `EVIDENCE_READ` | Inspect verified standard clauses, gazette notifications, and evidence matrices |
| `STANDARD_READ` | Query BIS standards catalog, amendments, and currentness metadata |
| `STANDARD_MANAGE` | Edit, update, or supersede standards metadata records |
| `RELATIONSHIP_READ` | Traverse standards knowledge graphs and allied relations |
| `RELATIONSHIP_MANAGE` | Create or update directed relationships between standards |
| `COMPLIANCE_READ` | Inspect QCO mandatory enforcement dates and regulatory conditions |
| `COMPLIANCE_MANAGE` | Author or update deterministic compliance rules and applicability criteria |
| `REVIEW_READ` | View human review checklists and workflow status |
| `REVIEW_MANAGE` | Update review checklists, verification steps, and reviewer notes |
| `AUDIT_READ` | Inspect append-only audit trail logs and action provenance |
| `DATASET_IMPORT` | Ingest standards datasets from JSON, CSV, or XLSX spreadsheets |
| `DATASET_MANAGE` | Manage dataset versions, track import jobs, and view error reports |
| `EVALUATION_RUN` | Trigger offline recommendation quality and multilingual benchmark evaluations |
| `EVALUATION_READ` | Inspect benchmark accuracy scores (Recall@K, MRR, Precision) and reports |
| `USER_MANAGE` | Administer users, assign roles, and activate/deactivate accounts |

---

## 3. Role-to-Permission Matrix

| Permission | Procurement Officer | Technical Reviewer | Auditor | Admin |
|:---|:---:|:---:|:---:|:---:|
| `RECOMMENDATION_CREATE` | **✓** | **✓** | — | **✓** |
| `RECOMMENDATION_READ` | **✓** *(Own)* | **✓** *(All)* | **✓** *(All)* | **✓** |
| `RECOMMENDATION_REVIEW` | **✓** | **✓** | — | **✓** |
| `RECOMMENDATION_DECIDE` | — *(Self-Approval Blocked)* | **✓** | — | **✓** |
| `DOCUMENT_UPLOAD` | **✓** | **✓** | — | **✓** |
| `DOCUMENT_READ` | **✓** *(Own)* | **✓** *(All)* | **✓** *(All)* | **✓** |
| `DOCUMENT_DELETE` | **✓** *(Own)* | — | — | **✓** |
| `EVIDENCE_READ` | **✓** | **✓** | **✓** | **✓** |
| `STANDARD_READ` | **✓** | **✓** | **✓** | **✓** |
| `STANDARD_MANAGE` | — | — | — | **✓** |
| `RELATIONSHIP_READ` | **✓** | **✓** | **✓** | **✓** |
| `RELATIONSHIP_MANAGE` | — | — | — | **✓** |
| `COMPLIANCE_READ` | **✓** | **✓** | **✓** | **✓** |
| `COMPLIANCE_MANAGE` | — | — | — | **✓** |
| `REVIEW_READ` | **✓** | **✓** | **✓** | **✓** |
| `REVIEW_MANAGE` | — | **✓** | — | **✓** |
| `AUDIT_READ` | **✓** *(Own)* | **✓** *(Relevant)* | **✓** *(All)* | **✓** |
| `DATASET_IMPORT` | — | — | — | **✓** |
| `DATASET_MANAGE` | — | — | — | **✓** |
| `EVALUATION_RUN` | — | — | — | **✓** |
| `EVALUATION_READ` | — | — | **✓** | **✓** |
| `USER_MANAGE` | — | — | — | **✓** |

---

## 4. Key Authorization Invariants

1. **Backend Exclusivity:** All permissions are validated inside Express controllers and route middleware (`requirePermission`, `requireRole`). Frontend route guards (`ProtectedRoute`) are provided solely for user interface routing.
2. **Self-Approval Prohibition:** A procurement officer who authored a recommendation cannot approve or accept it (`forbidSelfApproval` middleware returns HTTP 403 `SELF_APPROVAL_FORBIDDEN`). Independent review by a `TECHNICAL_REVIEWER` or `ADMIN` is mandatory.
3. **Auditor Immutability:** Users holding the `AUDITOR` role have no state-changing permissions. Any attempt to invoke decision, upload, or modification endpoints fails with HTTP 403 `FORBIDDEN`.
4. **Append-Only Auditing:** No role, including `ADMIN`, can edit or delete historical records in the `AuditEvent` database table.
