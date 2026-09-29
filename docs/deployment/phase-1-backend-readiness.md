# Phase 1 backend readiness

The production API starts with `npm start` from `backend/` and binds to the
platform-provided `PORT` (default `5000` when no value is supplied by the
platform). The live recommendation path uses the server-side Supabase client.

Required backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `AUTH_SECRET` with at least 32 characters in production
- `CORS_ORIGINS` (comma-separated browser origins)

`DATABASE_URL` is optional for isolated legacy Prisma utilities and is not used
to start or serve the Phase 1/2 API routes.

Operational endpoints:

- `GET /api/health` — liveness
- `GET /api/health/ready` — verifies the remote Supabase `standards` table
- `GET /api/version` — build and environment metadata
- `POST /api/recommend` — Sprint 2 deterministic recommendation path

The service-role key must never be placed in frontend environment variables,
bundled assets, or logs.
