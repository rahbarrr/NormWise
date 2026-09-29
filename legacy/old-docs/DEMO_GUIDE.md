# NormWise SIH Demonstration Guide (Phase 20)

A comprehensive walkthrough guide for presenting **NormWise** to judges, evaluators, and stakeholders at the Smart India Hackathon (SIH).

---

## 🎯 Demonstration Objective

Demonstrate how NormWise transforms complex, unstructured procurement specifications into verified Indian Standards recommendations, with full legal clause justifications, live compliance checks, evidence verification, and dual-officer technical review workflows.

---

## ⏱️ 5-Minute Presentation Schedule

| Elapsed Time | Action | Screen / Step | Key Message |
|---|---|---|---|
| **0:00 - 0:45** | Introduction & Problem Statement | Homepage / Dashboard | Procurement tenders frequently cite outdated or incorrect standards, creating legal vulnerabilities and safety risks. NormWise automates standards intelligence. |
| **0:45 - 2:15** | Demo Case 1: Live Recommendation | `/demo` or `/recommend` | Input: *Stainless steel pressure cooker 5 litre*. Instant hybrid vector retrieval maps to **IS 2347:2023**, flags ISI certification as mandatory under QCO, and retrieves test clauses. |
| **2:15 - 3:15** | Evidence & Compliance Evaluation | `/results/:id` & `/evidence/:id` | Show clause-level breakdown (Clause 5.1 food grade steel, Clause 8 burst test) and why alternatives (IS 14756) were ranked lower. |
| **3:15 - 4:15** | Technical Review & Dual Control | `/review/:id` | Demonstrate technical reviewer workflow: officer cannot approve their own tender; reviewer checks compliance, adds notes, and accepts recommendation. |
| **4:15 - 5:00** | Telemetry, Audit Trail & Multilingual | `/admin/monitoring` & Hindi input | Show live system telemetry, append-only audit trail, and multilingual requirement normalization (Hindi/Marathi to IS specs). |

---

## 📋 The 3 Standard Demonstration Cases

NormWise includes 3 pre-configured, real-world demonstration cases accessible via the **SIH Demo Mode (`/demo`)**:

### Demo Case 1: Domestic / Institutional Pressure Cooker
- **Scenario:** Procurement of commercial pressure cookers for school midday meal programs.
- **Specification:**
  > *"Supply of stainless steel pressure cookers 5 litre capacity for institutional kitchens, body and lid made of AISI 304 food-grade stainless steel, with safety valve, gasket release system, and mandatory ISI certification under DPIIT Quality Control Order."*
- **Expected Primary Standard:** **IS 2347:2023** (*Domestic Pressure Cookers — Specification*)
- **Key Talking Points:**
  - Identifies mandatory ISI mark under DPIIT Domestic Pressure Cookers QCO.
  - Verifies body material conforms to IS 6911 (Stainless steel food contact).
  - Highlights burst pressure testing and safety valve requirements (Clause 8).

### Demo Case 2: Outdoor Municipal LED Street Luminaire
- **Scenario:** Municipal corporation procurement of energy-efficient smart street lighting.
- **Specification:**
  > *"Procurement of 90W outdoor LED street lighting luminaires, CCT 5700K, minimum IP66 ingress protection, surge protection 10kV, LM-79 and LM-80 test reports required, BIS registration under CRS mandatory."*
- **Expected Primary Standard:** **IS 10322 (Part 5/Sec 3):2012** (*Luminaires — Particular Requirements: Luminaires for Road and Street Lighting*)
- **Key Talking Points:**
  - Cross-references safety standard with **IS 16103** (LED modules) and **IS 15885** (AC/DC electronic controlgear).
  - Flags mandatory BIS Compulsory Registration Scheme (CRS) compliance.
  - Generates ready-to-copy GeM bid specification clauses.

### Demo Case 3: Commercial Induction Cooking Range
- **Scenario:** Indian Railways / Defense mess electrification tender.
- **Specification:**
  > *"Commercial induction cooking range 3.5 kW, heavy duty stainless steel body, glass ceramic top, overheating protection, automatic pan detection, electrical safety compliance as per Indian Standards."*
- **Expected Primary Standard:** **IS 302 (Part 1):2024** (*Safety of Household and Similar Electrical Appliances*)
- **Key Talking Points:**
  - Captures electrical insulation resistance and leakage current safety standards.
  - Identifies superseded versions to prevent officers from citing withdrawn 2008 revisions.

---

## 🛠️ Step-by-Step SIH Demo Walkthrough

### Step 1: Login
- Navigate to `/login`.
- Select one-click role: **Procurement Officer** (`officer@normwise.local` / `NormWise2026!`).
- **Narrative:** *"Every action is tied to an authenticated officer identity with strict role-based access control."*

### Step 2: SIH Demo Mode (`/demo`)
- Click **"Demo Mode"** in the top navigation or sidebar.
- Click **"Load & Recommend"** on Case 1 (Stainless Steel Pressure Cooker).
- **Narrative:** *"NormWise takes raw procurement specifications and performs hybrid keyword + vector retrieval against the official BIS catalog."*

### Step 3: Recommendation Results (`/results/:id`)
- Point out:
  - **Match Confidence Score**: 92% match.
  - **Standard Number & Status**: `IS 2347:2023` marked `CURRENT`.
  - **Certification Mandate**: Shows DPIIT QCO requiring mandatory ISI mark.
  - **Alternative Standards Analyzed**: Highlights why `IS 14756` (aluminium cookware) was ranked lower.

### Step 4: Evidence & Clause Traceability (`/evidence/:id`)
- Click **"View Full Evidence"**.
- Point out:
  - Clause 5.1 (Material specifications).
  - Clause 8.2 (Operating pressure & safety release).
  - **Narrative:** *"NormWise never hallucinates standards or numbers; every recommendation is grounded in statutory clauses stored in our PostgreSQL database."*

### Step 5: Request Review
- Click **"Request Technical Review"**.
- Add a procurement note: *"Urgent school kitchen procurement for FY 2026-27."*
- Click **"Submit for Review"**.

### Step 6: Technical Reviewer Sign-Off (`/review/:id`)
- Click **"Switch Account"** (or logout and login as `reviewer@normwise.local` / `NormWise2026!`).
- Navigate to the review screen.
- Verify that **Four-Eyes Principle (Dual Control)** is enforced: the original officer cannot approve their own recommendation.
- As reviewer, check off checklist items, enter approval remarks, and click **"Accept Recommendation"**.

### Step 7: System Monitoring & Telemetry (`/admin/monitoring`)
- Log in as **Administrator** (`admin@normwise.local`).
- Open **"System Monitoring"** from the sidebar.
- Show live telemetry: response latencies, DB status, vector search health, uptime, and request counters.

---

## 💡 Troubleshooting & Presentation Safeguards

| Potential Glitch | Immediate Remediation |
|---|---|
| **Slow Network / LLM Latency** | The recommendation engine has built-in PostgreSQL hybrid scoring that responds in < 100ms even if external LLM APIs are offline. |
| **User Session Expired** | Use the quick demo account credentials listed right on the login screen (`officer@normwise.local` / `NormWise2026!`). |
| **Demo Data Disclaimers** | Every test record is clearly badged with a purple **"Demo Data"** chip, demonstrating transparency and audit readiness. |
