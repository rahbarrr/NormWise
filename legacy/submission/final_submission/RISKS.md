# NormWise: Risk Analysis & Architectural Mitigation Matrix

| Risk Scenario | Initial Severity | Technical & Architectural Mitigation | Residual Risk |
| :--- | :---: | :--- | :---: |
| **1. Citation of Obsolete Standards** | **CRITICAL** | `currentnessService.js` independently validates publication status, flags `SUPERSEDED`/`WITHDRAWN` standards, and redirects to active replacements. | Low |
| **2. AI Hallucination of Standards/Clauses** | **CRITICAL** | Template-grounded explanation generation; candidates retrieved strictly from PostgreSQL; evidence linked to verbatim indexed clauses. | Negligible |
| **3. Missing Mandatory QCO Orders** | **HIGH** | Deterministic Quality Control Order (QCO) rule engine maps gazette orders to affected standard numbers and product categories. | Low |
| **4. Unchecked Officer Self-Approval** | **HIGH** | Server-side authorization middleware (`forbidSelfApproval`) blocks authoring officers from approving their own records with HTTP 403. | Negligible |
| **5. Ambiguous or Incomplete Specifications** | **MEDIUM** | Ambiguity detection triggers `CLARIFICATION_REQUIRED` when top candidates have a score gap $< 0.06$ or key parameters are missing. | Low |
| **6. Corrupted or Malicious File Uploads** | **MEDIUM** | Storage path traversal prevention (`sanitizeFilename`), MIME-type validation, and 10 MB size limits. | Negligible |
| **7. Out-of-Catalog Requirement Queries** | **MEDIUM** | Hard score cutoff ($< 0.25$) returns `NO_MATCH` with 0% false confidence instead of guessing an irrelevant standard. | Low |
| **8. Audit Trail Tampering** | **MEDIUM** | Read-only REST API; append-only database operations; cryptographic SHA-256 event integrity hashing. | Negligible |
