# NormWise: Technical & Operational Feasibility Analysis

**Assessment Standard:** Government of India Public Procurement Feasibility Guidelines

---

## 1. Technical Feasibility
- **Unified Standard Stack:** Built with enterprise-grade open-source components: Node.js 20, Express, Prisma ORM, and PostgreSQL 16.
- **Native Vector Engine:** Uses `pgvector` HNSW indexes within PostgreSQL, eliminating the operational complexity and failure modes of maintaining separate vector database clusters (e.g., Pinecone, Milvus, Qdrant).
- **Relational Graph Modeling:** Allied standards and multi-hop relationships are handled via PostgreSQL recursive Common Table Expressions (`WITH RECURSIVE`), avoiding specialized graph database overhead (e.g., Neo4j).
- **Containerization:** Fully containerized via Docker and Docker Compose for deterministic deployment on standard Linux VMs or NIC cloud infrastructure.

---

## 2. Operational Feasibility
- **Human-in-the-Loop Governance:** Aligns with General Financial Rules (GFR 2017) and GeM procurement guidelines. The engine functions strictly as assistive decision support, requiring verified technical reviewer sign-offs.
- **Separation of Duties:** Built-in RBAC strictly prevents procurement officers from approving their own indents, satisfying vigilance and internal audit standards.
- **Audit Traceability:** Cryptographic SHA-256 event logging guarantees tamper-evident provenance for post-procurement vigilance audits.

---

## 3. Data Feasibility
- **Structured Standards Ingestion:** Capable of ingesting BIS standards metadata, scopes, clauses, and amendments via JSON, CSV, and XML pipelines.
- **Deterministic Compliance Mapping:** QCO orders published in the Gazette of India are easily transcribed into deterministic rule records with statutory legal citations.

---

## 4. Deployment Feasibility
- **Hardware Requirements:** Runs on modest commodity hardware (2 vCPU, 4 GB RAM, 20 GB SSD).
- **Zero Cloud Runtime Dependency:** Runs 100% locally on on-premise government servers with zero external internet API calls during tender evaluations.
