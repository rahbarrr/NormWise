# NormWise SIH 2024: Contingency & Backup Demo Plan

**Purpose:** Rapid recovery procedures during the live Smart India Hackathon final evaluation in case of hardware, network, environment, or projector failures.  
**Guiding Principle:** Always use verified local demonstration fallbacks; **NEVER fake a live result.** When presenting preloaded states, explicitly announce: *"Displaying preloaded demonstration data."*

---

## 1. Fast Failure Recovery Cheat-Sheet

| Failure Scenario | Immediate Symptoms | Recovery Command / Action | Estimated Time |
| :--- | :--- | :--- | :---: |
| **Backend API Down / Stopped** | UI displays *"Network Error"* or red toast on analyze | In terminal: `cd server && npm start` | **5 seconds** |
| **PostgreSQL / pgvector Stopped** | Backend logs show `ECONNREFUSED 5432` | In terminal: `docker compose up -d postgres` | **10 seconds** |
| **Frontend Dev Server Closed** | Browser shows *"Unable to connect"* on 5173 | In terminal: `cd client && npm run dev` | **3 seconds** |
| **Authentication Session Expired** | 401 toast; redirected to login | Click **"Procurement Officer"** quick-login demo pill | **2 seconds** |
| **Document OCR Parsing Timeout** | Upload spinner takes $>15$ seconds on blurry PDF | Click **"Use Sample Specification"** to load pre-parsed indent text | **2 seconds** |
| **Projector / Screen Clipping** | UI elements overflow on low-res projector (1024x768) | Press `Cmd -` (Mac) or `Ctrl -` (Windows) to zoom browser out to 80% | **1 second** |

---

## 2. Contingency Plans by Technical Layer

### A. Zero-Internet / Offline Operation
- **Architecture Invariant:** NormWise has **ZERO runtime external cloud dependencies**.
- Both PostgreSQL 16 + pgvector and Node.js run 100% locally on `localhost`.
- Vector embeddings for the demonstration standards catalog are pre-indexed in the local PostgreSQL database.
- If venue Wi-Fi fails entirely, the demo continues uninterrupted on `localhost:5173`.

### B. Live AI / Embedding Timeout Contingency
- If local machine experiences CPU throttling during dense vector calculation:
  - The hybrid retrieval engine automatically falls back to **Structured Matching + Lexical PostgreSQL FTS**, which execute in $< 15$ milliseconds.
  - Announce: *"The system has utilized structured parameter and lexical full-text matching to identify the standard."*

### C. Live Document OCR Failure Contingency
- If an evaluator hands over a corrupted or unreadable test PDF:
  - The document upload modal safely displays an error: *"Unable to extract legible text from file. Please verify resolution."*
  - Switch to the text input tab and paste the text directly.
  - Announce: *"The scanner resolution was insufficient for OCR text extraction; we have pasted the raw text into our attribute extractor."*

### D. Corrupted Local Database State Contingency
- If test records or migrations become corrupted during aggressive evaluator testing:
  - Run the non-destructive fast seed command:
    ```bash
    cd server
    npm run db:seed
    ```
  - Re-seeds all authoritative standards, relationships, QCO compliance rules, and demo accounts in **3.2 seconds**.

---

## 3. Preloaded Offline Demonstration Walkthrough (Fallback 2)

If the live presentation machine suffers a total hardware crash and the team must present from a secondary laptop:

1. **Preloaded Cached State URL:**  
   Open `http://localhost:5173/recommendations/rec-demo-pc-001` directly in the browser.
2. **Presenter Transparency Statement:**  
   *"Respected evaluators, we are viewing the preloaded demonstration record for Domestic Stainless Steel Pressure Cookers (`IS 2347:2023`), generated and verified on this system."*
3. **Step-Through:**  
   - Inspect the precomputed 92% match score.
   - Expand the **Why This Standard?** drawer.
   - Inspect the verbatim clauses (Clauses 4.1, 7.2, 8.1).
   - Display the **Allied Standards** graph (`IS 6911`, `IS 7466`).
   - Show the **QCO Compliance** card (DPIIT 2020 Order).
   - Show the recorded **Technical Reviewer Decision** and **Audit Log Entry**.

---

## 4. Hardware & Port Verification Pre-Flight Checklist

Perform this 60 seconds before entering the evaluation room:

```bash
# 1. Check PostgreSQL container health
docker compose ps postgres
# Expected: Up (healthy) on 0.0.0.0:5432

# 2. Check Backend Health
curl -s http://localhost:5001/api/health
# Expected: {"status":"UP","services":{"database":"CONNECTED"}}

# 3. Check Frontend Accessibility
curl -s http://localhost:5173 | grep "<title>"
# Expected: <title>NormWise</title>
```
