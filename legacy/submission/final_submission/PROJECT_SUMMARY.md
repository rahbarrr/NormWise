# NormWise: Project Summary

**Product Name:** NormWise  
**Tagline:** AI-Powered Indian Standards Intelligence Engine for Public Procurement  
**Release Tag:** `v1.0.0-sih2024`  
**License / Mode:** Assistive Decision-Support System with Human Review

---

## The Procurement Problem

On public procurement platforms such as the Government e-Marketplace (GeM), officers handle thousands of tender specifications every day. Identifying the correct Indian Standard (IS) is critical for statutory compliance, safety, and product quality. However:
1. **Unstructured Specifications:** Indents are written in colloquial or regional language, omitting official BIS keywords.
2. **Obsolete Standards Risk:** Standards undergo frequent revisions, amendments, and withdrawals. Citing a superseded standard legally invalidates a tender.
3. **Mandatory Quality Control Orders (QCO):** The Government of India (DPIIT, Ministry of Steel, etc.) periodically mandates ISI certification for specific products. Missing a QCO allows non-compliant suppliers to bid.
4. **Lack of Traceability:** Traditional procurement lacks an audit trail explaining why a standard was selected.

---

## The NormWise Solution

NormWise is an end-to-end intelligence engine that:
1. **Normalizes Requirements:** Ingests unstructured English/Hindi specifications and extracts structured parameters (Product, Material, Capacity, Application).
2. **Performs Hybrid Retrieval:** Combines structured parameter matching, lexical full-text search, and dense semantic vector search (`pgvector`).
3. **Validates Currentness:** Automatically checks whether standards are `CURRENT`, `SUPERSEDED`, or `WITHDRAWN`, redirecting users to active replacements.
4. **Surfaces Allied Standards:** Traverses a relational knowledge graph (via PostgreSQL recursive CTEs) to identify raw material standards, component standards, and test methods.
5. **Evaluates QCO Compliance:** Runs a deterministic rule engine to alert officers of mandatory statutory certification orders.
6. **Enforces Human Governance:** Requires independent technical reviewer sign-off with verification checklists, strictly forbidding officer self-approval.
7. **Maintains Tamper-Evident Auditability:** Generates an immutable, cryptographic SHA-256 audit trail of every recommendation and decision.

---

## Primary User Personas

1. **Procurement Officer:** Enters tender indents, reviews extracted attributes, generates candidate standards, and forwards recommendations for review.
2. **Technical Reviewer:** Examines verbatim evidence clauses, verifies currentness, evaluates QCO compliance, and approves/modifies the recommendation.
3. **Auditor / Vigilance Official:** Inspects immutable audit logs, decision rationales, and dataset provenance for procurement transparency.
4. **System Administrator:** Manages users, RBAC permissions, and authorized standards dataset imports.
