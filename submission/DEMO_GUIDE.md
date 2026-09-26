# Submission: Live Demonstration Guide

**Demonstration Context:** SIH 2024 Evaluator & Technical Jury Walkthrough  
**One-Click Login:** `officer@normwise.gov.in` / Password: `NormWise2026!`  
**Live Access:** `http://localhost:5173`  

---

## 12-Step Evaluator Walkthrough

1. **Login:** Access `/login` $\rightarrow$ Click **"Procurement Officer"** 1-Click Login $\rightarrow$ Submit.
2. **Select Case:** From Dashboard, open **"New Recommendation"** $\rightarrow$ Click **Case 1: Clear Recommendation** (*5L Stainless Steel Pressure Cooker*).
3. **Inspect Attributes:** View real-time extracted attributes (Pressure Cooker, Stainless Steel, 5L, Commercial Canteen).
4. **Run Engine:** Click **"Run Recommendation Engine"** $\rightarrow$ Watch the 1.5s 5-stage analysis pipeline.
5. **Inspect Recommendation:** Review primary standard card (`IS 2347:2023`), Match score (94%), and Trust Badges.
6. **"Why This Standard?":** Expand quantitative score breakdown across Product (0.92), Material (0.90), and Application (0.85).
7. **Currentness:** Verify `CURRENT` status and active Amendment No. 1.
8. **Supporting Evidence:** Click a clause in Supporting Evidence $\rightarrow$ inspect verbatim text in the slide-out Evidence Drawer.
9. **Allied Standards:** View connected material (`IS 6911`) and component (`IS 7466`) standards from the PostgreSQL knowledge graph.
10. **Compliance Assessment:** Verify mandatory ISI certification under the *Domestic Pressure Cookers QCO 2020*.
11. **Human Review:** Click **"Request Review"** $\rightarrow$ open `/review` $\rightarrow$ complete verification checklist $\rightarrow$ click **Accept**.
12. **Audit Trail:** Navigate to `/admin/audit` to view the permanent, immutable PostgreSQL audit event.

---

*For detailed presentation scripts, see [SIH_DEMO_SCRIPT.md](../SIH_DEMO_SCRIPT.md) and [PPT_DEMO_FLOW.md](../PPT_DEMO_FLOW.md).*
