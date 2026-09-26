# NormWise SIH 2024: Team Handoff & Role Assignment

**Event:** Smart India Hackathon 2024 Grand Finale  
**Target Duration:** 10 Minutes Total (5 Min Demo + 5 Min Jury Q&A)  
**Release Version:** `v1.0.0-sih2024`

---

## 1. Team Role Allocation

### Team Member 1: Primary Presenter & Procurement Domain Lead
- **Responsibilities:**
  - Delivers the opening problem pitch (GeM tender challenges, obsolete standards risk, QCO non-compliance).
  - Guides the evaluators through the 5-minute user journey using [`FINAL_SIH_DEMO_SCRIPT.md`](file:///Users/rahbarraza/Downloads/NormWise/FINAL_SIH_DEMO_SCRIPT.md).
  - Leads answers to policy and operational questions:
    - *"Can AI make procurement decisions?"* $\rightarrow$ Explains human-in-the-loop review and why autonomous approvals are legally prohibited.
    - *"Where does the data come from?"* $\rightarrow$ Explains authorized catalog snapshot and dataset provenance.
    - *"How does QCO compliance work?"* $\rightarrow$ Explains DPIIT and Ministry of Steel statutory orders.

### Team Member 2: Technical Architect & Backend/Database Lead
- **Responsibilities:**
  - Manages technical architecture slides (Slide 5: Architecture, Slide 6: Recommendation Engine).
  - Answers deep-dive technical and evaluator questions:
    - *"Why not use MongoDB or Neo4j?"* $\rightarrow$ Explains why PostgreSQL + pgvector provides ACID consistency, unified relational integrity, and recursive CTE graph traversal without multi-database sync overhead.
    - *"Why hybrid retrieval?"* $\rightarrow$ Explains empirical Recall@1 comparison (Hybrid 88.9% vs Vector-only 77.8% vs Lexical 72.2%).
    - *"How do you prevent hallucinations?"* $\rightarrow$ Explains deterministic template-grounded explanations and authoritative candidate retrieval.

### Team Member 3: Demo Operator & System Reliability Lead
- **Responsibilities:**
  - Controls the laptop, projector display, and browser navigation during the presentation.
  - Executes the step-by-step clicks synchronized with Member 1's verbal cues.
  - Monitors system terminals in the background.
  - Executes immediate recovery actions from [`BACKUP_DEMO_PLAN.md`](file:///Users/rahbarraza/Downloads/NormWise/BACKUP_DEMO_PLAN.md) if network or hardware hiccups occur.

---

## 2. Demo Operator Operational Checklist

### A. Pre-Presentation Setup (T-Minus 10 Minutes)
1. **Connect Display:** Plug in HDMI/projector. Verify screen resolution is at 1920x1080 or zoom browser to 90% if projected at 1366x768.
2. **Start Backend:**
   ```bash
   cd server && npm start
   ```
   *Verify:* Terminal prints `Server listening on port 5001`.
3. **Start Frontend:**
   ```bash
   cd client && npm run dev
   ```
   *Verify:* Terminal prints `Local: http://localhost:5173`.
4. **Pre-Flight Health Verification:**
   ```bash
   curl -s http://localhost:5001/api/health
   ```
5. **Open Browser:** Launch Chrome or Firefox in full-screen window at `http://localhost:5173`.

### B. Standard Live Demo Execution Sequence
- **Step 1:** Log in via quick-pill as `officer@normwise.gov.in`.
- **Step 2:** Click **"Use Sample Specification"** (Domestic Stainless Steel Pressure Cooker).
- **Step 3:** Highlight extracted attribute chips (Product, Material, Capacity).
- **Step 4:** Click **"Analyze Requirement"**.
- **Step 5:** Display Top Candidate: `IS 2347:2023`.
- **Step 6:** Click **"Why This Standard?"** and **"Evidence Inspector"** (Clauses 4.1, 7.2, 8.1).
- **Step 7:** Click **"Currentness & Amendments"** (Active 2023 revision, superseded 2017).
- **Step 8:** Click **"Allied Standards"** (`IS 6911` SS material, `IS 7466` gasket).
- **Step 9:** Scroll to **"Statutory Compliance & QCO"** (Mandatory DPIIT 2020 order).
- **Step 10:** Switch to `reviewer@normwise.gov.in`, complete review checklist, and click **"Approve & Finalize"**.
- **Step 11:** Navigate to **"Audit Trail"** to show cryptographic SHA-256 event entry.

### C. Live Emergency Commands (If Needed)
- **Restart Backend:** `Ctrl + C` then `npm start`
- **Re-Seed Database in 3 seconds:** `npm run db:seed`
- **Offline Direct URL:** `http://localhost:5173/recommendations/rec-demo-pc-001`
