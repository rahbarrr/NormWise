# NormWise — Document Processing Architecture (Phase 11)

NormWise provides an enterprise-grade document intelligence pipeline that bridges unstructured procurement specifications (PDF and DOCX tender documents) with Indian Standards intelligence.

---

## 1. Supported Formats & Constraints

| Format | Extension | MIME Types | Max Size | Parsing Library |
| :--- | :--- | :--- | :--- | :--- |
| **PDF** | `.pdf` | `application/pdf` | 10 MB | `pdf-parse` (v2.4.x) |
| **Microsoft Word** | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 10 MB | `mammoth` (OpenXML) |

### Strict Validation Rules
- **Extension & MIME Validation:** Rejects executable files, scripts, archives (`.exe`, `.zip`, `.sh`, `.txt`, `.tar.gz`).
- **File Size:** Strictly enforced limit of 10 MB (`10 * 1024 * 1024` bytes).
- **Empty Files:** Files with 0 bytes are immediately rejected with descriptive user-facing errors.
- **Corrupted / Truncated Files:** Caught gracefully with clear retry guidance without exposing internal stack traces.

---

## 2. Upload Flow

The upload interface operates via multipart form submissions:

```
User selects / drops file
         ↓
Client-side validation (Size <= 10MB, Extension in [.pdf, .docx], Non-empty)
         ↓
POST /api/documents/upload (multipart/form-data)
         ↓
Multer Memory Buffer validation
         ↓
Storage Service (Generates safe UUID filename, stores in server/uploads/)
         ↓
PostgreSQL Record created (Document status: UPLOADED)
         ↓
Audit Event logged (DOCUMENT_UPLOADED)
         ↓
Returns Document metadata ({ documentId, filename, originalFilename, fileType, fileSize, processingStatus })
```

---

## 3. Storage Abstraction

To ensure decoupling from underlying physical infrastructure, document persistence is mediated through `storageService.js`:

- **Path:** `server/uploads/` (outside the public web root).
- **Security:**
  - Files are never stored under client-provided raw filenames; random cryptographically safe UUIDs (`uuidv4() + ext`) are assigned.
  - Path traversal protection ensures filenames cannot access parent directories (`..`).
  - No direct static file serving is permitted. Documents are accessed only via authenticated backend endpoints.
- **Database Boundary:**
  - Raw binary files are **never** stored inside PostgreSQL.
  - PostgreSQL stores only metadata (`filename`, `originalFilename`, `fileType`, `fileSize`, `storagePath`, `processingStatus`).

---

## 4. PDF Extraction

- **Library:** `pdf-parse` (v2 class-based interface).
- **Page Extraction:** Extracts page count and individual page text chunks.
- **Grounded Source Citation:** Page text indices are maintained to locate exact clause occurrences for source citations.
- **Error Handling:** Malformed or password-protected PDFs fail gracefully, marking `textExtractionQuality: "LOW"` and invoking the fallback pipeline.

---

## 5. DOCX Extraction

- **Library:** `mammoth` (raw text extractor).
- **Structure:** Parses the OpenXML package structure (`word/document.xml`), extracting paragraphs, list elements, and technical specifications.
- **Page Estimation:** Because DOCX lacks fixed physical pagination, pages are estimated conservatively (~400 words per page), while setting source references to `"Source location unavailable"` when exact pagination cannot be verified.
- **Preview Limitation Notice:** As specified in MVP requirements, DOCX rendering displays: `"Document preview is not available in this MVP."` while allowing text processing to proceed unimpeded.

---

## 6. OCR Fallback & Scanned PDF Detection

### Detection Heuristic
If extracted text has:
- Fewer than 15 words, or
- Ratio of alphanumeric characters to total characters is under 35%, or
- Empty or whitespace-only text streams

The extraction quality is designated as:
```json
{ "textExtractionQuality": "LOW" }
```

### Configurable OCR Execution
- Controlled via environment variable: `OCR_ENABLED=true/false` (default: `false`).
- **Engine:** `tesseract.js` (local OCR engine).
- **Behavior when OCR is Disabled:**
  - Does **not** fabricate extracted text.
  - Marks document status `FAILED`.
  - Returns clear notice: `"Scanned document requires OCR processing."`
- **Behavior when OCR is Enabled:**
  - Executes Tesseract OCR over document pages.
  - Emits telemetry:
    ```json
    {
      "text": "...",
      "extractionMethod": "OCR",
      "confidence": "available"
    }
    ```
  - Numerical confidence is only exposed if the OCR engine actually yields it.

