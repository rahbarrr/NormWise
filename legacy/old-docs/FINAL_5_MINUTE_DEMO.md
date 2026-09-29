# NormWise: Final 5-Minute Evaluator Live Demo Script

**Total Demo Duration:** 04:45 Minutes (Measured)  
**Presenter:** Primary Presenter  
**Operator:** Demo Operator  
**Demo Account:** `officer@normwise.gov.in` $\rightarrow$ `reviewer@normwise.gov.in`

---

## Timed Demo Breakdown

| Timeline | Phase | Screen / Action | Speaker Cue |
| :---: | :--- | :--- | :--- |
| **00:00 – 00:30** | **Problem Statement** | Login Portal (`http://localhost:5173`) | *"Respected evaluators, public procurement officers on GeM process thousands of complex technical specifications every day. Identifying the correct Indian Standard is high-stakes: citing an obsolete revision or missing a mandatory Quality Control Order leads to tender cancellation, legal disputes, and substandard public goods. NormWise is an AI-powered intelligence engine that provides evidence-backed standard identification with strict human-in-the-loop review."* |
| **00:30 – 01:00** | **Requirement Input** | New Recommendation Dashboard | *"Let us enter a realistic requirement from a central government hostel indent for 500 domestic stainless steel pressure cookers."* (Operator clicks 'Use Sample Specification'). *"Notice how NormWise immediately normalizes the text and extracts structured attributes: Product is Domestic Pressure Cooker, Material is SS 304, Capacity is 5L, and Safety Valve is identified. The officer can verify and edit these attributes before triggering analysis."* |
| **01:00 – 01:30** | **Attribute Extraction** | Attribute Review Card | *"The officer inspects the extracted chips. Everything is structured into formal engineering parameters, ready for our hybrid matching pipeline."* |
| **01:30 – 02:15** | **Recommendation** | Recommendation Results Screen | (Operator clicks 'Analyze Requirement'). *"Within 200 milliseconds, our tri-engine retrieval searches structured tags, PostgreSQL lexical full-text, and pgvector dense embeddings. Top Candidate appears: IS 2347:2023 with a 92% Match Score. Notice this is explicitly labeled as an internal matching signal, not an official BIS score."* |
| **02:15 – 03:00** | **Why This Standard & Evidence** | 'Why This Standard?' Drawer & Evidence Inspector | *"How do we know this recommendation is trustworthy? We open 'Why This Standard?' to view transparent factor scoring: Product match is 30%, Material SS 304 matches Annexure A, 5L falls within the 12L domestic limit, and vector cosine similarity is 0.88. Next, we open the Evidence Inspector: zero hallucinated clauses. Here are verbatim clauses 4.1 for material grade, 7.2 for proof pressure testing, and 8.1 for the safety valve."* |
| **03:00 – 03:30** | **Currentness & Allied Standards** | Currentness Tab & Knowledge Graph | *"Is the standard current? NormWise displays an emerald ACTIVE badge for IS 2347:2023 and flags the older 2017 revision as SUPERSEDED. Next, a tender is never just one standard. Using PostgreSQL recursive queries without Neo4j, our allied standards graph surfaces IS 6911 for raw stainless steel sheets and IS 7466 for rubber gaskets."* |
| **03:30 – 04:00** | **Statutory QCO Compliance** | Compliance Card | *"Does the vendor legally require an ISI mark? Our deterministic compliance engine flags MANDATORY QCO under the DPIIT 2020 Order, providing the official gazette citation for verification."* |
| **04:00 – 04:30** | **Human Review & Decision** | Technical Reviewer Screen | (Operator switches to reviewer account). *"NormWise never autonomously approves a tender. The technical reviewer verifies the checklist, records their rationale, and clicks 'Approve & Finalize'. If the original procurement officer attempted to approve their own indent, our server returns HTTP 403 Forbidden."* |
| **04:30 – 04:45** | **Audit Trail & Value Close** | Audit Trail View | *"Finally, we open the Audit Trail. Every single action, checklist, and decision is permanently recorded in an immutable log with a cryptographic SHA-256 integrity hash. NormWise delivers instant discovery, eliminates obsolete standards, guarantees verbatim clause evidence, maps mandatory QCOs, and enforces human governance on PostgreSQL. Thank you."* |
