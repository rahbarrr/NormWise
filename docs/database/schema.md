# NormWise 8-Table MVP Database Schema

The production MVP uses exactly 8 core tables in Supabase PostgreSQL:

## Table Summary

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | `users` | User accounts, roles (`PROCUREMENT_OFFICER`, `TECHNICAL_REVIEWER`, `ADMIN`, `AUDITOR`) |
| 2 | `standards` | BIS standard catalog, metadata, scope, and vector embeddings |
| 3 | `recommendations` | Procurement evaluation records and query logs |
| 4 | `recommendation_standards` | Join table connecting recommendations to candidate standards with match scores |
| 5 | `related_standards` | Directional standard relationships (normative, test method, superseded by) |
| 6 | `evidence` | Grounded source citations, clause excerpts, and validation evidence |
| 7 | `documents` | Uploaded procurement specifications, tenders, and extraction artifacts |
| 8 | `audit_events` | Immutable audit log of all human decisions and system actions |

## Entity Relationship Overview

```
users (1) ────< recommendations (N) ────< recommendation_standards (N) >──── (1) standards
                       │                                                        │
                       ├────< evidence (N) >────────────────────────────────────┤
                       ├────< documents (N)                                     ├────< related_standards (N)
                       └────< audit_events (N)
```

> **Note:** Sprint 1 will apply the complete Supabase migrations (`001_initial_schema.sql` through `005_seed_data.sql`).
