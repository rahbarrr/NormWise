# NormWise: SIH 2024 Evaluator Demonstration Script

**Target Audience:** Hackathon Evaluators, Government Procurement Officials, Technical Jury  
**Estimated Walkthrough Time:** 5 to 7 Minutes  
**Demo Account:** `officer@normwise.gov.in` (Procurement Officer) / Password: `NormWise2026!`  
**Live URL / Port:** `http://localhost:5173` (Client) | `http://localhost:5001/api` (Backend)

---

## 1. The Core Problem (0:00 - 0:45)

> *"In public procurement across India (GeM, railways, defense, CPWD), government officers must specify the exact Bureau of Indian Standards (BIS) specifications for thousands of tenders. However, officers face critical challenges:*
>
> 1. *Over 20,000 active Indian Standards exist across hundreds of technical committees.*
> 2. *Tenders frequently cite superseded or withdrawn standards (e.g. citing an obsolete 1992 standard), creating legal risk.*
> 3. *Mandatory Quality Control Orders (QCOs) by ministries require ISI marking under penalty of law, but discovering applicable QCOs is complex.*
> 4. *Generic AI tools hallucinate non-existent standard numbers and clauses.*
>
> *NormWise solves this through an AI-powered, evidence-backed recommendation engine built specifically for Indian Standards with strict safety invariants."*

---

## 2. Requirement Input & Multilingual Support (0:45 - 1:45)

**Action in UI:**
1. Navigate to `/login` $\rightarrow$ Click **"Procurement Officer"** 1-Click Fill $\rightarrow$ Click **Login**.
2. From the Dashboard, click **"New Recommendation"** (`/new-recommendation`).
3. Point out the three preset demo cases in the "Try an example" panel:
   - **Case 1 (Clear Match):** *5L Stainless Steel Pressure Cooker for commercial canteens*
   - **Case 2 (Allied Standards):** *90W Outdoor LED Road Lighting Luminaires*
   - **Case 3 (Ambiguous Input):** *Need standard for a pressure cooker.*
4. Select **Case 1: Clear Recommendation**.
5. Show how NormWise extracts structured procurement attributes in real time:
   - **Product:** Pressure Cooker
   - **Material:** Stainless Steel
   - **Capacity:** 5 Litre
   - **Application:** Commercial Canteen Kitchen
6. Mention: *"NormWise also accepts Hindi, Marathi, and Bengali tender specifications and normalizes them automatically."*
7. Click **"Run Recommendation Engine"**.

---

## 3. The 5-Stage Analysis Pipeline (1:45 - 2:15)

**Action in UI:**
- The evaluator observes the progressive 5-stage analysis pipeline (completed in ~1.5s):
  1. *Parsing Procurement Attributes & Terminology*
  2. *Hybrid Candidate Generation (Structured + BM25 Lexical + pgvector Dense Search)*
  3. *Verifying Standard Currentness & Gazette Amendments*
  4. *Deterministic Quality Control Order (QCO) Rule Evaluation*
  5. *Synthesizing Normative Clause Evidence*

---

## 4. Recommendation Canvas (`/results/:id`) (2:15 - 3:45)

**Action in UI:** The `/results/:id` page opens with full diagnostic detail. Point to the key sections:

### A. Recommended Standard Card
- **Primary Recommendation:** `IS 2347:2023` (*Domestic and Commercial Pressure Cookers - Specification*)
- **Status:** `CURRENT` (Third Revision with Amendment No. 1)
- **Match Score:** Internal algorithm matching signal (e.g. 94%).
- **Trust Indicators:**
  - `Evidence-backed recommendation`
  - `Currentness checked`
  - `Human review required`
  - `Demo Data`

### B. "Why this standard?" (Qualitative & Quantitative Breakdown)
- Expand the breakdown:
  - Product match: Strong match (0.92)
  - Material compatibility: Stainless steel AISI 304 match (0.90)
  - Application alignment: Commercial canteen compatible (0.85)