---

## 7. Text Normalization

Managed by `textNormalizationService.js`:
- Normalizes CRLF and CR to LF (`\n`).
- Strips PDF page counter artifacts (e.g. `-- 1 of 1 --`).
- Repairs hyphenated line breaks (`"pres-\nsure"` → `"pressure"`).
- Normalizes unicode whitespace (`\u00A0`, `\u2000` etc.) to standard spaces.
- Collapses redundant whitespace without touching technical tokens.

### Strict Technical Preservation Rule
The normalization service strictly preserves:
- Units and quantities: `"5 litre"`, `"120W"`, `"10kV"`, `"IP66"`, `"1200mm"`.
- Indian Standards numbers: `"IS 2347:2023"`, `"IS 10322 (Part 5/Sec 3):2012"`.
- Technical abbreviations and section clauses: `"Clause 4.2"`, `"Table 1"`.

---

## 8. Requirement Extraction

Executed by `documentRequirementService.js`:
- Uses layered deterministic pattern recognition for core procurement attributes:
  - `product` (e.g. "Pressure Cooker", "LED street light luminaire")
  - `material` (e.g. "Stainless Steel", "Aluminum", "Copper")
  - `capacity` (e.g. "5 litre", "120W", "1200mm")
  - `application` (e.g. "Institutional Kitchen", "Highway street lighting")
  - `technicalCharacteristics` (e.g. `["Pressure cooking equipment"]`)

### Usability Check
If no procurement attributes can be identified from the text:
```json
{
  "hasUsableRequirements": false,
  "product": null,
  "material": null
}
```
The frontend immediately surfaces the `"No usable procurement requirements were identified"` screen.

---

## 9. Ambiguity & Source Reference Handling

### Anti-Hallucination Constraints
- **Source Locations:** Page numbers and text quotations are only cited if directly matched in the parsed text stream. If not verified, the system outputs:
  ```
  "Source location unavailable"
  ```
- **Never Fabricate:** Page numbers, clauses, standard numbers, or material grades are never invented.

### Ambiguity Detector Warnings
The detector flags potential procurement uncertainties:
1. **Missing Application:** `"Intended application is not clearly specified in the document text."`
2. **Missing Product:** `"Primary product classification could not be confidently identified."`
3. **Multiple Materials:** `"Multiple materials referenced in specification (stainless steel, aluminum). Please verify intended primary alloy."`
4. **Unclear Capacity:** `"Nominal capacity or rating could not be confidently identified."`

---

## 10. Human Review & Editing Workflow

Extracted requirements are **never** treated as final procurement decisions automatically.

1. **Review Stage:** The user reviews each attribute (`product`, `material`, `capacity`, `application`, `technicalCharacteristics`).
2. **Interactive Inline Editing:**
   - Any field can be edited or reset back to its original extraction value.
   - Changes trigger `PATCH /api/documents/:id/requirements`, persisting user revisions.
   - Generates an `AuditEvent` with action `REQUIREMENTS_EDITED`.
3. **Ambiguity Resolution:** The user can select among conflicting options or confirm specific operational applications.

---

## 11. Recommendation Engine Integration

Once the user completes review, clicking **"Analyze Requirements"** triggers:
```
POST /api/documents/:id/recommend
```
Pipeline actions:
1. Validates reviewed requirements with Zod.
2. Invokes Phase 10 hybrid recommendation engine (`recommend(requirementText)`).
3. Evaluates active/current standards from PostgreSQL/pgvector.
4. Generates a new `Recommendation` record.
5. Updates `Document.recommendationId` and sets `Document.processingStatus = "COMPLETED"`.
6. Logs `RECOMMENDATION_STARTED` in `AuditEvent`.
7. Returns `{ recommendationId }`.
8. Frontend navigates through `/analyze` to `/results?id=...`.

---

## 12. Security & Privacy Guarantees

- **No Document Leaks in Logs:** Uploaded document contents and full extracted texts are strictly omitted from standard application logs.
- **Path Traversal Guards:** File paths are sanitized to prevent directory traversal outside `server/uploads/`.
- **Zero Shell Execution:** Uploaded files are never passed to shell interpreters or executed as binary binaries.
- **PostgreSQL Isolation:** No MongoDB or external unvetted vector stores are utilized. All metadata and vectors reside in PostgreSQL with Prisma ORM.
