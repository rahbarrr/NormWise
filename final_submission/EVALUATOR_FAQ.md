# NormWise: Evaluator Frequently Asked Questions

**Quick Reference for Technical & Policy Inquiries**

---

1. **What problem does NormWise solve?**  
   It eliminates manual guesswork in identifying applicable, current Indian Standards for tender specifications, preventing the citation of obsolete standards and missing mandatory QCOs.

2. **Why not keyword search alone?**  
   In our benchmark evaluation, keyword search achieved only 72.2% Recall@1 because tender indents rarely use official standard titles verbatim. NormWise hybrid retrieval achieves 88.9%.

3. **Why PostgreSQL + pgvector instead of specialized databases?**  
   PostgreSQL 16 unified with `pgvector` and recursive CTEs handles relational data, 1536-dimensional embeddings, full-text search, and knowledge graph queries in a single ACID-compliant engine, avoiding multi-database sync failures and external cluster costs.

4. **How do you prevent hallucinations?**  
   Recommendations are retrieved exclusively from the PostgreSQL catalog; explanations are generated via deterministic templates grounded in database records; citations are linked to verbatim clause snippets.

5. **Can AI approve procurement tenders?**  
   No. Public procurement regulations legally require human decision-making. NormWise is assistive decision support; technical reviewers make final decisions, and authoring officers are prevented from self-approving.

6. **How does currentness validation work?**  
   Standards have publication and supersession records. Obsolete standards are blocked from primary citation and point to active replacements.

7. **How does the system scale?**  
   The entire national catalog of ~20,000 Indian Standards can be indexed in PostgreSQL with `pgvector` HNSW indexes, serving queries in sub-50 milliseconds on commodity server hardware.
