# NormWise Recommendation REST API

## Endpoints

### 1. `POST /api/recommend`
Evaluate a procurement specification and retrieve standard recommendations.

**Request Body:**
```json
{
  "requirementText": "Stainless steel pressure cooker, 5 litre capacity with dual safety valve",
  "language": "en"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "rec-uuid",
    "requirementText": "...",
    "status": "RECOMMENDED",
    "confidence": 92,
    "primaryStandard": {
      "standardNumber": "IS 2347:2023",
      "title": "Domestic Pressure Cookers - Specification",
      "matchScore": 0.94,
      "reasons": ["Direct product match: Pressure Cooker", "Material verified: Stainless Steel"]
    },
    "alternativeStandards": [],
    "evidence": [],
    "currentness": {
      "status": "CURRENT",
      "isCurrent": true
    },
    "certification": {
      "isMandatory": true,
      "scheme": "ISI Mark (Scheme I)"
    }
  }
}
```

### 2. `GET /api/recommendations/:id`
Fetch details of a previously evaluated recommendation.

### 3. `POST /api/recommendations/:id/review`
Submit a human review decision (`ACCEPTED`, `UNDER_TECHNICAL_REVIEW`, `CLARIFICATION_REQUESTED`, `NOT_APPLICABLE`).
