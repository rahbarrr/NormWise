# NormWise Security Architecture & Hardening Guide (Phase 18)

## 1. Executive Summary

NormWise enforces a zero-trust, defense-in-depth security model across its Indian Standards Intelligence platform for government and public procurement. Security controls are strictly enforced on the Express backend, backed by PostgreSQL and Prisma ORM, ensuring that frontend route hiding is merely a user-experience enhancement while authoritative access boundaries, role permissions, and resource ownership rules remain immutable.

---

## 2. Authentication Architecture

### 2.1 Credential Handling & Password Storage
- **Algorithm:** `bcryptjs` with adaptive salt rounds ($12$ rounds in production, $10$ rounds in development/test).
- **Entropy & Complexity:** Passwords must meet a minimum length of 8 characters (capped at 128 characters to protect against algorithmic resource exhaustion attacks).
- **Confidentiality:** Plaintext passwords are never logged, never cached in memory, and never transmitted in unencrypted form.
- **Sanitization:** The `passwordHash` column is strictly excluded from all API response payloads (`sanitizeUser` serializer).

### 2.2 Session Management & Token Design
- **Session Mechanism:** Server-backed session state persisted in PostgreSQL table `sessions`, paired with a high-entropy cryptographically random session token.
- **Token Hashing:** Stored tokens in PostgreSQL are hashed using SHA-256 (`tokenHash`) to mitigate token compromise in the event of an unauthorized database snapshot leak.
- **Cookie Security Flags:**
  - `HttpOnly`: Strictly prevents JavaScript client access, eliminating token leakage via XSS.
  - `Secure`: Enforced in production (`NODE_ENV=production`) ensuring cookies are transmitted solely over TLS/HTTPS.
  - `SameSite`: Configured to `Lax` (configurable via `AUTH_COOKIE_SAME_SITE`) to defend against ambient cross-site request forgery.
  - Storage: Authentication tokens are **never stored in `localStorage`**.
- **Session Revocation:**
  - Standard single-device logout invalidates the active session record in the database.
  - Password change and administrative user deactivation trigger instantaneous global revocation (`invalidateAllUserSessions`), terminating all concurrent active browser sessions across all devices.

---

## 3. Authorization & Role-Based Access Control (RBAC)

### 3.1 Controlled Institutional Roles
NormWise defines four controlled roles mapped to government procurement operations:

1. **`PROCUREMENT_OFFICER`**:
   - Creates and analyzes natural language procurement requirements.
   - Uploads technical specifications and RFP schedules (PDF / DOCX).
   - Generates recommendations and submits them for technical review.
   - Accesses own procurement history and bookmarks.
2. **`TECHNICAL_REVIEWER`**:
   - Inspects recommendation rationale, clause evidence, and allied standard graphs.
   - Reviews QCO compliance status and verifies applicability.
   - Requests clarification or accepts/rejects recommendations according to institutional workflows.
3. **`ADMIN`**:
   - Administers user accounts, assigns roles, and activates/deactivates accounts.
   - Manages national standards metadata, QCO Gazette feeds, and terminology registries.
   - Executes dataset import pipelines and recommendation evaluation benchmarks.
4. **`AUDITOR`**:
   - Strictly read-only observational access across recommendations, evidence trails, review checklists, and evaluation benchmark runs.
   - May inspect append-only audit event provenance.
   - Modification of any database record is strictly forbidden.

