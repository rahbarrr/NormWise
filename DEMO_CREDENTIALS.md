# NormWise SIH Demo Accounts & Credentials

**Environment:** Development & Demonstration Only  
**System Notice:** Do NOT use these accounts or credentials in a production environment with sensitive procurement data.

---

## Authorized Demo Roles & User Personas

NormWise implements four Role-Based Access Control (RBAC) tiers. For live SIH evaluator walkthroughs, the following pre-configured personas are available:

| Persona / Role | Email Address | Password | Permissions & Intended Demo Walkthrough |
|---|---|---|---|
| **Procurement Officer** *(Primary Evaluator Persona)* | `officer@normwise.gov.in` | `NormWise2026!` | Submit procurement requirements, review AI-generated Indian Standards recommendations, check QCO compliance, request technical review. |
| **Technical Reviewer** | `reviewer@normwise.gov.in` | `NormWise2026!` | Access technical review queue, verify normative clauses, checklist inspection, submit formal human review decisions (`APPROVE`, `REJECT`, `NEEDS_REVISION`). |
| **System Administrator** | `admin@normwise.gov.in` | `NormWise2026!` | Evaluation dashboard (`/admin/evaluation`), candidate retrieval strategy benchmarks, system health probes, user management, standards catalog ingestion. |
| **Compliance Auditor** | `auditor@normwise.local` | `NormWise2026!` | Read-only inspection of immutable statutory audit trails (`/admin/audit`), recommendation history, and regulatory compliance logs. |

---

## Quick-Fill Buttons in Login UI

For convenience during rapid live demonstrations, the NormWise login screen at `/login` provides one-click role selector buttons to autofill these credentials without typing.

---

## Session Persistence & Security Controls

1. **Authentication Mechanism:** HTTP-only secure cookie session (`normwise_session`) with `SameSite=Strict` and anti-CSRF token verification.
2. **Access Control:** Attempting to access `/admin/*` without an `ADMIN` role returns HTTP 403 Forbidden.
3. **Session Invalidation:** Clicking **Logout** immediately destroys the active session on both the client and PostgreSQL session store.
