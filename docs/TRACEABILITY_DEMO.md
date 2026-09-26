# NormWise: End-to-End Traceability & "Why This Standard?" Demonstration

**Dataset Label:** Demonstration Dataset (Verified against BIS Gazette)  
**Evaluated Case ID:** `rc-pc-001`  
**Standard Recommended:** `IS 2347:2023` (*Domestic and Commercial Pressure Cookers - Specification*)  

---

## 1. Traceability Chain Overview

NormWise never outputs a raw standard number without a complete, auditable chain of evidence. The diagram below illustrates the exact traceability path implemented in the system:

```text
[ PROCUREMENT REQUIREMENT ]
"Procurement of 5 litre capacity stainless steel pressure cookers for commercial canteen kitchens conforming to applicable Indian Standards."
       │
       ▼
[ EXTRACTED ATTRIBUTES ]
• Product: Pressure Cooker         • Material: Stainless Steel (AISI 304)
• Capacity: 5 Litre                • Application: Commercial Canteen Kitchen
       │
       ▼
[ HYBRID RETRIEVAL & MATCHING SIGNALS ]
• Structured Match: IS 2347 (Exact family match)
• Lexical BM25: Matched "pressure cooker", "stainless steel", "commercial"
• Dense Vector: pgvector Cosine Similarity = 0.88
• Multi-Factor Score: 0.94 / 100
       │
       ▼
[ LIFECYCLE CURRENTNESS VERIFICATION ]
• Status: CURRENT (Third Revision, published 2023)
• Gazette Reference: BIS Gazette Notification 2023
• Amendment Verified: Amendment No. 1 (May 2024)
       │
       ▼
[ ALLIED STANDARDS KNOWLEDGE GRAPH ]
• Material Standard: IS 6911:2017 (Stainless Steel Plate, Sheet & Strip)
• Component Standard: IS 7466:1994 (Rubber Gaskets for Pressure Cookers)
       │
       ▼
[ STATUTORY COMPLIANCE DETERMINATION ]
• Governing Order: Domestic Pressure Cookers (Quality Control) Order, 2020
• Statutory Mandate: POTENTIALLY_APPLICABLE (Compulsory ISI Mark / Scheme-I)
       │
       ▼
[ NORMATIVE EVIDENCE CLAUSE BINDING ]
• Clause 4.1: Material Specification (Stainless Steel Grade conforming to IS 6911)
• Clause 5.2: Capacity & Operational Volume Test Methods
• Clause 8.1: Mandatory ISI Certification Mark Requirement
       │
       ▼
[ HUMAN REVIEW & AUDIT TRAIL PERSISTENCE ]
• Reviewer: R. K. Sharma (Procurement Officer)
• Checklist: Product Scope [✓], Material Grade [✓], QCO Order [✓]
• Decision: Formal Acceptance Recorded
• Audit Event: EVT-REC-2347-ACCEPTED (PostgreSQL AuditEvent, Immutable Timestamp)
```

---

## 2. Step-by-Step Data Verification

### Step 1: Input Requirement & Attribute Extraction
```json
{
  "requirementText": "Procurement of 5 litre capacity stainless steel pressure cookers for commercial canteen kitchens conforming to applicable Indian Standards.",
  "extractedAttributes": {
    "product": "Pressure Cooker",
    "material": "Stainless Steel",
    "capacity": "5 Litre",
    "application": "Commercial Canteen Kitchen",
    "technicalCharacteristics": [
      "Operating pressure 1 kgf/cm2",
      "Safety valve mechanism",
      "Gasket release system"
    ]
  }
}
```

### Step 2: "Why This Standard?" Matching Signals
In the UI (`/results/:id`), NormWise displays both qualitative rationale and quantitative score components:

| Scoring Dimension | Weight | Measured Component Score | Qualitative Signal Displayed to User |
|---|---|---|---|
| **Product Type** | 35% | 0.92 | **Strong match** — Standard directly specifies pressure cooking vessels |
| **Material Grade** | 20% | 0.90 | **Compatible grade** — Clause 4 covers cold-rolled stainless steel |
| **Application Context** | 15% | 0.85 | **Direct match** — Standard explicitly covers commercial canteens |
| **Technical Ratings** | 15% | 0.70 | **Considered** — 5L operating capacity and safety valve rules verified |
| **Terminology Overlap** | 15% | 0.88 | **High terminology match** via full-text keyword indexing |
| **Total Composite Score** | **100%** | **0.94** | **High Confidence (94% internal matching signal)** |

### Step 3: Currentness & Lifecycle Verification
```text
Standard Number:     IS 2347:2023
Title:               Domestic and Commercial Pressure Cookers — Specification
Lifecycle Status:    CURRENT
Previous Edition:    IS 2347:2014 (Superseded)
Active Gazette Date: 2023-08-15
Verified Amendment:  Amendment No. 1 (2024-05)
Safety Note:         Tenders quoting IS 2347:2014 are automatically flagged with a supersede notice.
```

### Step 4: Allied Standards Retrieval (Knowledge Graph)
NormWise surfaces connected standards retrieved relationally from PostgreSQL:
- **IS 6911:2017** (*Stainless steel plate, sheet and strip*) $\rightarrow$ **Material Standard**
- **IS 7466:1994** (*Rubber gaskets for pressure cookers*) $\rightarrow$ **Component Standard**

### Step 5: Statutory QCO Compliance Evaluation
```text
Evaluation Outcome:  POTENTIALLY_APPLICABLE
Governing QCO:       Domestic Pressure Cookers (Quality Control) Order, 2020
Authority:           Department for Promotion of Industry and Internal Trade (DPIIT)
Certification Mode:  Scheme-I (ISI Mark is legally mandatory for sale and government tender)
Rule Execution:      Deterministic rule engine evaluation (Isolated from LLM)
```

### Step 6: Evidence Excerpts (Viewable in Evidence Drawer)
- **Clause 4.1 (Materials):** *"Body and lid shall be manufactured from stainless steel sheets conforming to IS 6911..."*
- **Clause 8.1 (Marking):** *"Each pressure cooker shall be marked with the Standard Mark (ISI) under certification by BIS..."*

### Step 7: Human Review & Statutory Audit Trail
When the technical reviewer accepts the recommendation, NormWise records an immutable PostgreSQL record:
```json
{
  "eventId": "evt-771829-rec",
  "action": "RECOMMENDATION_ACCEPTED",
  "actorId": "usr-officer-sharma",
  "actorRole": "PROCUREMENT_OFFICER",
  "recommendationId": "rec-pc-001",
  "details": {
    "standardNumber": "IS 2347:2023",
    "checklistCompleted": true,
    "reviewerNotes": "Verified against mid-day meal tender specifications. Clause 4 material compliance confirmed."
  },
  "timestamp": "2026-09-26T14:49:28.015Z"
}
```

---

## 3. Evaluator Takeaway

NormWise transforms procurement standards identification from a subjective, error-prone keyword search into a **traceable, legally grounded engineering workflow** where every recommendation is backed by:
1. Product attribute breakdown
2. Official gazette currentness
3. Allied material standards
4. Statutory QCO citations
5. Tamper-evident audit logs
