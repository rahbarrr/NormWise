# Sprint 1 database and curated standards

The authoritative Sprint 1 model contains exactly eight core tables: `users`, `standards`, `recommendations`, `recommendation_standards`, `related_standards`, `evidence`, `documents`, and `audit_events`. Legacy local tables are preserved for existing application compatibility and are not part of the curated Supabase catalog.

## Setup

Use the existing root `.env`. Server-side scripts require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; the service-role key must never be added to `frontend/.env*` or browser code. Apply `supabase/migrations/001_sprint1_eight_table_schema.sql` through the Supabase SQL editor or the authenticated Supabase CLI. The migration enables `pgcrypto`, requests `vector`, enables RLS, adds indexes, and creates the private `procurement-documents` storage bucket.

## Seed and validation

```powershell
npm run sprint1:seed --prefix backend
npm run sprint1:validate --prefix backend
npm run sprint1:test --prefix backend
```

The seed file contains eight pilot-category records with BIS source references. Two verified relationships are seeded when both endpoints are present. Records without authoritative provenance must remain unresolved; the seed process does not fabricate them.

Candidate retrieval normalizes the query and performs metadata/text matching through Supabase. It is deliberately lexical and deterministic; vector and full hybrid ranking remain outside Sprint 1.