### 3.2 Granular Permissions Matrix
Refer to [`server/AUTHORIZATION.md`](file:///Users/rahbarraza/Downloads/NormWise/server/AUTHORIZATION.md) for the complete permission-to-role assignment matrix.

### 3.3 Resource Ownership & Self-Approval Prevention
- **Ownership Verification (Section 14):** Users accessing private recommendations or documents via `/api/recommendations/:id` or `/api/documents/:id` must either be the creator of the record or possess supervisory roles (`ADMIN`, `TECHNICAL_REVIEWER`, `AUDITOR`). URL ID enumeration is prevented.
- **Self-Approval Guardrail (Section 15):** A procurement officer cannot approve or accept their own recommendation (`SELF_APPROVAL_FORBIDDEN`). Independent review by an authorized `TECHNICAL_REVIEWER` is enforced at the backend middleware level.

---

## 4. API & Transport Security

### 4.1 Security Headers (Helmet & CSP)
The backend employs `helmet` to configure defensive HTTP headers:
- `Content-Security-Policy`: Restricts script and asset execution to `'self'`, safe fonts, and trusted API endpoints.
- `X-Content-Type-Options`: `nosniff` prevents MIME-sniffing exploits.
- `X-Frame-Options`: Denies embedding to eliminate clickjacking risks.
- `Strict-Transport-Security`: HSTS enforced in production environments.

### 4.2 Cross-Origin Resource Sharing (CORS)
- `Access-Control-Allow-Origin`: Explicitly bounded to the configured `CLIENT_URL` (e.g. `http://localhost:5173` or production procurement domain).
- Wildcard origin (`*`) with credentials is explicitly forbidden.
- Credentials (`credentials: true`) enabled for HTTP-only cookie exchange.

### 4.3 Anti-CSRF Protection (Section 24)
- Companion token / Double-Submit pattern: Server sets non-HTTP-only `normwise_csrf` cookie upon authentication.
- Client attaches `X-CSRF-Token` header on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Verified by Express `csrfProtection` middleware before request dispatch.

### 4.4 Rate Limiting (Sections 20 & 21)
- Sliding-window rate limiters prevent brute-force credential stuffing and denial of service:
  - Auth endpoints (`/api/auth/*`): 10 requests per 15-minute sliding window.
  - Document uploads (`/api/documents/upload`): 20 uploads per minute.
  - General APIs: 120 requests per minute.
- Returns generic `429 Too Many Requests` error with code `RATE_LIMIT_EXCEEDED` without leaking internal counter mechanics.

### 4.5 Input Validation (Zod)
- All client-supplied payloads, query parameters, path identifiers, and headers are parsed and sanitized through authoritative Zod schemas on the backend before executing business logic.

---

## 5. File Upload & Processing Security (Phase 11 & 18)

- **Allowed Formats:** Strictly `.pdf` and `.docx` specifications.
- **Size Bounds:** Capped at 10 MB per file.
- **Storage Location:** Saved in an isolated, non-executable filesystem directory outside the web server root.
- **Name Randomization:** Files are assigned server-generated UUID identifiers to prevent path traversal (`../`) and shell injection attacks.
- **Authorization:** Only authenticated users holding the `DOCUMENT_UPLOAD` permission may initiate uploads.

---

## 6. Audit Logging & Provenance (Append-Only)

All security-relevant operations generate structured `AuditEvent` records in PostgreSQL:
- `USER_LOGIN`
- `USER_LOGOUT`
- `LOGIN_FAILED`
- `USER_CREATED`
- `USER_DEACTIVATED`
- `ROLE_CHANGED`
- `PASSWORD_CHANGED`
- `DOCUMENT_UPLOADED`
- `DATASET_IMPORTED`
- `COMPLIANCE_EVALUATED`

**Tamper-Resistance:** Audit events are append-only. There are no delete or update routes in the API or UI for historical audit entries.

---

## 7. Environment Validation & Production Checklist

Startup verification (`server/src/config/env.js`) halts application boot if critical configurations are missing:
1. `DATABASE_URL` must point to an active PostgreSQL database.
2. `AUTH_SECRET` must be configured with a minimum of 32 characters in production.
3. `AUTH_COOKIE_SECURE` defaults to `true` when `NODE_ENV=production`.
4. Run automated check via `/admin/security` or CLI endpoint `/api/admin/security/check`.

---

## 8. Known Security Limitations & Future Hardening

- **Single-Host Rate Limiter:** The current in-memory sliding window rate limiter runs within the single Express Node.js process. In multi-instance cluster or Kubernetes deployments, configure Redis-backed rate limiting (`ioredis`).
- **Hardware Security Modules (HSM):** Enterprise deployment in high-security government installations may integrate PKCS#11 or Azure Key Vault / AWS KMS for signing session tokens.
- **MFA / 2FA:** Multi-factor authentication via TOTP / SMS / Gov OTP (Aadhaar/eSign) is recommended for post-MVP integration.
