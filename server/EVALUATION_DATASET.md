# NormWise Real-Case Validation Dataset Specification

**Document Version:** 1.0.0 (Phase 21)  
**Dataset Path:** `server/data/evaluation/real-case/`  
**Dataset Version:** `2026.09`  
**Total Cases:** 20 (19 Verified, 1 Unverified)

---

## 1. Executive Summary & Design Principles

The NormWise Real-Case Validation Dataset provides a ground-truth benchmark for evaluating the recommendation quality, attribute extraction, ambiguity handling, currentness safety, allied standard retrieval, compliance evaluation, and multilingual fidelity of the NormWise AI-powered standards recommendation engine.

### Strict Data Integrity Invariants
1. **Zero Fabricated Standards:** Every expected standard in the dataset exists in the Bureau of Indian Standards (BIS) catalog and is present in NormWise's active PostgreSQL database (`IS 2347:2023`, `IS 10322`, `IS 3854:1997`, `IS 1293:2019`, `IS 374:2019`, `IS 1239:2004`, `IS 4984:2016`, etc.).
2. **Explicit Verification Levels:** Ground truth is strictly segregated into `VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`, and `DEMO_ONLY`. Unverified cases are never treated as ground truth and are excluded from retrieval precision and recall metrics.
3. **No Forced Answers:** Cases with underspecified requirements intentionally lack specific expected standards and instead require `CLARIFICATION_REQUIRED` or `INSUFFICIENT_EVIDENCE`.
4. **No Metric Inflation:** Test cases represent authentic procurement tenders from GeM (Government e-Marketplace), railway tenders, state public works, and commercial canteen specifications.

---

## 2. Directory Structure & Organization

The real-case evaluation dataset is organized into four domain categories:

```text
server/data/evaluation/real-case/
├── pressure-cooker/
│   ├── rc-pc-001.json   (Clear: 5L stainless steel commercial pressure cooker -> IS 2347:2023)
│   ├── rc-pc-002.json   (Ambiguous: "Need standard for a pressure cooker" -> CLARIFICATION_REQUIRED)
│   ├── rc-pc-003.json   (Multiple Standards: IS 2347 primary vs IS 6911 material vs IS 7466 gasket)
│   ├── rc-pc-004.json   (Outdated: Tender citing superseded IS 2347:2014 -> recommends IS 2347:2023)
│   ├── rc-pc-005.json   (Multilingual Hindi: 5 लीटर स्टेनलेस स्टील प्रेशर कुकर -> IS 2347:2023)
│   └── rc-pc-006.json   (Partial Spec: Missing volume capacity -> CLARIFICATION_REQUIRED)
├── lighting/
│   ├── rc-lt-001.json   (Clear: 90W outdoor LED street luminaire IP66 -> IS 10322 (Part 5/Sec 3):2012)
│   ├── rc-lt-002.json   (Ambiguous: "Street light fixture for road" -> CLARIFICATION_REQUIRED)
│   ├── rc-lt-003.json   (Multiple Standards: Luminaire IS 10322 vs controlgear IS 16103 vs LED IS 16102)
│   └── rc-lt-004.json   (Multilingual Marathi: रस्त्यांच्या दिव्यांसाठी 90W एलईडी स्ट्रीट लाइट -> IS 10322)
├── electrical-accessories/
│   ├── rc-ea-001.json   (Clear: 6A/16A modular flush switches -> IS 3854:1997)
│   ├── rc-ea-002.json   (Clear: 3-pin 16A shuttered plugs and sockets -> IS 1293:2019)
│   ├── rc-ea-003.json   (Ambiguous: "Electric switchboard plug" -> CLARIFICATION_REQUIRED)
│   ├── rc-ea-004.json   (Safety Standard: Motorized commercial appliance safety -> IS 302 (Part 1):2024)
│   └── rc-ea-005.json   (Multilingual Bengali: ১৬ অ্যাম্পিয়ার ৩-পিন প্লাগ এবং সকেট -> IS 1293:2019)
└── other-authorized-categories/
    ├── rc-ot-001.json   (Clear: 1200mm electric ceiling fan with regulator -> IS 374:2019)
    ├── rc-ot-002.json   (Outdated: Tender citing withdrawn IS 1239 (Part 2):1992 -> recommends IS 1239 (Part 1):2004)
    ├── rc-ot-003.json   (Clear: HDPE water distribution pipe PE 100 PN 10 -> IS 4984:2016)
    ├── rc-ot-004.json   (No-Match: Cryogenic propellant valve for orbital rocket -> NO_MATCH / INSUFFICIENT_EVIDENCE)
    └── rc-ot-005.json   (Unverified: Solar PV hybrid inverter for agricultural pump -> UNVERIFIED)
```

---

## 3. Case Schema Specification

Every case file conforms to the strict JSON schema:

