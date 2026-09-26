# Submission: Project Executive Summary

**Project Name:** NormWise  
**Product Category:** AI-Powered Standards Intelligence for Public Procurement  
**Primary Focus:** Bureau of Indian Standards (BIS) Identification, Lifecycle Currentness, and Statutory QCO Compliance  

---

## 1. Problem Statement

Indian government procurement bodies (GeM, Indian Railways, CPWD, Defence, and State Undertakings) face substantial operational bottlenecks when specifying standards for tenders:
- **Massive Standards Catalog:** Over 20,000 active Indian Standards exist across hundreds of sectional committees.
- **Outdated Standards Citations:** Tenders frequently cite withdrawn or superseded specifications, risking legal disputes and vendor rejection.
- **Mandatory QCO Compliance:** Failure to mandate compulsory ISI mark certification under statutory Quality Control Orders violates ministry mandates.
- **Generic AI Hallucinations:** Conventional LLMs invent fictitious standard numbers and fabricate nonexistent clauses.

---

## 2. Proposed Solution

NormWise is an evidence-backed standards intelligence platform that bridges natural language procurement requirements with official Indian Standards:
- **3-Way Hybrid Retrieval:** Combines structured code lookups, PostgreSQL BM25 full-text keyword search, and dense semantic vector similarity (`pgvector`) via Reciprocal Rank Fusion (RRF).
- **Currentness Safety Guarantee:** Matching scores NEVER override lifecycle currentness. Superseded standards automatically surface active replacements with prominent warnings.
- **Relational Knowledge Graph:** Surfaces companion raw materials, components, and test method standards stored natively in PostgreSQL.
- **Deterministic Compliance:** Evaluates statutory Quality Control Orders (QCOs) through deterministic rule engines isolated from probabilistic LLM generation.
- **Traceable Ground Truth:** Every recommendation links to verified BIS gazette clauses, scope definitions, and verification excerpts.
- **Human Governance:** Mandatory reviewer checklists, sign-offs, and an immutable statutory audit trail.

---

*For detailed capability breakdowns, see [PROJECT_FACT_SHEET.md](../PROJECT_FACT_SHEET.md) and [PROBLEM_SOLUTION_MAPPING.md](../PROBLEM_SOLUTION_MAPPING.md).*
