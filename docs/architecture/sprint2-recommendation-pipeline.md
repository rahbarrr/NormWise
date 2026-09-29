# Sprint 2 recommendation pipeline

`POST /api/recommend` accepts `{ "query": "..." }` and executes a server-owned deterministic pipeline against remote Supabase:

1. Normalize whitespace and casing.
2. Extract product, material, application, and simple technical attributes with replaceable deterministic rules.
3. Retrieve standards using the Sprint 1 Supabase repository.
4. Rank candidates with `weighted_metadata_v1`.
5. Exclude non-current standards from primary selection.
6. Load only stored related standards and evidence.
7. Return certification text or `unknown / requires verification`.
8. Persist the recommendation, ranked candidates, and `recommendation_created` audit event.

Weights are product 0.30, material 0.20, application 0.20, title 0.15, scope 0.10, and technical attributes 0.05. Scores are transparent matching scores, not ML probabilities. A primary candidate is `high_confidence` only when it is current, scores at least 0.55, and has evidence. Lower or unsupported matches become `review_required`; no current candidate or a score below 0.20 becomes `no_confident_match`.

Embeddings remain NULL. No embedding provider, reranker, or FastAPI service is used in Sprint 2.