```json
{
  "caseId": "rc-pc-001",
  "category": "pressure-cooker",
  "requirementText": "Procurement of 5 litre capacity stainless steel pressure cookers for commercial canteen kitchens conforming to applicable Indian Standards.",
  "language": "EN",
  "caseType": "CLEAR",
  "verificationLevel": "VERIFIED",
  "ambiguityLevel": "LOW",
  "datasetVersion": "2026.09",
  "sourceReference": {
    "standardSource": "Bureau of Indian Standards IS 2347:2023 Gazette Notification",
    "currentnessSource": "BIS Active Standards Portal 2024 Directory",
    "relationshipSource": "IS 2347:2023 Clause 4 Normative References (IS 6911 Stainless Steel)",
    "complianceSource": "Quality Control Order (QCO) for Domestic Pressure Cookers S.O. 2020",
    "procurementContext": "State Mid-Day Meal Procurement Tender GeM/2024/B/1892"
  },
  "expectedAttributes": {
    "product": "Pressure Cooker",
    "material": "Stainless Steel",
    "application": "Commercial Canteen Kitchen",
    "capacity": "5 Litre",
    "technicalCharacteristics": ["operating pressure 1 kgf/cm2", "safety valve", "gasket release system"],
    "intendedUse": "Commercial food preparation",
    "relevantTerminology": ["autoclave style pressure vessel", "pressure regulator"]
  },
  "expectedStandards": ["IS 2347:2023"],
  "acceptableAlternatives": ["IS 2347"],
  "expectedCurrentness": "CURRENT",
  "expectedRelationships": [
    { "targetStandard": "IS 6911:2017", "relationshipType": "Material" },
    { "targetStandard": "IS 7466:1994", "relationshipType": "Component" }
  ],
  "expectedComplianceOutcome": "POTENTIALLY_APPLICABLE",
  "expectedEvidenceRequirements": ["SCOPE", "CURRENTNESS", "CERTIFICATION"],
  "notes": "IS 2347 is covered under mandatory BIS ISI mark certification via Domestic Pressure Cooker QCO."
}
```

---

## 4. Verification Levels (Ground-Truth Tiers)

To prevent synthetic score inflation, NormWise defines four discrete verification levels:

| Verification Level | Definition | Inclusion in Precision/Recall | Source Requirement |
|---|---|---|---|
| **`VERIFIED`** | Standard number, title, currentness, and QCO status corroborated directly against BIS gazettes and official publications. | **Yes (Ground Truth)** | Mandatory official BIS source reference. |
| **`PARTIALLY_VERIFIED`** | Primary standard confirmed, but related sub-tier standards or clause amendments pending technical auditor review. | Yes, with notation | Partially cited BIS gazette or tender spec. |
| **`UNVERIFIED`** | Requirements in specialized or emerging domains where the applicable Indian Standard is undetermined or under committee formulation. | **No (Excluded from Recall)** | Marked `UNVERIFIED`; engine must not guess. |
| **`DEMO_ONLY`** | Synthetic or illustrative scenarios used strictly for internal interface testing. | **No** | Labeled as non-production demo data. |

---

## 5. Case Types & Target Behaviors

### Type A: Clear Requirements (e.g. `rc-pc-001`, `rc-lt-001`, `rc-ea-001`, `rc-ot-001`)
- **Structure:** Explicit product + material + application + technical ratings.
- **Engine Expectation:** Produces a high-confidence recommendation (Score > 0.70) with the correct standard at Rank 1.

### Type B: Ambiguous Requirements (e.g. `rc-pc-002`, `rc-lt-002`, `rc-ea-003`)
- **Structure:** Underspecified requirement lacking material, capacity, or rating (e.g., *"Need standard for a pressure cooker."*).
- **Engine Expectation:** Must not guess a specific variant. Must return `CLARIFICATION_REQUIRED` and solicit missing parameters.

### Type C: Multiple-Standard Requirements (e.g. `rc-pc-003`, `rc-lt-003`)
- **Structure:** Requirement specifying product assembly, raw material grades, and subcomponent drivers.
- **Engine Expectation:** Distinguishes the primary product standard (e.g., `IS 10322` luminaire) from allied component standards (`IS 16103` driver, `IS 16102` LED module).

### Type D: Outdated / Superseded Cases (e.g. `rc-pc-004`, `rc-ot-002`)
- **Structure:** Tender citing superseded or withdrawn standards (e.g., `IS 2347:2014` or `IS 1239 (Part 2):1992`).
- **Engine Expectation:** Recommends the active replacement (`IS 2347:2023`, `IS 1239 (Part 1):2004`) while issuing safety alerts preventing obsolete standards from being adopted.

### Type E: No-Match Cases (e.g. `rc-ot-004`)
- **Structure:** Requirements for items outside BIS jurisdiction or beyond the authorized catalog (e.g., *cryogenic orbital rocket valves*).
- **Engine Expectation:** Returns `NO_MATCH` or `INSUFFICIENT_EVIDENCE`. Zero forced matches.

### Type F: Multilingual Cases (e.g. `rc-pc-005`, `rc-lt-004`, `rc-ea-005`)
- **Structure:** Semantic equivalents in Hindi (HI), Marathi (MR), and Bengali (BN).
- **Engine Expectation:** Preserves domain semantics, correctly extracts technical attributes, and matches the same candidate standard as English.

### Type G: Partial Specifications (e.g. `rc-pc-006`)
- **Structure:** Critical parameters missing that prevent deterministic QCO applicability determination.
- **Engine Expectation:** Issues `CLARIFICATION_REQUIRED` rather than generating uncertain compliance claims.

---

## 6. Dataset Limitations & Gaps

1. **Category Coverage:** The 20 real cases concentrate heavily on high-frequency public procurement categories: domestic/commercial pressure cookers, outdoor/indoor LED lighting, modular electrical wiring accessories, electric ceiling fans, and HDPE piping.
2. **Specialized Engineering Gaps:** Niche sectors (aerospace hydraulics, cryogenic engineering, advanced semiconductor packaging) are intentionally marked `UNVERIFIED` or `NO_MATCH` to prevent false confidence.
3. **Continuous Expansion:** New cases are admitted only upon technical review and addition of corroborating BIS Gazette notifications.
