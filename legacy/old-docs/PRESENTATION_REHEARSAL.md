# NormWise SIH 2024: Presentation & Live Demo Rehearsal Log

**Rehearsal Standard:** 3 Consecutive Full-Length Presentation & Demo Runs  
**Target Duration:** Total Presentation 08:30 – 09:30 Minutes (including 4:30 – 5:00 min live demo) + 5 Min Q&A

---

## 1. Demo Rehearsal Runs (3 Consecutive Live Executions)

### Run 1: Baseline Verification Run
- **Measured Duration:** **05:12 Minutes**
- **Failures Encountered:** Zero fatal errors.
- **Confusing / Friction Steps:**
  - Presenter lingered too long on the login screen explaining roles instead of jumping straight into the problem indent.
  - Reviewer checklist toggle had a 2-second visual delay before the "Approve" button state updated.
- **Action Taken / Refinement:**
  - Shortened login narrative to 15 seconds. Use quick-pill demo login.
  - Operator pre-clicks the checklist items while presenter is introducing the review governance model.

### Run 2: Pacing & Interruption Rehearsal
- **Measured Duration:** **04:48 Minutes**
- **Failures Encountered:** Zero errors.
- **Confusing / Friction Steps:**
  - When explaining the allied standards graph, the camera/projector zoom level cut off the edge of the SVG node `IS 7466`.
- **Action Taken / Refinement:**
  - Operator sets browser zoom to 90% in full-screen mode before starting. All graph nodes fit comfortably within the viewport.

### Run 3: Final Polished Demonstration Run
- **Measured Duration:** **04:36 Minutes**
- **Failures Encountered:** **Zero errors.**
- **Confusing Steps:** **None.**
- **Result:** Crisp, punchy, and confident execution. Every screen transition synchronized perfectly with verbal cues.

---

## 2. Complete Presentation Rehearsal Timing (Slide Deck + Live Demo)

| Segment | Allocated Target | Measured Duration | Speaker / Transition |
| :--- | :---: | :---: | :--- |
| **1. Opening & Problem (Slides 1–2)** | 01:00 Min | **00:54 Min** | Presenter: GeM tender challenges, obsolete standards risk, QCO non-compliance. |
| **2. Solution & Core Workflow (Slides 3–4)** | 00:45 Min | **00:41 Min** | Presenter: 12-stage pipeline, assistive decision intelligence, human governance. |
| **3. Architecture Blueprint (Slide 5)** | 00:45 Min | **00:42 Min** | Architect: Decoupled 3-tier stack, pure PostgreSQL 16 + pgvector, zero MongoDB/Neo4j. |
| **4. Live 12-Step Demonstration** | 04:30 Min | **04:36 Min** | Presenter & Operator: Indent entry $\rightarrow$ Extraction $\rightarrow$ Hybrid Match $\rightarrow$ Why This Standard $\rightarrow$ Evidence $\rightarrow$ Currentness $\rightarrow$ Allied Graph $\rightarrow$ QCO $\rightarrow$ Review $\rightarrow$ SHA-256 Audit. |
| **5. Evaluation & Baseline Results (Slide 10)**| 00:45 Min | **00:43 Min** | Evaluation Lead: 20 benchmark cases, Recall@1 (88.9%), MRR (0.903), 0 currentness violations. |
| **6. Feasibility, Risks & Future Scope (Slides 11–12)**| 00:45 Min | **00:40 Min** | Presenter: Containerized Docker deployment, zero external cloud dependency, future GeM API integration. |
| **TOTAL PRESENTATION RUNTIME** | **08:30 – 09:30 Min** | **08:16 Min** | **Leaves full ~6.5 minutes for Jury Q&A within 15-minute evaluation slot.** |

---

## 3. Rehearsal Observations & Final Polish

1. **Screen Resolution:** Browser zoom level 90% is locked as default to ensure the knowledge graph and compliance cards never require awkward horizontal dragging on 1366x768 screens.
2. **Audio Pacing:** Avoid rushing through the "Evidence Inspector" and "Currentness" tabs. Evaluators care deeply about proving non-hallucination and active amendment status.
3. **Transition Cue:** Operator changes tabs strictly on keyword cues:
   - Keyword *"Why this standard"* $\rightarrow$ Operator clicks drawer.
   - Keyword *"Verbatim clauses"* $\rightarrow$ Operator clicks Evidence Inspector tab.
   - Keyword *"Allied standards"* $\rightarrow$ Operator clicks Graph tab.
   - Keyword *"Quality Control Order"* $\rightarrow$ Operator scrolls to Compliance card.
   - Keyword *"Separation of duties"* $\rightarrow$ Operator switches to Technical Reviewer account.
