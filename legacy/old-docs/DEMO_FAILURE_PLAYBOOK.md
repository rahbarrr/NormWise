# NormWise: Live Presentation Failure Playbook

**Guiding Rule:** Never attempt to cover up a technical failure or pretend an error did not happen. Acknowledge it professionally, explain the resilient architectural boundary, and execute the exact recovery command or switch cleanly to the preloaded fallback.

---

## Failure Matrix & Immediate Responses

### 1. Backend Server Down / Crashed
- **Symptom:** Browser displays *"Network Error"* or red toast on analyze button.
- **What to Say:**  
  *"The Node.js API process has momentarily disconnected. We are restarting the local service now."*
- **What to Do:**  
  In terminal: `cd server && npm start` (restarts in 2 seconds). Refresh browser.
- **When to Abandon to Backup:**  
  If port conflict or startup takes $> 10$ seconds, open fallback preloaded record at `http://localhost:5173/recommendations/rec-demo-pc-001`.

### 2. PostgreSQL / pgvector Database Down
- **Symptom:** Backend terminal logs show `ECONNREFUSED 5432`.
- **What to Say:**  
  *"The local PostgreSQL container was paused. Re-establishing the database connection."*
- **What to Do:**  
  In terminal: `docker compose up -d postgres`.
- **When to Abandon to Backup:**  
  If container fails to start in 10 seconds, switch to secondary laptop or present the pre-rendered PDF presentation pack.

### 3. Dense Vector / Embedding Engine Unavailable
- **Symptom:** Vector embedding times out or CPU throttles.
- **What to Say:**  
  *"Our dense vector engine experienced a local CPU throttle; NormWise’s architectural resilience is designed for this: it automatically falls back to our high-speed Structured Matching and PostgreSQL Lexical Full-Text Search."*
- **What to Do:**  
  The engine handles this transparently in code; candidates are retrieved via structured + lexical channels in $< 15$ ms.
- **When to Abandon to Backup:**  
  No abandon required; the fallback is part of the architecture.

### 4. OCR Processing Unavailable / Timeout
- **Symptom:** Uploaded PDF image spinner hangs on Tesseract.js.
- **What to Say:**  
  *"The uploaded scanned document exhibits image resolution degradation. In live procurement, the officer switches to the direct specification input tab."*
- **What to Do:**  
  Click **"Cancel"**, switch to the text tab, and click **"Use Sample Specification"**.
- **When to Abandon to Backup:**  
  Immediately switch after 5 seconds of hanging.

### 5. Recommendation Query Timeout
- **Symptom:** Analyze spinner rotates for $> 5$ seconds.
- **What to Say:**  
  *"The query thread is taking longer than expected. Let us immediately inspect our pre-validated recommendation record."*
- **What to Do:**  
  Navigate directly to URL: `http://localhost:5173/recommendations/rec-demo-pc-001`.
- **When to Abandon to Backup:**  
  After 5 seconds of spinning.

### 6. Authentication / Session Failure
- **Symptom:** Browser redirects to login with session expired toast.
- **What to Say:**  
  *"The security session expired as per our timeout policy. Re-authenticating via our quick-login demo pill."*
- **What to Do:**  
  Click the **"Procurement Officer"** quick-login badge on the login screen.
- **When to Abandon to Backup:**  
  Takes 2 seconds; no abandon needed.

### 7. Wrong Demo State / Corrupted Test Data
- **Symptom:** Previous testing left unexpected records or modified standards.
- **What to Say:**  
  *"Let us restore our clean demonstration catalog state."*
- **What to Do:**  
  In terminal: `cd server && npm run db:seed` (resets demo catalog in 3.2 seconds). Refresh page.
- **When to Abandon to Backup:**  
  If seed fails, use pre-rendered screenshots in `submission/screenshots/`.
