# NormWise Multilingual Input, Translation & Technical Terminology Normalization (Phase 16)

> **Core Principle:**  
> *"Translated text is a search aid. The original procurement requirement remains the source text for traceability."*

---

## 1. Supported Languages

NormWise supports 11 Indian constitutional languages plus English using a strictly controlled language model (`server/src/config/languages.js`). Arbitrary string codes are forbidden throughout the pipeline.

| Code | Language | Script | Supported Operations |
|---|---|---|---|
| `EN` | English | Latin | Full hybrid retrieval, attribute extraction, standard indexing |
| `HI` | Hindi | Devanagari | Script detection, lexicon normalization, hybrid search |
| `MR` | Marathi | Devanagari | Disambiguated Devanagari detection, lexicon normalization, search |
| `BN` | Bengali | Eastern Nagari | Script detection, terminology normalization, search |
| `GU` | Gujarati | Gujarati | Script detection, terminology normalization, search |
| `TA` | Tamil | Tamil | Script detection, terminology normalization, search |
| `TE` | Telugu | Telugu | Script detection, terminology normalization, search |
| `KN` | Kannada | Kannada | Script detection, terminology normalization, search |
| `ML` | Malayalam | Malayalam | Script detection, terminology normalization, search |
| `PA` | Punjabi | Gurmukhi | Script detection, terminology normalization, search |
| `OR` | Odia | Odia | Script detection, terminology normalization, search |
| `UNKNOWN` | Unknown | Mixed/Uncertain | Low-confidence fallback; triggers user clarification |

---

## 2. Multi-Stage Pipeline Architecture

```
Original Requirement (Indian Language / English)
             ↓
[1] Language Detection (Deterministic Unicode Script + Vocabulary Heuristics)
             ↓
[2] Token Protection (IS numbers, units, electrical ratings, abbreviations)
             ↓
[3] Technical Terminology Normalization (Verified DB + In-Memory Lexicon)
             ↓
[4] Connective Translation / Search Representation Generation
             ↓
[5] Token Restoration (Original IS numbers, units, and ratings restored)
             ↓
[6] Requirement Attribute Extraction (Phase 15 Engine)
             ↓
[7] Hybrid Candidate Retrieval (FTS + pgvector)
             ↓
[8] Recommendation Provenance & UI Presentation (Verbatim Original + Search Aid)
```

---

## 3. Language Detection Service

Located at [`server/src/services/languageDetectionService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/languageDetectionService.js).
- Analyzes Unicode code blocks deterministically for Indic scripts.
- **Devanagari Disambiguation:** Differentiates Marathi (`MR`) from Hindi (`HI`) by checking for Marathi-exclusive characters (`ळ` U+0933), grammatical markers (`साठी`, `घरगुती`, `रस्त्यावरील`, `दिव्यांसाठी`, `शेतीच्या`), and vocabulary.
- **Safety Rule:** When script ratio or character count is below confidence thresholds, the service marks `language = UNKNOWN` with `isUncertain: true`. It **never guesses silently**.

---

## 4. Protected Tokens & Integrity Rules

To strictly preserve engineering specifications during search normalization, three categories of tokens are replaced with opaque placeholders prior to translation and restored afterward:

1. **Standard Identifiers:**
   - E.g., `IS 2347:2023`, `IS 10322 (Part 5/Sec 3):2012` → `TOKEN_STANDARD_001`
2. **Units & Engineering Ratings:**
   - E.g., `5 L`, `230 V`, `60 W`, `IP66`, `5 HP`, `1200 mm` → `TOKEN_UNIT_001`
   - *Unit Normalization:* Format variations (e.g. `5 litre`, `5 ltr`, `5 liters`) are normalized to standard SI notation (`5 L`) without cross-dimension physical conversions.
3. **Technical Abbreviations:**
   - E.g., `LED`, `BLDC`, `HDPE`, `ISI`, `CRS`, `SS 304`, `AISI` → `TOKEN_TECH_001`

**Integrity Commitments:**
- Standard numbers, clauses, and ratings are never altered or hallucinated.
- An LLM is never allowed to invent standards or compliance obligations.

---

## 5. Terminology Database & Governance

Located at [`server/src/services/multilingualNormalizationService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/multilingualNormalizationService.js) and backed by Prisma model `StandardTerm`:

- **Database Model:**
  ```prisma
  model StandardTerm {
    id             String   @id @default(uuid())
    term           String
    normalizedTerm String
    language       String   @default("EN")
    termType       String   @default("TECHNICAL") // PRODUCT, MATERIAL, APPLICATION, TECHNICAL, UNIT, ABBREVIATION
    source         String   @default("MANUAL_VERIFIED")
    standardId     String?
    isVerified     Boolean  @default(false)
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt
  }
  ```
- **Administrative Review:**
  Accessible at `/admin/terminology`. Procurement administrators and domain experts can review, approve, reject, or edit submitted terms.
- **Security Constraint:** Only verified terms (`isVerified: true`) participate in high-confidence deterministic normalization. LLMs are prohibited from silently adding unverified terms.

---

## 6. Translation Service & Fallback Behavior

Located at [`server/src/services/translationService.js`](file:///Users/rahbarraza/Downloads/NormWise/server/src/services/translationService.js):
- Generates an English search representation using a deterministic connective lexicon for all 11 languages.
- Optional external translation providers can be configured via environment variables:
  ```env
  TRANSLATION_PROVIDER=
  TRANSLATION_MODEL=
  TRANSLATION_API_KEY=
  ```
- **Fallback Resilience:** If no external provider is configured or if network calls fail, NormWise automatically falls back to deterministic connective translation. The application **never breaks or hangs**.

---

## 7. Multilingual Embeddings & Hybrid Retrieval

NormWise retains the Phase 15 hybrid retrieval architecture:
- Lexical search queries English standard metadata and title tokens using the normalized English search representation.
- Vector search via PostgreSQL `pgvector` embeds the search representation and/or original query using the configured embedding model (`EMBEDDING_MODEL`).
- Standards metadata in the database remains in English; Indian language queries map seamlessly without requiring manual translation of entire standard documents.

---

## 8. Document Processing Integration (Phase 11)

Uploaded procurement specifications (PDF / DOCX):
1. Native text or OCR fallback extraction.
2. Language detection records `detectedLanguage`, `originalLanguage`, and `languageConfidence`.
3. Verbatim extracted text is preserved as source of truth.
4. Multilingual normalization extracts language-neutral procurement attributes.

---

## 9. Recommendation Provenance

Every generated recommendation records:
- `originalText`: Verbatim text entered by the procurement officer.
- `detectedLanguage`: ISO language code.
- `originalLanguage`: Language source tag.
- `normalizedText`: English search representation.
- `normalizationMethod`: E.g. `DETERMINISTIC_LEXICON` or `HYBRID_DB_LEXICON`.
- `translationMethod`: E.g. `DETERMINISTIC_LEXICON`.
- `standardsDatasetVersion`: Active standards catalog snapshot.

---

## 10. Privacy & Security

- Procurement text is processed locally where possible; external translation providers are optional and strictly opt-in.
- Translated text is treated as untrusted user input and sanitized against injection.
- No code execution of translated tokens is allowed.

---

## 11. Known Limitations

1. **Full-Sentence Syntactic Translation:** Without a cloud translation provider, complex compound grammatical sentences rely on connective keyword mapping; however, technical nouns, materials, capacities, and standard IDs are 100% preserved.
2. **Regional Dialect Variants:** Hyper-local colloquial terms require administrative addition to the `StandardTerm` dictionary before high-confidence matching occurs.
