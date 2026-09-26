# NormWise Standards Data Ingestion & Dataset Foundation

> **Legal & Data Integrity Notice:**  
> **NormWise only imports standards information that the project is authorized to use.**  
> The system does not scrape or download restricted Bureau of Indian Standards (BIS) copyrighted documents, does not bypass authentication or paywalls, and does not fabricate standards, clauses, amendments, or regulatory relationships. When full-text authoritative standards are not legally available, the platform functions transparently on metadata, scope descriptors, and authorized demonstration samples.

---

## 1. Supported Input Formats

The ingestion engine processes standards data across three structured formats:

1. **JSON (`.json`)**: Array of standard objects with nested attributes, amendments, and relationship arrays.
2. **CSV (`.csv`)**: Comma-separated tabular rows (headers matching standard fields, e.g. `standardNumber`, `title`, `status`, `sourceName`).
3. **XLSX / XLS (`.xlsx`, `.xls`)**: Multi-column Excel workbooks parsed via SheetJS.

---

## 2. Standard Data Schema

Imported standards map to the PostgreSQL `standards` table managed by Prisma:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique primary key. |
| `standardNumber` | String (Unique) | Canonical standard identifier (e.g. `IS 2347:2023`). |
| `title` | String | Full title of the standard. |
| `shortTitle` | String (Nullable) | Brief or abbreviated display title. |
| `edition` | String (Nullable) | Edition tag (e.g. `Third Edition`). |
| `revision` | String (Nullable) | Revision number or year. |
| `publicationDate` | DateTime (Nullable) | Official publication or reaffirmation date. |
| `status` | StandardStatus | Currentness enum: `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, `UNKNOWN`. |
| `category` | String (Nullable) | Product / domain category. |
| `technicalDomain` | String (Nullable) | BIS Sectional Committee or technical domain (e.g., MED 12). |
| `scope` | Text (Nullable) | Scope clause of the standard. |
| `sourceName` | String | Originating dataset or publisher name. |
| `sourceReference` | String (Nullable) | Gazette reference, catalog ID, or authorized citation. |
| `sourceUrl` | String (Nullable) | Official portal link if publicly accessible. |
| `isDemo` | Boolean | `false` for imported real datasets; `true` for demonstration seed records. |
| `datasetVersion` | String (Nullable) | Dataset release version (e.g. `2026.09`). |
| `importJobId` | String (Nullable) | Foreign key to `data_import_jobs.id`. |

---

## 3. Standard Identifier Normalization

Different source catalogs format Indian Standards inconsistently:
- `IS 2347:2023`
- `IS-2347:2023`
- `IS2347:2023`
- `IS 10322 (Part 5/Sec 3):2012`
- `IS 10322 Part 5 Sec 3:2012`

`standardNormalizationService.js` performs deterministic identifier normalization:
- **Canonical Identifier**: Uniformly formatted string (`IS 2347:2023`, `IS 10322 (Part 5/Sec 3):2012`).
- **Search Key**: Punctuation-stripped alphanumeric key (`IS23472023`, `IS10322P5S32012`) for collision-free search.
- **Parts & Sections Preservation**: Sub-parts and sections are never collapsed together (`Part 5/Sec 3` is kept distinct from `Part 5/Sec 5`).

---

## 4. Status Normalization & Mapping

Source catalogs use disparate terms to indicate lifecycle status. NormWise maps them deterministically:

| Source Phrase | NormWise Enum | Legal Recommendation Behavior |
| :--- | :--- | :--- |
| `Current`, `Active`, `Published`, `In Force` | `CURRENT` | Eligible as primary recommendation. |
| `Superseded`, `Replaced` | `SUPERSEDED` | Deprioritized (30% penalty); successor cited. |
| `Withdrawn`, `Cancelled`, `Revoked` | `WITHDRAWN` | Disqualified from primary recommendation. |
| `Under revision`, `Draft` | `UNDER_REVIEW` | Eligible with technical committee notice. |
| *Unrecognized phrase* | `UNKNOWN` | Flagged as unverified; human review required. |

---

## 5. Duplicate & Conflict Handling

- **Null-Field Protection**: When updating an existing standard, incoming empty or null values never overwrite existing verified fields in PostgreSQL.
- **Conflict Detection**: If an incoming source specifies a conflicting status or title against an existing database standard, the status is safely transitioned to `UNDER_REVIEW` and the divergence is logged for audit rather than silently overwritten.

---

## 6. Audit Logging & Dataset Versioning

Every dataset import creates an immutable `DataImportJob` audit record:
- Records read, created, updated, skipped, failed.
- Quality error summary and staging records in `imported_standard_records`.
- Linked dataset version (e.g., `2026.09`) stamped on `Recommendation.standardsDatasetVersion`.

---

## 7. Command-Line Interface (CLI)

The ingestion pipeline can be run from the terminal:

```bash
# Execute dry-run to preview changes without modifying PostgreSQL:
npm run import:standards -- data/fixtures/standards_sample.csv --dry-run

# Execute real import with custom provenance metadata:
npm run import:standards -- data/fixtures/standards_sample.csv --source "Authorized Catalog" --version "2026.09"
```

---

## 8. Protected Admin API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Summary counts of standards, statuses, and demo split. |
| `GET` | `/api/admin/imports` | Paginated history of import jobs. |
| `GET` | `/api/admin/imports/:id/report` | Detailed audit report with staging records. |
| `POST` | `/api/admin/standards/validate` | Validates file structure without database mutation. |
| `POST` | `/api/admin/standards/import` | Uploads and processes dataset file (supports dryRun). |

*Protected in development mode via `x-admin-key: dev-admin-secret`.*
