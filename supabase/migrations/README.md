# Supabase Migrations

This directory will contain all Supabase/PostgreSQL migration files for NormWise.

## Migration Naming Convention

```
001_initial_schema.sql      ← 8-table MVP schema
002_indexes.sql             ← Performance indexes
003_vector.sql              ← pgvector extension + vector columns
004_rls_policies.sql        ← Row-level security
005_seed_data.sql           ← Pilot curated standards data
```

> **Note:** Sprint 1 will create these migrations.
> All schema changes must go through migrations — never modify the schema directly via the Supabase dashboard without a corresponding migration file.

## Running Migrations

```bash
# Using Supabase CLI
supabase db push

# Or using the migration scripts
node scripts/database/migrate.js
```
