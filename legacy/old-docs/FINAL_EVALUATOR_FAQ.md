# NormWise SIH 2024: Final Evaluator Q&A Playbook

**Purpose:** Authoritative, factual answers to anticipated jury and evaluator questions during the SIH 2024 final presentation.  
**Rule:** Every answer is grounded directly in the actual implemented codebase and empirical evaluation results.

---

### Q1: What problem does NormWise solve?
**Answer:** Public procurement officers on portals like GeM struggle to identify applicable Indian Standards (IS) from unstructured tender indents. Citing obsolete standards or missing mandatory Quality Control Orders (QCO) causes tender disqualifications, supplier disputes, and substandard public goods. NormWise provides evidence-backed standard identification, currentness validation, allied standard mapping, and QCO compliance assessment with human review.

### Q2: Why is AI / Semantic Search needed?
**Answer:** Procurement specifications rarely match standard titles verbatim. A tender might request *"heavy duty induction cooking range with ceramic top"*, whereas the official BIS standard is titled *"Domestic and Commercial Electrical Heating Appliances"*. Semantic vector search bridges the vocabulary gap between colloquial engineering indents and formal statutory titles.

### Q3: Why not keyword search alone?
**Answer:** In our empirical baseline evaluation on 18 ground-truth procurement cases, keyword search achieved only **72.2% Recall@1**. It fails when tenders use synonyms (e.g., *luminaire* vs *street light*), regional terms, or technical ratings omitted from titles. Hybrid retrieval increases Recall@1 to **88.9%**.

### Q4: Why hybrid retrieval?
**Answer:** Keyword search is precise for exact numbers (*"IS 2347"*); vector search is flexible for conceptual similarity; structured search filters rigid parameters (*"SS 304"*, *"5 Litre"*). Combining all three ensures high recall without sacrificing technical precision.

### Q5: Where does the standards data come from?
**Answer:** The current system uses an authorized demonstration dataset of curated Indian Standards across 6 major procurement domains (Kitchenware, Lighting, Piping, Power, Cement, Safety), ingested with version provenance (`dataset-v2.1`). In full production, data would be synchronized via institutional data-sharing agreements with BIS.

### Q6: How is currentness handled?
**Answer:** NormWise tracks publication dates, revision history, and amendment records in PostgreSQL. Standards are classified as `CURRENT`, `SUPERSEDED`, or `WITHDRAWN`. If an obsolete standard matches, the engine marks it `canProceedAsPrimary = false` and automatically provides a replacement pointer to the active revision (e.g., `IS 2347:2017` $\rightarrow$ `IS 2347:2023`).

### Q7: What if multiple standards apply?
**Answer:** Public procurement often requires multiple standards (product specification, raw material, and test methods). NormWise designates the top-ranked item as the **Primary Recommendation**, ranks **Alternative Standards** with parameter comparison, and surfaces **Allied Standards** via a relational knowledge graph.

### Q8: What if no standard matches?
**Answer:** If candidate retrieval returns no standards or the top candidate scores $< 0.25$, the system triggers `NO_MATCH` with 0% false confidence. It refuses to pick an irrelevant standard merely because it is the closest mathematical vector.

### Q9: How do you prevent hallucinations?
**Answer:** NormWise enforces 10 architectural guardrails:
1. Standards are retrieved strictly from an authoritative database.
2. Explanations are generated from deterministic templates grounded in database fields.
3. Every evidence citation links to verbatim clause text.
4. Input prompts are treated as unindexed search text, completely neutralizing prompt injection.

### Q10: How is compliance evaluated?
**Answer:** Compliance is evaluated through a deterministic rule engine (`complianceRuleService.js`) that checks standard numbers and product categories against official gazette Quality Control Orders (QCO). It outputs `MANDATORY_QCO` or `VOLUNTARY_CERTIFICATION` with official order citations, explicitly labeled as decision-support.

### Q11: Can AI approve procurement?
**Answer:** **No, absolutely not.** Autonomous approval is legally forbidden under General Financial Rules (GFR 2017) and public procurement guidelines. NormWise assists with discovery and evidence assembly; the authorized technical reviewer makes the final decision. Server-side rules also forbid procurement officers from self-approving their own recommendations.

### Q12: How was the system evaluated?
**Answer:** We evaluated NormWise on 20 real-world public procurement benchmark cases (`eval-phase21-v1.0`). On 18 cases with single ground truth, it achieved **Recall@1 of 88.9%**, **Recall@5 of 94.4%**, **MRR of 0.903**, and **0 currentness violations**.

### Q13: What are the current limitations?
**Answer:**
1. Dataset coverage is currently restricted to curated procurement domains.
2. Degraded, low-resolution scans require officer review of extracted attributes.
3. Standards revisions require periodic catalog updates.

### Q14: How would this scale?
**Answer:** PostgreSQL 16 with `pgvector` HNSW indexes scales to hundreds of thousands of vector embeddings sub-linearly. The entire catalog of ~20,000 Indian Standards can reside comfortably in a standard PostgreSQL instance without requiring external vector cluster infrastructure.

### Q15: What is the future scope?
**Answer:**
1. National BIS catalog expansion under authorized data-sharing agreements.
2. Direct API integration with the Government e-Marketplace (GeM) tender indent workflow.
3. Bhashini API integration for all 22 scheduled Indian languages.
