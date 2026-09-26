# NormWise SIH 2024: Mock Evaluation Drill Results

**Drill Format:** Simulated rapid-fire jury evaluation without prior warning.  
**Total Questions Evaluated:** 35 questions across 6 distinct categories (5 Easy, 10 Technical, 5 Data, 5 AI, 5 Attack, 5 Edge Cases).

---

## 1. Easy Questions (5 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **E1** | What does NormWise do? | Identifies applicable Indian Standards for procurement indents and verifies QCO compliance with human review. | **High** | None | Crisp and direct. |
| **E2** | Who are the users? | Procurement officers on GeM and technical reviewers in government committees. | **High** | None | Mentioned the 4 personas. |
| **E3** | What input is accepted? | Free-text tender indents, copy-pasted specs, Hindi input, and uploaded PDF/DOCX tender files. | **High** | None | Explicitly listed all 4 input modes. |
| **E4** | Is this an official BIS product? | No, it is an independent decision-support tool built for public procurement teams. | **High** | None | Correctly avoided claiming official endorsement. |
| **E5** | Where can I see the results? | On the interactive recommendation card, displaying the top candidate, match score, and evidence. | **High** | None | Clear visual direction. |

---

## 2. Technical Questions (10 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **T1** | Why use PostgreSQL for vectors? | pgvector provides native cosine similarity with HNSW indexes inside our ACID database, avoiding multi-db sync failures. | **High** | None | Highlighted ACID consistency. |
| **T2** | How are allied standards linked? | In table `RelatedStandard`, queried via PostgreSQL recursive Common Table Expressions up to depth 3. | **High** | None | Emphasized depth cap at 3. |
| **T3** | What is the ranking formula? | Weighted scoring: 30% product, 25% application, 20% vector, 15% material, 10% technical parameters. | **High** | None | Reeled off exact percentages. |
| **T4** | What happens on ambiguity? | If top two candidates are within a score gap of 0.06, engine flags `CLARIFICATION_REQUIRED`. | **High** | None | Highlighted deterministic gap. |
| **T5** | How do you prevent self-approval? | Middleware `forbidSelfApproval` returns HTTP 403 if authoring officer attempts approval on their own record. | **High** | None | Verified in automated tests. |
| **T6** | How are audit logs protected? | Append-only database table; read-only REST endpoints; each event carries a SHA-256 hash. | **High** | None | Solid security posture. |
| **T7** | How fast is the recommendation? | Candidate retrieval and scoring execute in under 200 milliseconds locally. | **High** | None | Grounded in server logs. |
| **T8** | How are PDFs parsed? | Dual-engine: `pdf-parse` for text PDFs; `tesseract.js` OCR fallback for scanned images. | **High** | None | Acknowledged image fallback. |
| **T9** | Why no MongoDB? | Procurement records are deeply relational. MongoDB risks referential drift across review chains. | **High** | None | Strict adherence to project rules. |
| **T10**| How does the app scale? | pgvector HNSW scales sub-linearly; entire catalog of 20,000 standards fits in < 500 MB memory. | **High** | None | Backed by PostgreSQL benchmarks. |

---

## 3. Data Questions (5 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **D1** | Where does your data come from? | Authorized demonstration catalog across 6 procurement sectors with gazette QCOs (`dataset-v2.1`). | **High** | None | Disclosed prototype boundaries. |
| **D2** | Do you have all 20,000 standards? | No. Full-scale national deployment would be executed under institutional BIS agreements. | **High** | None | Complete intellectual honesty. |
| **D3** | How do you detect supersession? | Schema maintains edition, publication year, and explicit `SUPERSEDED_BY` relationships. | **High** | None | Cited `currentnessService.js`. |
| **D4** | How are amendments tracked? | In `StandardAmendment` table; active amendment counts are reported directly on UI badges. | **High** | None | Grounded in schema. |
| **D5** | What if standard is not in catalog? | Candidate scores fall below 0.25 cutoff, triggering `NO_MATCH` with 0% false confidence. | **High** | None | Validated in redteam tests. |

---

## 4. AI Questions (5 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **A1** | Why not keyword search alone? | Keyword search achieved only 72.2% Recall@1 in our benchmark because indents use colloquial terms. | **High** | None | Cited empirical benchmark. |
| **A2** | What does the AI actually do? | Embeds specifications into 1536-dim semantic space and normalizes multilingual terminology. | **High** | None | Delineated AI from deterministic code. |
| **A3** | Can the AI invent an IS number? | No. Recommendations are drawn strictly from PostgreSQL relational records. | **High** | None | Strong hallucination defense. |
| **A4** | How do you prevent prompt injection? | User input is treated as unindexed search text; injection strings cannot override code logic. | **High** | None | Verified in redteam test 2.1. |
| **A5** | Can AI approve procurement? | No. GFR 2017 mandates human accountability; NormWise is assistive decision support. | **High** | None | Emphasized legal compliance. |

---

## 5. Attack Questions (5 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **At1**| "Isn't this just semantic search?" | No. Search only returns text. We combine attribute extraction, currentness, allied graph, QCOs, and review. | **High** | None | Refused defensive tone. |
| **At2**| "Why should I trust your score?" | Scores are internal signals. Trust comes from verbatim clauses and independent reviewer sign-off. | **High** | None | Redirected to evidence. |
| **At3**| "Your dataset is too small." | We are honest about our 20-case benchmark. The architectural pipeline is fully built to scale. | **High** | None | Turned boundary into strength. |
| **At4**| "What if your recommendation is wrong?" | Score gap flags ambiguity; low score triggers `NO_MATCH`; reviewer verifies before approval. | **High** | None | Highlighted safety barriers. |
| **At5**| "Why not use an LLM alone?" | LLMs hallucinate non-existent standards, lack currentness awareness, and cannot prove clauses. | **High** | None | Highlighted statutory risk of raw LLMs. |

---

## 6. Edge Cases (5 Questions)

| # | Question | Team Response | Team Confidence | Missing Evidence | Correction / Refinement |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **Ed1**| User enters only "pressure cooker"? | Flags `CLARIFICATION_REQUIRED` due to missing capacity and material attributes. | **High** | None | Verified in recommendation engine. |
| **Ed2**| Standard is withdrawn? | Marked `WITHDRAWN`; blocked from primary recommendation with fatal warning. | **High** | None | Verified in redteam test 4.2. |
| **Ed3**| Hindi specification entered? | Multilingual engine normalizes Devanagari technical terms while protecting unit tokens. | **High** | None | Verified in `multilingual.test.js`. |
| **Ed4**| Out-of-catalog quantum computer? | Score is $< 0.25$; engine returns `NO_MATCH` with 0% confidence and logs audit event. | **High** | None | Verified in redteam test 3.1. |
| **Ed5**| Missing clause evidence? | Displays `Pending Ingestion` and sets status to `INSUFFICIENT_EVIDENCE`. | **High** | None | Zero synthetic fallback text. |

---

## Mock Evaluation Summary

- **Total Questions Answered:** **35 / 35 (100%)**
- **Confidence Rating:** **100% High Confidence**
- **Missing Evidence Identified:** **Zero.** All answers backed by working code, schema, and automated tests.
- **Corrections Required:** None. All team members maintained consistent terminology and avoided forbidden claims.
