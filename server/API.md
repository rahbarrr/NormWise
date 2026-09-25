# NormWise REST API Documentation

NormWise backend is built with **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**.
All endpoints are mounted under `/api`.

---

## 1. System & Health

### `GET /api/health`
- **Purpose**: Verify backend health, PostgreSQL connectivity, and service status.
- **Request Body**: None
- **Response Example**:
```json
{
  "status": "ok",
  "service": "NormWise API",
  "database": "PostgreSQL",
  "orm": "Prisma",
  "version": "1.0.0",
  "timestamp": "2026-09-25T18:43:19.021Z"
}
```

---

## 2. Standards

### `GET /api/standards`
- **Purpose**: Retrieve Indian Standards (IS) catalog with amendment and relationship counts.
- **Query Parameters**:
  - `search` (optional): Filter by standard number or title.
  - `status` (optional): `CURRENT`, `SUPERSEDED`, `WITHDRAWN`, `UNDER_REVIEW`, `UNKNOWN`.
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "9aa8d97a-72fd-423a-b976-16157fa3d969",
      "standardNumber": "IS 2347:2023",
      "title": "Pressure cookers — Specification",
      "edition": "2023",
      "revision": "Seventh Revision",
      "status": "CURRENT",
      "description": "DEMO RECORD: Prescribes requirement for domestic and commercial pressure cookers...",
      "amendments": [
        {
          "id": "c3d1cbaf-cef5-4be3-b0c9-8ecb27346645",
          "amendmentNumber": "Amendment No. 1",
          "date": "2024-03-15T00:00:00.000Z",
          "status": "ACTIVE"
        }
      ],
      "_count": {
        "evidences": 4,
        "recommendationStandards": 1,
        "relatedStandards": 1
      }
    }
  ]
}
```

### `GET /api/standards/:id`
- **Purpose**: Retrieve a standard by its UUID or exact `standardNumber`, including amendments, normative references, and related standards.
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "9aa8d97a-72fd-423a-b976-16157fa3d969",
    "standardNumber": "IS 2347:2023",
    "title": "Pressure cookers — Specification",
    "edition": "2023",
    "revision": "Seventh Revision",
    "status": "CURRENT",
    "amendments": [...],
    "relatedStandards": [...]
  }
}
```

### `POST /api/standards`
- **Purpose**: Create or register a standard in the database.
- **Request Body**:
```json
{
  "standardNumber": "IS 10322 (Part 5/Sec 3):2012",
  "title": "Luminaires - Particular requirements - Luminaires for road and street lighting",
  "edition": "2012",
  "revision": "Reaffirmed 2018",
  "status": "CURRENT",
  "description": "Specification for roadway luminaires"
}
```
- **Response Example** (Status: `201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "d39d2834-4ba7-428f-a13f-f552e34ea367",
    "standardNumber": "IS 10322 (Part 5/Sec 3):2012",
    "title": "Luminaires - Particular requirements - Luminaires for road and street lighting",
    "status": "CURRENT"
  }
}
```

---

## 3. Recommendations

### `GET /api/recommendations`
- **Purpose**: Query paginated recommendation history and enterprise status counters.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search query string across requirement text, product, standard number, or title
  - `status`: Filter by enum (`ACCEPTED`, `PENDING_REVIEW`, `UNDER_TECHNICAL_REVIEW`, `CLARIFICATION_REQUESTED`, `NOT_APPLICABLE`)
  - `savedOnly`: `true` to filter bookmarked recommendations
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "REC-2026-0842",
        "requirementText": "Procurement of 500 units of commercial grade Stainless Steel Pressure Cookers...",
        "product": "Commercial Pressure Cooker",
        "confidence": 96,
        "status": "ACCEPTED",
        "saved": true,
        "recommendationStandards": [...],
        "reviews": [...],
        "_count": { "evidence": 4, "auditEvents": 4 }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    },
    "statistics": {
      "total": 5,
      "accepted": 1,
      "underReview": 1,
      "clarificationRequested": 1
    }
  }
}
```

### `GET /api/recommendations/:id`
- **Purpose**: Retrieve complete recommendation record including recommended standards, evidence citations, reviews, checklists, documents, and chronological audit events.
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "REC-2026-0842",
    "requirementText": "...",
    "product": "Commercial Pressure Cooker",
    "confidence": 96,
    "status": "ACCEPTED",
    "recommendationStandards": [...],
    "evidence": [...],
    "reviews": [...],
    "auditEvents": [...],
    "documents": [...]
  }
}
```

