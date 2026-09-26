# NormWise SIH 2024: Final 5-Minute Live Demo Script

**Target Evaluation Time:** Exactly 4:30 – 5:00 Minutes  
**Demo Persona 1:** Procurement Officer (`officer@normwise.gov.in`)  
**Demo Persona 2:** Technical Reviewer (`reviewer@normwise.gov.in`)  
**Primary Demonstration Case:** Domestic Stainless Steel Pressure Cooker (`IS 2347:2023`)

---

## Chronological Live Demo Walkthrough

### 0:00 – 0:30 | The Procurement Problem
- **Presenter Script:**  
  *"Good morning respected evaluators. When government procurement officers prepare tenders on portals like GeM, identifying the correct and current Indian Standard is a high-stakes, error-prone manual task. Citing an obsolete standard or missing a mandatory Quality Control Order (QCO) causes tender rejection, legal challenges, and substandard equipment deliveries. NormWise is our solution: an AI-powered intelligence engine that provides evidence-backed standard identification with strict human-in-the-loop review."*
- **Screen:** Display NormWise Login Screen at `http://localhost:5173`. Click **"Procurement Officer"** quick login.

---

### 0:30 – 1:00 | Realistic Requirement Input & Extracted Attributes
- **Presenter Script:**  
  *"Let us input a real procurement specification copied directly from a central government hostel indent for 500 units of domestic stainless steel pressure cookers."*
- **Action:** Paste specification text into the requirement box:  
  `"Procurement of 500 units of domestic stainless steel pressure cooker 5 litre capacity for residential hostels, food grade SS 304 material with safety valve."`
- **Presenter Points Out:**  
  *"Before sending raw text to search, NormWise immediately normalizes the text and extracts structured engineering attributes: Product is Domestic Pressure Cooker, Material is SS 304, Capacity is 5L, and Safety Valve is identified. If the officer notices a typo or omitted detail, they can edit these attributes directly."*
- **Screen:** Show extracted attribute chips on screen.

---

### 1:00 – 1:45 | Hybrid Analysis & Recommendation Result
- **Presenter Script:**  
  *"Now we click 'Analyze Requirement'. Within 200 milliseconds, our tri-engine hybrid retrieval searches structured parameters, lexical BM25 terms, and pgvector dense semantic embeddings."*
- **Action:** Click **"Analyze Requirement"**.
- **Result:** Top Recommended Standard Card appears:  
  **IS 2347:2023 — Domestic Pressure Cookers — Specification (Fifth Revision)**
- **Presenter Points Out:**  
  *"Notice our 92% Match Score. This is explicitly labeled as an internal matching signal, not an official BIS score. Notice also that the system identified and displayed alternative standards such as commercial cookers or aluminum cookers, but ranked them lower based on specific parameter mismatches."*

---

### 1:45 – 2:30 | "Why This Standard?" & Verbatim Evidence
- **Presenter Script:**  
  *"Evaluators often ask: 'Can we trust why this standard was chosen?' Let us open 'Why This Standard?'"*
- **Action:** Click **"Why This Standard?"** drawer.
- **Presenter Points Out:**  
  *"The engine breaks down its scoring transparently: Product match is 30%, Material SS 304 matches Annexure A, 5L falls within the 12L domestic threshold, and vector cosine similarity is 0.88."*
- **Action:** Click **"Evidence Inspector"** tab.
- **Presenter Points Out:**  
  *"NormWise does NOT fabricate clauses or hallucinate text. Here are the authentic verbatim clauses directly from IS 2347: Clause 4.1 for SS 304 material, Clause 7.2 for proof pressure testing, and Clause 8.1 for safety release valve operating thresholds."*

---

### 2:30 – 3:15 | Currentness Verification & Allied Standards
- **Presenter Script:**  
  *"What happens if an older standard was cited? Let us check Currentness."*
- **Action:** Click **"Currentness & Amendments"** tab.
- **Presenter Points Out:**  
  *"The system validates that IS 2347:2023 is ACTIVE. It shows that the 2017 fourth revision is SUPERSEDED, and automatically redirects to the 2023 revision. If a standard is withdrawn, NormWise immediately flags it in red and blocks primary recommendation."*
- **Action:** Click **"Allied Standards"** graph tab.
- **Presenter Points Out:**  
  *"A tender is never just one standard. Using PostgreSQL recursive queries without needing Neo4j, NormWise surfaces allied standards: IS 6911 for the raw stainless steel sheet, and IS 7466 for the rubber sealing gasket."*

---

### 3:15 – 3:45 | Deterministic QCO Compliance Evaluation
- **Presenter Script:**  
  *"Next, does the supplier legally require an ISI certification mark?"*
- **Action:** Scroll to **"Statutory Compliance & QCO"** card.
- **Presenter Points Out:**  
  *"Our deterministic rule engine flags: MANDATORY QCO under the DPIIT Domestic Pressure Cookers Quality Control Order 2020. It provides the gazette citation, informing the officer that ISI mark is legally compulsory for this tender."*

---

### 3:45 – 4:30 | Human Review & Immutable Audit Trail
- **Presenter Script:**  
  *"NormWise never makes autonomous procurement decisions. A technical reviewer must independently evaluate and approve."*
- **Action:** Switch to Technical Reviewer account (`reviewer@normwise.gov.in`).
- **Action:** Open the recommendation, check off the verification checklist, and type reviewer note:  
  `"Verified against IS 2347:2023. Tender clause 14 updated to mandate BIS ISI mark."`
- **Action:** Click **"Approve & Finalize"**.
- **Action:** Navigate to **"Audit Trail"**.
- **Presenter Points Out:**  
  *"Every single step is permanently recorded in an immutable PostgreSQL audit log with an actor timestamp and cryptographic SHA-256 integrity hash. Notice that if the original procurement officer attempted to approve their own recommendation, our server returns HTTP 403 Forbidden. Full separation of duties is enforced."*

---

### 4:30 – 5:00 | Closing Value Proposition
- **Presenter Script:**  
  *"To summarize: NormWise gives public procurement officers instant discovery, eliminates obsolete standards, guarantees verbatim clause evidence, maps mandatory QCO compliance, enforces human governance, and protects public expenditure with an immutable audit trail. All built natively on PostgreSQL with pgvector, fully reproducible, and ready for deployment. Thank you, and we welcome your questions."*