- Point out: *"NormWise clearly explains why a standard was selected based on actual technical attributes, rather than acting as a black box."*

### C. Currentness & Safety Invariants
- Point out the Current Status badge:
  - *"If a tender cites an obsolete standard like IS 2347:2014, NormWise prevents the withdrawn standard from being recommended, identifies the 2023 edition, and attaches a safety supersede notice."*

---

## 5. Allied Standards Knowledge Graph (3:45 - 4:30)

**Action in UI:** Scroll to **Allied Standards & Normative References**.
- Show the connected standards retrieved from the PostgreSQL graph:
  - **IS 6911:2017** (*Stainless steel plate, sheet and strip*) $\rightarrow$ **Material Standard**
  - **IS 7466:1994** (*Rubber gaskets for pressure cookers*) $\rightarrow$ **Component Standard**
- Explain: *"A real procurement tender rarely involves just one standard. NormWise traverses the knowledge graph to identify the raw material standards and subcomponent standards needed for the complete tender specification."*

---

## 6. Deterministic QCO Compliance Engine (4:30 - 5:15)

**Action in UI:** Scroll to **Certification & Compliance Rules Engine Check**.
- Show the compliance card:
  - **Outcome:** `POTENTIALLY_APPLICABLE`
  - **Governing Order:** *Domestic Pressure Cookers (Quality Control) Order, 2020*
  - **Mandatory Scheme:** Scheme-I (ISI Mark)
- Explain: *"Crucially, our compliance engine runs deterministically. The LLM is strictly prohibited from overriding or hallucinating compliance rules. If a QCO mandates ISI certification, NormWise flags it as mandatory statutory compliance."*

---

## 7. Supporting Evidence & Verification Drawer (5:15 - 6:00)

**Action in UI:** Scroll to **Supporting Evidence** $\rightarrow$ Click on an evidence card (e.g. *Clause 4.1 Materials*).
- The **Evidence Drawer** slides out showing:
  - Standard Number and Clause Reference
  - Exact normative text excerpt
  - Verification Status: `Verified against official BIS Gazette`
- Explain: *"Every single claim has traceable evidence. We do not synthesize clauses or invent quotes."*

---

## 8. Human Review, Audit Trail & Decision Persistence (6:00 - 7:00)

**Action in UI:**
1. In the bottom action bar, click **"Request Review"** $\rightarrow$ Enter note: *"Forwarding for technical specification sign-off"*.
2. Open the **Human Compliance Review Queue** (`/review`).
3. Complete the interactive reviewer checklist:
   - [x] Product scope matches requirement
   - [x] Material grade verified (AISI 304)
   - [x] QCO compliance order verified
4. Click **"Accept Recommendation"**.
5. Navigate to **Audit Trail** (`/admin/audit`):
   - Show the immutable, timestamped audit log:
     - `RECOMMENDATION_CREATED`
     - `COMPLIANCE_EVALUATED`
     - `REVIEW_REQUESTED`
     - `RECOMMENDATION_ACCEPTED`

---

## 9. Demonstrating Uncertainty: Case 3 (Bonus 1 Minute)

**Action in UI:**
1. Click **"New Recommendation"** $\rightarrow$ Select **Case 3: Ambiguous / Missing Specs** (*"Need standard for a pressure cooker."*).
2. Click **"Run Recommendation Engine"**.
3. Point out the result:
   - Status: `CLARIFICATION_REQUIRED`
   - Banner: *"More information is needed"*
   - Clarifying questions: *What is the capacity? What material is intended? Is this for domestic or commercial use?*
4. Explain to evaluators:
   - *"NormWise does NOT force a specific standard when evidence is insufficient. It transparently asks the procurement officer for missing parameters. This safety-first approach builds evaluator trust."*

---

## 10. Concluding Value Proposition

> *"NormWise delivers an end-to-end, evidence-backed workflow for Indian public procurement. It replaces hours of manual standards catalog searching with an auditable, currentness-safe, multilingual intelligence system that keeps the human officer firmly in control."*
