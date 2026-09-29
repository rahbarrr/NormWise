# NormWise User Experience States & Interface Specification (Phase 20)

This document catalogs how **NormWise** handles state transitions across all user interfaces: Loading, Error, Empty, and Unauthorized states.

---

## 🎨 Design Philosophy & Principles

- **State Transparency**: The interface never leaves the user wondering if a background action succeeded, failed, or is in progress.
- **Graceful Degradation**: If an AI/LLM service is unreachable, PostgreSQL rule-based recommendations still function seamlessly with clear disclaimers.
- **Demo Data Badging**: Any preloaded sample or benchmark record displays a visible purple badge: `Demo Data`.
- **Accessible & Consistent Colors**:
  - Green / Emerald: `CURRENT`, `COMPLIANT`, `ACCEPTED`
  - Amber / Yellow: `UNDER_REVIEW`, `UNDER_REVISION`, `WARNING`
  - Red / Rose: `WITHDRAWN`, `NON_COMPLIANT`, `REJECTED`, `ERROR`
  - Blue / Indigo: Primary brand accents, active filters, search highlights
  - Purple / Violet: `Demo Data` tag, AI rationale notes

---

## 🔄 State Catalog by Screen

### 1. Global Application Shell
- **Unhandled Error Boundary (`src/components/ui/ErrorBoundary.jsx`)**:
  - Catches unexpected React component runtime crashes.
  - Displays a calm error card with "Reload Application" and "Return to Dashboard" buttons.
  - Never leaks sensitive stack traces or internal paths to end users.
- **Unauthorized / Session Expired**:
  - If a 401 response is received, the user is redirected to `/login` with a helpful notification: *"Your session has expired. Please sign in again."*

### 2. Requirement Input & Recommendation Page (`/recommend` & `/demo`)
- **Loading State**:
  - Multi-stage animated progress bar:
    1. *"Extracting technical parameters..."*
    2. *"Querying pgvector semantic catalog..."*
    3. *"Cross-referencing Quality Control Orders (QCO)..."*
  - Submit button disabled to prevent double clicks.
- **Empty State**:
  - Input field empty: Displays 3 clickable sample chips (*Pressure Cooker*, *LED Street Luminaire*, *Induction Cooker*).
- **Error State**:
  - Inadequate specification text (< 10 chars): Inline field validation prompt: *"Please provide at least 10 characters describing the item to recommend standards."*
  - Network error: Toast notification with retry action.

### 3. Recommendation Results (`/results/:id`)
- **Loading State**: Skeleton cards representing the primary standard header, confidence badge, and comparison table.
- **Empty State**: If no standards match the threshold score, renders an informative fallback: *"No exact Indian Standard identified for this specification. Suggested categories: General Hardware / Machinery."*
- **Error State**: If the recommendation ID does not exist in the database, displays a 404 alert: *"Recommendation record not found. It may have been archived or created under another account."*

### 4. Clause Evidence Screen (`/evidence/:id`)
- **Loading State**: Pulsing skeleton lines for clause numbers and verbatim excerpts.
- **Empty State**: If a standard has no indexed clause excerpts, displays: *"Normative clause indexing in progress for this standard. Refer to official BIS publication."*
- **Active State**: Displays clause title, verbatim excerpt, and reason for applicability.

### 5. Technical Review Screen (`/review/:id`)
- **Self-Approval Prevention State**:
  - If the logged-in user is the original author of the recommendation, approval buttons are disabled with warning text:
    > ⚠️ *"Four-Eyes Principle Enforced: You submitted this specification. Another Technical Reviewer or Administrator must approve it."*
- **Loading State**: Spinner overlay while submitting review decisions.
- **Success State**: Banner notification and status badge transition to `ACCEPTED` or `REJECTED`.

### 6. System Monitoring Dashboard (`/admin/monitoring`)
- **Loading State**: Animated radar/activity indicator while polling `/api/admin/system/health`.
- **Error State**: Red banner if backend API is unreachable with countdown to automatic retry.
- **Operational Badges**: Pulsing green dots for `AVAILABLE` services; warning amber for `NOT_CONFIGURED` optional external providers.
