# NormWise: System Architecture Blueprint

**Architecture Pattern:** Standard Three-Tier Decoupled Architecture  
**Database Invariants:** Unified PostgreSQL 16 with `pgvector` extension. **Strictly NO MongoDB and NO Neo4j.**

---

## 1. System Topology

```
+-------------------------------------------------------------------------+
|                          CLIENT LAYER (Browser)                         |
|     React 19 + Vite + Tailwind CSS + Lucide Icons + Heroicons           |
|     - Dashboard & Indent Entry Form                                     |
|     - Attribute Extraction & Correction Drawer                          |
|     - Recommendation Card & "Why This Standard?" Breakdown              |
|     - Evidence Inspector & Verbatim Clause Viewer                       |
|     - Allied Standards Knowledge Graph Visualizer                       |
|     - Review Decision Form & Immutable Audit Timeline                   |
+-------------------------------------------------------------------------+
                                    |
                          HTTPS / REST API + JSON
                                    |
+-------------------------------------------------------------------------+
|                        APPLICATION LAYER (Node.js)                      |
|     Node.js v20.x + Express API + Zod Validation + Helmet + Iron Session|
|                                                                         |
|  [Requirement Normalization]       [Hybrid Candidate Retrieval Engine]  |
|  - English/Hindi Translation       - Structured Attribute Filtering     |
|  - Unit & Number Tokenization      - Lexical PostgreSQL FTS (BM25)      |
|  - Deterministic Parameter Extract - pgvector Cosine Distance Search    |
|                                                                         |
|  [Safety & Verification Engines]   [Governance & Audit Services]        |
|  - Currentness & Lifecycle Engine  - Server-Side RBAC Middleware        |
|  - Allied Graph Traversal (CTE)    - Self-Approval Prevention Check     |
|  - Deterministic QCO Rule Engine   - SHA-256 Tamper-Evident Logger      |
|  - Evidence Grounding Service      - Document Processing (PDF/OCR)      |
+-------------------------------------------------------------------------+
                                    |
                           Prisma Client ORM
                                    |
+-------------------------------------------------------------------------+
|                         DATA LAYER (PostgreSQL 16)                      |
|                                                                         |
|  [Relational Core Tables]          [Knowledge Graph & Vector Extensions]|
|  - Standard (metadata, status)     - RelatedStandard (recursive CTEs)   |
|  - StandardAmendment (amendments)  - pgvector HNSW Index (vector(1536)) |
|  - Requirement (extracted specs)   - tsvector Full-Text Search Index    |
|  - Recommendation (match records)  - ComplianceRule (QCO mandates)      |
|  - Evidence (verbatim clauses)     - AuditEvent (immutable event log)   |
|  - User & Session (Argon2id/RBAC)  - Document (storage metadata)        |
+-------------------------------------------------------------------------+
```

---

## 2. Recommendation Pipeline (12 Sequential Stages)

1. **Input Normalization:** Receive tender text; validate length between 5 and 10,000 characters.
2. **Multilingual Processing:** Detect Devanagari/English script; apply controlled synonym harmonization; preserve units (`5 L`, `SS 304`).
3. **Structured Attribute Extraction:** Decompose into Product, Material Grade, Capacity, Application, and Technical Parameters.
4. **Structured Candidate Search:** Filter standards matching extracted product, material, or application tags.
5. **Lexical Full-Text Search:** Query PostgreSQL `tsvector` with Indian Standard terminology weights.
6. **Dense Vector Search:** Compute 1536-dimensional embedding and retrieve nearest neighbors via `pgvector` HNSW cosine similarity.
7. **Candidate Deduplication & Ranking:** Merge candidates; apply weighted scoring formula (Product 30%, Application 25%, Vector 20%, Material 15%, Technical 10%).
8. **Currentness Validation:** Query publication records; verify `CURRENT` status; flag `SUPERSEDED` or `WITHDRAWN` standards with active replacements.
9. **Allied Standards Graph Traversal:** Execute PostgreSQL recursive CTE to discover connected raw material, component, and testing standards up to depth 3.
10. **Deterministic Compliance Evaluation:** Check product and standard against official DPIIT/Steel Quality Control Orders.
11. **Evidence Grounding:** Extract verbatim clauses and document citations from database; format template-grounded justification.
12. **Audit Event Logging:** Record recommendation creation with SHA-256 hash in immutable audit log.
