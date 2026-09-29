# Submission: Technical Stack Verification

**Stack Principle:** Zero Bloat, Zero NoSQL, Single Relational Engine  

---

## Authorized vs Prohibited Technology Verification

| Layer | Implemented Technology | Prohibited Alternatives | Invariant Status |
|---|---|---|---|
| **Frontend Framework** | React 19 + Tailwind CSS v4 + Vite 8 | Legacy Angular, jQuery | **VERIFIED** |
| **Backend REST API** | Node.js 20 LTS + Express.js 4.21 | Python Flask, PHP | **VERIFIED** |
| **Relational Database** | PostgreSQL 16 | MySQL, Oracle | **VERIFIED** |
| **Dense Vector Layer** | PostgreSQL `pgvector` Extension | Pinecone, Milvus, Chroma | **VERIFIED** |
| **Document Store** | PostgreSQL JSONB | MongoDB, Mongoose, CouchDB | **VERIFIED (Zero MongoDB)** |
| **Graph Store** | PostgreSQL Relational CTEs | Neo4j, Amazon Neptune | **VERIFIED (Zero Neo4j)** |
| **ORM Layer** | Prisma ORM 5.20+ | TypeORM, Sequelize | **VERIFIED** |

---

*For full technical inventory and subsystem statuses, see [TECHNICAL_INVENTORY.md](../TECHNICAL_INVENTORY.md).*
