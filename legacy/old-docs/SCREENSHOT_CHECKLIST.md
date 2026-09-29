# NormWise: Submission Screenshot Capture Checklist

**Document Version:** 1.0.0 (SIH 2024 Presentation Reference)  
**Standard of Presentation:** Clean typography, consistent demo data, zero console errors, no private credentials, explicit `Demo Data` indicators.

---

## Required Screenshot Inventory (10 Core Views)

| # | Screen Name | Route / Component | What to Highlight in Screenshot | Verification Criteria |
|---|---|---|---|---|
| **1** | **Procurement Dashboard** | `/dashboard` | System overview, quick action buttons, recent recommendations table, and catalog status. | Clean header, officer persona greeting, zero placeholder text. |
| **2** | **Requirement Input Canvas** | `/new-recommendation` | Textarea with Case 1 selected, language dropdown (`AUTO`), and real-time Extracted Attributes card. | Shows product, material, capacity, and application tags. |
| **3** | **Progressive Analysis Pipeline** | `/analyze` | 5-stage progress indicator animating through Parsing, Retrieval, Currentness, QCO, and Evidence. | All stages active with checkmarks and elapsed time. |
| **4** | **Recommendation Result Canvas** | `/results/:id` | Primary recommendation card (`IS 2347:2023`), Match score badge (94%), Current status (`CURRENT`), trust badges. | Trust badges visible: Evidence-Backed, Currentness Checked, Demo Data. |
| **5** | **"Why This Standard?" Breakdown** | `/results/:id` (WhyThisStandard) | Expanded qualitative breakdown card showing Product (0.92), Material (0.90), Application (0.85) scores. | Clean card styling, progress meters, clear explanatory text. |
| **6** | **Supporting Evidence & Drawer** | `/results/:id` (EvidenceDrawer) | Slide-out Evidence Drawer displaying Clause 4.1 Materials verbatim text and verification badge. | Official BIS gazette citation clearly readable. |
| **7** | **Allied Standards Knowledge Graph** | `/results/:id` (AlliedStandards) | Connected cards for `IS 6911:2017` (Stainless Steel Material) and `IS 7466:1994` (Rubber Gasket Component). | Relationship type pills (`Material`, `Component`) visible. |
| **8** | **Deterministic Compliance Assessment** | `/results/:id` (ComplianceStatusCard) | Mandatory QCO order badge (*Domestic Pressure Cookers QCO 2020*) and Scheme-I ISI Mark mandate. | Clear status indicator (`POTENTIALLY_APPLICABLE`), DPIIT authority. |
| **9** | **Human Compliance Review Queue** | `/review` | Interactive verification checklist, reviewer contextual notes, and Accept / Reject action buttons. | Checkmarks active, reviewer persona displayed (`R. K. Sharma`). |
| **10** | **Statutory Audit Trail** | `/admin/audit` | Chronological audit log table showing recommendation created, compliance evaluated, and acceptance recorded. | Immutable timestamps, actor IDs, and event type tags. |

---

## Capture Guidelines & Best Practices

1. **Resolution & Viewport:** Capture at standard 1920x1080 desktop resolution with 100% browser zoom.
2. **Browser Chrome:** Crop browser address bar and tabs for presentation slides, or keep clean URL bar (`http://localhost:5173/results/...`).
3. **Data Consistency:** Ensure all screenshots across the deck use the identical case (`Case 1: 5L Stainless Steel Pressure Cooker` $\rightarrow$ `IS 2347:2023`).
4. **Trust Badges:** Verify the `Demo Data` indicator appears in screenshots to demonstrate ethical transparency.
