# NormWise: Live Presentation Demonstration Script (PPT Demo Flow)

**Presentation Context:** Live 3-5 Minute Evaluator Walkthrough during SIH Final Presentation  
**Target Flow:** 12 Clear, Seamless Sequential Steps  
**Account:** `officer@normwise.gov.in` / Password: `NormWise2026!` (1-Click Login available)  

---

## 12-Step Demonstration Sequence

| Step # | Screen / Route | Evaluator Action | Key Talking Point for Judges |
|---|---|---|---|
| **1** | `/new-recommendation` | Select **Case 1: Clear Recommendation** (*5L Stainless Steel Pressure Cooker*). | *"Procurement officers simply enter the plain language requirement or select an existing tender specification."* |
| **2** | `/new-recommendation` | Point out the real-time **Extracted Attributes** panel. | *"Notice how NormWise instantly extracts product type, AISI 304 material, 5L capacity, and commercial canteen use."* |
| **3** | `/analyze` | Click **"Run Recommendation Engine"**. | *"Watch the 5-stage analysis pipeline complete in under 1.5 seconds: parsing, hybrid retrieval, currentness checking, QCO evaluation, and evidence assembly."* |
| **4** | `/results/:id` | Showcase the **Recommended Standard Card**. | *"Primary recommendation: IS 2347:2023. Notice our verified trust badges: Evidence-Backed, Currentness Checked, and Human Review Required."* |
| **5** | `/results/:id` | Expand **"Why this standard?"**. | *"NormWise is not a black box. We break down the matching signal across Product (0.92), Material (0.90), and Application (0.85)."* |
| **6** | `/results/:id` | Point to the **Current Status & Edition** card. | *"If a tender cites an obsolete standard like IS 2347:2014, NormWise blocks it, promotes the 2023 revision, and injects a safety supersede notice."* |
| **7** | `/results/:id` | Click on a clause in **Supporting Evidence** $\rightarrow$ opens **Evidence Drawer**. | *"Zero AI hallucinations. Every single clause excerpt is verified against official BIS gazettes."* |
| **8** | `/results/:id` | Scroll to **Allied Standards & Knowledge Graph**. | *"A real tender requires companion standards. Our PostgreSQL knowledge graph surfaces IS 6911 for raw stainless steel and IS 7466 for rubber gaskets."* |
| **9** | `/results/:id` | Show **Certification & Compliance Rules**. | *"Our deterministic rule engine confirms that under the Domestic Pressure Cookers QCO 2020, ISI certification is legally mandatory."* |
| **10** | `/results/:id` | Click **"Request Review"** in the action bar. | *"NormWise never auto-approves contracts. The officer forwards the recommendation to the technical review queue."* |
| **11** | `/review` | Open **Human Compliance Review Queue** $\rightarrow$ check off items $\rightarrow$ click **Accept**. | *"The technical reviewer inspects the normative checklist, adds contextual notes, and formally records acceptance."* |
| **12** | `/admin/audit` | Open the **Statutory Audit Trail**. | *"Complete compliance defense. Every action, recommendation, and approval is immutably logged with actor IDs and timestamps for CAG audit."* |

---

## Contingency / Bonus: Demonstrating Uncertainty Handling
- If judges ask: *"What happens if the requirement is incomplete or ambiguous?"*
- **Action:** Select **Case 3: Ambiguous / Missing Specs** (*"Need standard for a pressure cooker."*).
- **Result:** Show that NormWise returns `CLARIFICATION_REQUIRED`, highlights missing parameters, and asks clarifying questions instead of forcing a wrong standard.