### `POST /api/recommendations`
- **Purpose**: Record a new procurement requirement and generate initial candidate standard match (status starts at `PENDING_REVIEW`).
- **Request Body**:
```json
{
  "requirementText": "Supply of 120W Outdoor LED Street Light Luminaires with IP66 ingress protection",
  "product": "LED Street Light",
  "material": "Die-cast Aluminum",
  "capacity": "120W",
  "application": "Municipal Highway",
  "technicalCharacteristics": "IP66, IK08, 10kV surge protection",
  "confidence": 93
}
```
- **Response Example** (Status: `201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "REC-2026-0843",
    "requirementText": "...",
    "status": "PENDING_REVIEW",
    "confidence": 93,
    "createdAt": "2026-09-25T18:42:41.353Z"
  }
}
```

---

## 4. Decision & Review Endpoints

### `GET /api/recommendations/:id/review`
- **Purpose**: Fetch review notes and checklist for a recommendation.
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "c717ef4b-fbce-47d4-8ed4-c556747bf24f",
    "recommendationId": "REC-2026-0842",
    "status": "ACCEPTED",
    "notes": "Technical verification complete. Grade 304 stainless steel specifications and dual relief valves align with GeM technical schedule.",
    "checklist": [
      { "itemKey": "scope", "label": "Scope & product taxonomy match verified", "completed": true },
      { "itemKey": "material", "label": "Grade 304 stainless steel specification validated", "completed": true }
    ]
  }
}
```

### `PATCH /api/recommendations/:id/review`
- **Purpose**: Update reviewer notes and checklist verification progress.
- **Request Body**:
```json
{
  "notes": "Verified food-grade contact clauses.",
  "checklist": [
    { "itemKey": "scope", "label": "Scope verified", "completed": true },
    { "itemKey": "material", "label": "Material verified", "completed": true }
  ]
}
```

### `POST /api/recommendations/:id/accept`
- **Purpose**: Accept recommendation into tender dossier and append `RECOMMENDATION_ACCEPTED` to audit trail.
- **Request Body**:
```json
{
  "notes": "Accepted for tender specification."
}
```

### `POST /api/recommendations/:id/request-review`
- **Purpose**: Refer recommendation for technical committee review, setting status `UNDER_TECHNICAL_REVIEW` and appending `REVIEW_REQUESTED` audit event.
- **Request Body**:
```json
{
  "reason": "Requesting validation on surge protection ratings for highway environment"
}
```

### `POST /api/recommendations/:id/request-clarification`
- **Purpose**: Request procurement specification clarification from the requisitioning department, setting status `CLARIFICATION_REQUESTED` and appending `CLARIFICATION_REQUESTED` audit event.
- **Request Body**:
```json
{
  "category": "Rating Specification",
  "question": "Please specify whether BEE Star Labeling compliance is required alongside IS 374."
}
```

### `POST /api/recommendations/:id/not-applicable`
- **Purpose**: Determine that no standardized IS norm governs the bespoke or artistic artifact, setting status `NOT_APPLICABLE` and appending `MARKED_NOT_APPLICABLE` audit event.
- **Request Body**:
```json
{
  "reason": "Bespoke Artifact",
  "explanation": "Custom hand-carved heritage artifact exempt from factory product norms."
}
```

---

## 5. Evidence & Traceability

### `GET /api/recommendations/:id/evidence`
- **Purpose**: Retrieve evidence records justifying the standard match.
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "8326b24b-788d-427e-9381-a4ada1a2ec1e",
      "type": "SCOPE",
      "reference": "IS 2347:2023 — Clause 1.1 (Demo Reference)",
      "content": "Demonstration excerpt: Covers domestic and commercial pressure cookers...",
      "source": "BIS Standard Catalog Record (Demo)",
      "status": "Verified"
    }
  ]
}
```

### `POST /api/recommendations/:id/evidence`
- **Purpose**: Register demonstration evidence linked to a recommendation.
- **Request Body**:
```json
{
  "type": "REQUIREMENT",
  "reference": "IS 10322 Clause 7.2",
  "content": "Luminaires for outdoor highway installation shall provide minimum IP65 protection.",
  "source": "Standard Clause Table (Demo)"
}
```

---

## 6. Audit Trail

### `GET /api/recommendations/:id/audit`
- **Purpose**: Retrieve complete chronological audit history for a recommendation sorted newest first (`createdAt: 'desc'`).
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1ed13513-054e-4f56-a3bd-2cb896a17ff3",
      "action": "RECOMMENDATION_ACCEPTED",
      "details": "Recommendation accepted into tender procurement schedule.",
      "createdAt": "2026-09-22T09:45:00.000Z",
      "actor": {
        "name": "R. K. Sharma",
        "role": "PROCUREMENT_OFFICER"
      }
    }
  ]
}
```

---

## 7. Document Intelligence Metadata

### `POST /api/documents`
- **Purpose**: Store uploaded procurement document metadata (PDF/DOCX) for future ingestion. Large files are not stored in PostgreSQL.
- **Request Body**:
```json
{
  "recommendationId": "REC-2026-0842",
  "filename": "Tender_Document_2026.pdf",
  "fileType": "application/pdf",
  "fileSize": 2457600,
  "pageCount": 14,
  "processingStatus": "UPLOADED"
}
```

### `GET /api/documents/:id`
- **Purpose**: Retrieve document processing status and metadata.

### `PATCH /api/documents/:id`
- **Purpose**: Update document processing status (`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`).
