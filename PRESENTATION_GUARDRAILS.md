# NormWise SIH 2024: Presentation Guardrails & "Do Not Say" Guide

**Mandatory Rule for All Team Presenters:**  
Evaluators at the Grand Finale will aggressively test for technical credibility, exaggerated claims, and legal inaccuracies. Avoid colloquial overclaiming. Always use precise, grounded language.

---

## The "Do Not Say" vs "Say Instead" Matrix

| ❌ DO NOT SAY (Forbidden Claims) | ✅ SAY INSTEAD (Technically Grounded Alternative) | Why This Distinction Matters |
| :--- | :--- | :--- |
| *"It is 100% accurate."* | *"It achieved 88.9% Recall@1 and 94.4% Recall@5 on our preliminary 20-case public procurement evaluation benchmark."* | Evaluators know no retrieval model is 100% accurate; citing measured metrics builds trust. |
| *"It covers all Indian Standards / complete BIS database."* | *"It covers an authorized demonstration catalog across 6 key procurement sectors, designed to scale to the full repository."* | We do not possess licensing rights or full text for all ~20,000 standards. |
| *"AI guarantees the correct standard."* | *"It provides evidence-backed recommendations for standards in the catalog, with human review required for final decision-making."* | "Guarantee" implies legal warranty which public procurement forbids. |
| *"The system automatically approves compliance."* | *"It evaluates deterministic Quality Control Orders (QCO) to inform the human reviewer of statutory certification requirements."* | Compliance evaluation is assistive decision-support, not statutory certification. |
| *"No human is required / fully autonomous."* | *"NormWise follows a strict human-in-the-loop governance model where authorized officers verify and approve all recommendations."* | Public procurement rules (GFR 2017) legally mandate human responsibility. |
| *"It completely eliminates procurement errors."* | *"It substantially reduces the risk of citing obsolete standards or missing mandatory QCOs through automated verification."* | Blanket claims of error elimination are practically unprovable. |
| *"It is officially endorsed or certified by BIS."* | *"It is an independent intelligence engine built to navigate published Bureau of Indian Standards specifications."* | We are an SIH hackathon team, not an official BIS agency. |
| *"It has zero hallucinations."* | *"It uses deterministic template grounding and authoritative candidate retrieval, preventing ungrounded LLM text generation."* | Explains the actual architectural mechanism rather than making a marketing claim. |
| *"This is the official BIS score."* | *"This is NormWise's internal multi-factor matching signal based on product, material, and semantic alignment."* | Scoring is an engineering heuristic, not a government ranking. |
| *"We used Neo4j and MongoDB for graphs and documents."* | *"We unified our entire architecture in PostgreSQL 16 using pgvector for embeddings and recursive CTEs for relationship graphs."* | Highlights architectural elegance, lower maintenance, and strict adherence to the project rules. |

---

## Evaluator Trap Defenses

### Trap 1: *"Can an officer bypass review and issue the tender?"*
- **Defense:** *"No. The system does not connect directly to tender publishing endpoints. All recommendations are stored in `PENDING_REVIEW` state until an authorized reviewer records a decision. Furthermore, our server middleware enforces strict separation of duties, returning HTTP 403 if the authoring officer attempts self-approval."*

### Trap 2: *"What happens when BIS issues an amendment tomorrow?"*
- **Defense:** *"Standards are stored with explicit edition and amendment relational records. When sectional committees notify new amendments, the catalog record is updated, and the currentness engine immediately reflects active amendments."*

### Trap 3: *"Why did you not use an off-the-shelf LLM like ChatGPT?"*
- **Defense:** *"General LLMs hallucinate non-existent standard numbers, invent plausible-sounding clauses, and lack real-time currentness awareness. NormWise couples semantic vector search with deterministic database verification and exact clause extraction to guarantee grounded traceability."*
