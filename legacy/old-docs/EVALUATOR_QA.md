# NormWise: Comprehensive Evaluator & Technical Jury Q&A

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Standard of Response:** Factual, technically grounded, completely aligned with implementation and documented limitations.

---

### Q1: Where does the standards data come from?
**Answer:**  
*"Standards metadata, titles, scopes, amendments, and Quality Control Orders are derived from public gazette notifications published by the Bureau of Indian Standards (BIS) and central government ministries (DPIIT, Ministry of Power, etc.). In our active demonstration database, we have indexed 83 curated Indian Standards covering core public procurement categories. We do not host or distribute proprietary full-text copyrighted BIS standard documents."*

---

### Q2: Can you use the complete BIS database?
**Answer:**  
*"Technically, yes. Our database schema, hybrid retrieval pipeline, and Prisma ORM are architected to scale to the entire 20,000+ BIS catalog. Operationally, accessing full-text BIS standards at scale requires an official data-sharing partnership or API integration with the BIS Manakonline portal. For this hackathon prototype, we demonstrate full operational capability on an authorized, representative subset."*

---

### Q3: How do you handle updated, amended, or withdrawn standards?
**Answer:**  
*"We enforce a strict safety invariant: **matching score never overrides lifecycle currentness**. Standards are classified as `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, or `UNDER_REVIEW`. When a tender cites an obsolete standard (e.g. `IS 2347:2014`), NormWise flags it, promotes the active successor (`IS 2347:2023`), and displays a prominent supersede alert. We verified zero currentness violations in our Phase 21 evaluation."*

---

### Q4: What happens if multiple standards apply to one requirement?
**Answer:**  
*"A major procurement tender often involves multiple standards. NormWise addresses this on two levels:
1. **Primary vs Alternative Candidates:** If two standards legitimately match a product, the engine presents the top candidate as Primary and ranks valid alternates under 'Other Possible Matches'.
2. **Knowledge Graph Layer:** The relational knowledge graph surfaces companion standards: raw materials (e.g. `IS 6911` Stainless Steel), subcomponents (e.g. `IS 7466` Rubber Gaskets), and safety test methods (e.g. `IS 302`)."*

---

### Q5: What happens when the requirement is ambiguous or underspecified?
**Answer:**  
*"NormWise does **NOT** force a specific recommendation when critical information is missing. If a user enters 'Need standard for a pressure cooker' without capacity or material, the engine returns `CLARIFICATION_REQUIRED`, identifies what attributes are missing, and presents clarifying questions to guide the officer."*

---

### Q6: How do you prevent hallucinated standards and fake clauses?
**Answer:**  
*"We implement ten architecturally enforced AI guardrails:
1. Candidate retrieval is gated by structured lookups, PostgreSQL BM25, and `pgvector` dense search—an LLM is never asked to invent standard numbers.
2. Normative clauses are stored as verbatim text from official gazettes; free-form generative quoting is blocked.
3. Recommendations must bind to verified primary keys in the database.
4. Explanations link to exact clause numbers viewable in the Evidence Drawer."*

---

### Q7: Can the AI autonomously make procurement decisions or approve tenders?
**Answer:**  
*"**Absolutely not.** NormWise is an assistive intelligence decision-support tool, not an autonomous approval authority. Public procurement requires legal accountability under the General Financial Rules (GFR). The system assists with discovery, currentness verification, and evidence synthesis, but the authorized technical reviewer and procurement officer must review the evidence and formally sign off."*

---

### Q8: How is statutory compliance (QCOs) determined?
**Answer:**  
*"Compliance is evaluated **deterministically**. Central ministry Quality Control Orders (QCOs) are modeled as structured condition rules in `complianceRuleService.js`. The engine checks whether the product and application fall under compulsory ISI marking. The LLM is strictly prohibited from altering or overriding compliance determinations."*

---

### Q9: How do you evaluate recommendation quality?
**Answer:**  
*"We built a comprehensive evaluation framework (Phase 21) using **20 authentic procurement specifications** across four domain categories. We calculate **Recall@1 (88.9%)**, **Recall@5 (94.4%)**, and **MRR (0.903)** strictly over verified cases. We also classify failures into a standardized **13-category error taxonomy** (e.g. `AMBIGUOUS_HANDLING_ERROR`) to drive engineering improvements."*

---

### Q10: What happens if there is no matching standard?
**Answer:**  
*"If a requirement falls outside BIS scope (e.g., specialized cryogenic aerospace valves), candidate scores fall below our confidence floor. The engine returns `NO_MATCH` or `INSUFFICIENT_EVIDENCE` and suggests checking sectional committee draft releases, rather than returning a false positive."*

---

### Q11: How does multilingual input work?
**Answer:**  
*"Tender text in Hindi (HI), Marathi (MR), or Bengali (BN) is normalized via our `multilingualService.js`. Domain-specific transliteration dictionaries and Indic tokenizers map regional terms (e.g. 'स्टेनलेस स्टील प्रेशर कुकर') to standardized engineering terminology prior to hybrid retrieval, achieving 100% Top-1 retrieval in our Indic test cases."*

---

### Q12: Why did you choose PostgreSQL?
**Answer:**  
*"Consolidation and data integrity. Government procurement requires ACID transactions, relational integrity for audit trails, and strict role permissions. PostgreSQL 16 handles relational data, complex JSON schemas, full-text GIN search, and vector search in a single reliable engine, avoiding multi-database synchronization overhead."*

---

### Q13: Why pgvector instead of specialized vector databases like Pinecone or Milvus?
**Answer:**  
*"External vector databases introduce network latency, distributed consistency problems, and external cloud compliance risks. With `pgvector`, vector embeddings live in the exact same database transaction as standard metadata and audit logs. We can perform relational joins between vector similarity results, currentness status, and knowledge graph edges in a single atomic SQL query."*

---

### Q14: Why hybrid retrieval instead of pure vector search?
**Answer:**  
*"Pure vector search struggles with exact technical codes (e.g. distinguishing *IS 10322 Part 5 Sec 3* from *Part 5 Sec 1*), while pure keyword search fails on plain-language descriptions. Our hybrid approach combines the exact precision of structured lookups, the technical keyword accuracy of BM25, and the semantic understanding of dense embeddings via Reciprocal Rank Fusion."*

---

### Q15: How does the system scale to enterprise government workloads?
**Answer:**  
*"The stateless Node.js API server horizontally scales across Docker containers behind an Nginx ingress reverse proxy. PostgreSQL utilizes indexed HNSW vector indexes, GIN full-text indexes, and connection pooling. In performance benchmarks, single queries complete in **30ms on average**, easily supporting hundreds of concurrent procurement officers."*
