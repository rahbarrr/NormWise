# Submission: System Architecture & Data Flow

**Architecture Classification:** Three-Tier Web Application  
**Primary Engine:** Node.js 20 Express REST API + PostgreSQL 16 with native `pgvector`  
**Frontend Client:** React 19 SPA (Vite 8, Tailwind CSS v4, React Router v7)  

---

## 1. System Topology

```text
[ Client Browser ] ──HTTPS──► [ Nginx Reverse Proxy ] ──► [ React 19 Frontend SPA ]
                                        │
                                        ▼ (REST API)
                             [ Node.js 20 Express API ]
                             ├── Security (Helmet, CORS, CSRF, Rate Limiting)
                             ├── Authentication & RBAC (HTTP-Only Secure Cookies)
                             └── Core Services (Retrieval, Compliance, Evaluation)
                                        │
                                        ▼ (Prisma ORM)
                             [ PostgreSQL 16 + pgvector ]
                             ├── Relational Tables (Standards, Users, Audits)
                             ├── GIN Full-Text Index (to_tsvector BM25)
                             ├── Dense Vector Embeddings (1536-dim HNSW)
                             └── Knowledge Graph (RelatedStandard Recursive CTEs)
```

---

## 2. Invariants & Technology Verification

- **Zero MongoDB / Zero Mongoose:** All operational data, sessions, and documents persist relationally in PostgreSQL.
- **Zero Neo4j / Zero External Graph DBs:** Knowledge graph relationships are modeled natively in the `RelatedStandard` table with recursive CTEs (depth $\le 3$).
- **Deterministic Compliance:** Rule evaluation runs in pure JavaScript code (`complianceRuleService.js`), completely isolated from probabilistic LLM hallucinations.

---

*For full architectural specifications, see [FINAL_ARCHITECTURE.md](../FINAL_ARCHITECTURE.md) and [docs/RECOMMENDATION_PIPELINE.md](../docs/RECOMMENDATION_PIPELINE.md).*
