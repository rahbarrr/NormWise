# NormWise: System Limitations & Scope Disclosures

**Document Version:** 1.0.0 (SIH Demonstration Phase 22)  
**System Policy:** Total Transparency & Responsible AI Disclosure

---

## 1. Standards Catalog Coverage Limitations

1. **Curated Demonstration Catalog:** The active PostgreSQL database contains a curated set of **83 Bureau of Indian Standards (BIS)** records.
2. **Category Boundaries:** Ingested standards primarily cover high-frequency public procurement categories:
   - Domestic and Commercial Pressure Cookers (`IS 2347`, `IS 6911`, `IS 7466`)
   - LED Street Lighting Luminaires & Drivers (`IS 10322`, `IS 16102`, `IS 16103`)
   - Low-Voltage Wiring Accessories, Plugs & Sockets (`IS 3854`, `IS 1293`, `IS 302`)
   - Electric Ceiling Fans (`IS 374`)
   - Potable Water Distribution HDPE Piping (`IS 4984`, `IS 1239`)
3. **Specialized Domains Unindexed:** Specialized engineering domains (e.g. nuclear instrumentation, advanced aerospace metallurgy, satellite telemetry) are not indexed in this demonstration database. Requirements for such domains will return `NO_MATCH` or `INSUFFICIENT_EVIDENCE`.

---

## 2. Authorized Data & Official Gazette Availability

1. **Demonstration & Public Data:** Standards ingested in this prototype are derived from public gazette notifications, committee draft releases, and authorized procurement tenders. Full-text copies of copyrighted BIS standard documents are not hosted or distributed.
2. **Amendment Synchronicity:** While active standards reflect current gazette status up to 2024, real-time live synchronization with the BIS Manakonline portal requires official BIS API integration, which is not publicly available.

---

## 3. Currentness Status Tracking Limitations

1. **Gazette Revisions:** Revisions and amendments are tracked relationally. However, when an Indian Standard is recently placed "Under Review" by a sectional committee without an official published gazette notification, the engine may classify it based on the latest gazetted status.
2. **Dual-Use Overlaps:** In rare instances where an older standard is retained concurrently with a newly published revision during a transitional moratorium, human review is required to verify the tender's specified cutoff date.

---

## 4. Document Intelligence & OCR Limitations

1. **Image Quality Thresholds:** Scanned documents processed via `tesseract.js` require at least 200 DPI resolution and legible contrast. Highly degraded photocopies, skewed scans, or handwritten annotations may experience OCR character recognition drops.
2. **Complex Embedded Tables:** While structured text and key-value attributes are parsed accurately, multi-page split tables with nested merged cells require human verification of extracted capacity and rating numbers.

---

## 5. Multilingual NLP Limitations

1. **Supported Languages:** Active evaluation covers English (EN), Hindi (HI), Marathi (MR), and Bengali (BN).
2. **Transliterated Technical Units:** Technical abbreviations written in regional scripts (e.g. "९० वॉट", "आयपी ६६") are normalized via dictionary lookups. Novel dialectal engineering colloquialisms may result in partial attribute matching, though core product retrieval remains robust.
3. **Regional Languages Unindexed:** Other regional languages (e.g. Tamil, Telugu, Kannada, Gujarati, Odia) currently fall back to automatic English translation prior to analysis.

---

## 6. Deterministic Compliance Rule Coverage

1. **QCO Coverage:** The deterministic compliance rule engine currently models active statutory Quality Control Orders for:
   - *Domestic Pressure Cookers (Quality Control) Order, 2020*
   - *Electrical Appliances Safety (Quality Control) Order, 2023*
   - *Plugs and Socket-Outlets (Quality Control) Order, 2021*
2. **Gaps in Unregulated Products:** Products without published central ministry QCO orders are flagged as `NOT_IDENTIFIED` or `REQUIRES_REVIEW`. The system does not guess or extrapolate statutory mandates.

---

## 7. Evaluation Dataset Scope

1. **Sample Size:** The formal evaluation dataset contains **20 real procurement cases** (19 verified, 1 unverified).
2. **Preliminary Nature:** While the measured **88.9% Recall@1** and **94.4% Recall@5** demonstrate high retrieval fidelity across the core catalog, statistical generalization across all 20,000+ Indian Standards requires expanding the benchmark corpus to 500+ verified tenders.

---

## 8. Mandatory Human Verification Policy

1. **Assistance, Not Autonomous Authority:** NormWise is an assistive intelligence tool designed to accelerate standards identification and compliance auditing for public procurement officers.
2. **Statutory Non-Guarantee:** NormWise recommendations do NOT constitute official BIS product certifications, statutory approvals, or legal guarantees. The final procurement specification remains the sole legal responsibility of the procuring authority.
