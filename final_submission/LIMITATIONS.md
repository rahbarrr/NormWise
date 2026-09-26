# NormWise: System Boundaries & Operational Limitations

**Purpose:** Transparent disclosure of known technical and operational boundaries for evaluators. NormWise does not claim unconstrained capabilities.

---

## Documented Operational Boundaries

1. **Demonstration Dataset Coverage:**  
   The current demonstration release contains a curated dataset of Indian Standards across 6 core public procurement categories (Kitchenware, Lighting, Piping, Power, Cement, Safety). Queries outside these domains will safely return `NO_MATCH` or `CLARIFICATION_REQUIRED`. Expanding to the complete repository of ~20,000 active Indian Standards requires formal institutional data-sharing agreements with BIS.

2. **Standards Revision Synchronization:**  
   The system reflects standards metadata as of the ingested catalog version (`dataset-v2.1`). Ongoing gazette amendments notified by BIS sectional committees require periodic synchronization.

3. **OCR Processing of Degraded Scans:**  
   While digital PDFs and clean scans parse with high accuracy, heavily degraded, low-resolution (<150 DPI), or handwritten indents may yield incomplete attribute extraction, requiring officer review and manual parameter adjustment in the UI.

4. **Assistive Nature (No Autonomous Legal Certification):**  
   NormWise internal match scores and QCO evaluations are decision-support signals. Statutory and legal responsibility for tender specifications remains with the authorized procurement officer and technical evaluation committee under General Financial Rules (GFR 2017).
