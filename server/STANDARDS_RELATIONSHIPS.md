# NormWise — Allied Standards & Knowledge Relationships

## Overview & Architecture

NormWise provides an intelligent relationship layer connecting primary Indian Standards (IS) with their allied standards (Normative References, Component specifications, Test Methods, Safety guidelines, Installation manuals, Material specifications, etc.).

> **Architecture Note:**
> PostgreSQL is the current MVP relationship store. A dedicated graph database is not required for the MVP.
> The service layer is decoupled from direct database drivers so that a future migration to Neo4j or another graph engine can occur without changing the frontend or API contracts.

```
Frontend (React + Vite + Tailwind)
   ↓
Relationship API (/api/standards/:id/related, /api/standards/:id/graph)
   ↓
standardRelationshipService (Business logic, cycle detection, depth limits)
   ↓
Prisma ORM
   ↓
PostgreSQL (RelatedStandard table with indexed directional edges)
```

---

## 1. Relationship Model

The schema uses a dedicated join table with typed, directional edges:

```prisma
enum RelationshipType {
  NORMATIVE_REFERENCE
  TERMINOLOGY
  TEST_METHOD
  SAFETY
  INSTALLATION
  EQUIVALENT
  SUPERSEDED_BY
  AMENDED_BY
  MANDATORY_UNDER
  APPLIES_TO
  COMPONENT
  MATERIAL
}

model RelatedStandard {
  id                String           @id @default(uuid())
  standardId        String
  relatedStandardId String
  relationshipType  RelationshipType
  evidenceId        String?
  notes             String?
  status            String           @default("DEMO")
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  standard        Standard  @relation("StandardSource", fields: [standardId], references: [id], onDelete: Cascade)
  relatedStandard Standard  @relation("StandardTarget", fields: [relatedStandardId], references: [id], onDelete: Cascade)
  evidence        Evidence? @relation(fields: [evidenceId], references: [id], onDelete: SetNull)

  @@unique([standardId, relatedStandardId, relationshipType])
  @@index([standardId])
  @@index([relatedStandardId])
  @@index([relationshipType])
}
```

### Constraints & Integrity
1. **Self-Reference Prevention:** `standardId === relatedStandardId` is strictly rejected at the service and controller layer with a 400 Bad Request error.
2. **Duplicate Prevention:** A compound unique index `@@unique([standardId, relatedStandardId, relationshipType])` prevents duplicate relationships between identical standards with the same type.
3. **Foreign Key Integrity:** Cascading deletes ensure consistency when removing a standard; evidence deletion sets `evidenceId` to null.
4. **Indexed Queries:** High performance `B-Tree` indexes on `standardId`, `relatedStandardId`, and `relationshipType`.

---

## 2. Relationship Types & MVP Presentation Priority

NormWise enforces a deterministic ordering for UI grouping and presentation:

| Priority | Relationship Type | Meaning / Context |
| :--- | :--- | :--- |
| 1 | `NORMATIVE_REFERENCE` | Mandatory reference cited normatively in the standard text |
| 2 | `TEST_METHOD` | Prescribed laboratory or factory test procedure (e.g. pressure burst, lumen maintenance) |
| 3 | `SAFETY` | Safety standard or requirements essential for compliance |
| 4 | `COMPONENT` | Specific sub-component standard (e.g. gasket, safety valve, LED chip, capacitor) |
| 5 | `INSTALLATION` | Installation, mounting, or commissioning standard |
| 6 | `MATERIAL` | Raw material specification (e.g. stainless steel grade, aluminum alloy) |
| 7 | `MANDATORY_UNDER` | Legal or regulatory mandate linkage (e.g. QCO Order) |
| 8 | `APPLIES_TO` | Product category or domain scope |
| 9 | `EQUIVALENT` | Technically equivalent or harmonized ISO/IEC standard |
| 10 | `SUPERSEDED_BY` | Version succession |
| 11 | `AMENDED_BY` | Specific amendment |
| 12 | `TERMINOLOGY` | Glossary, definition of terms |

> **Important:** This ordering is strictly a UI presentation convenience for the MVP. It does not reflect an official BIS legal priority ranking.

---

## 3. Relationship Directionality

Relationships are directional:

```
[Standard A] ── relationshipType ──> [Standard B]
```

- **Outgoing Relationships:** Relationships where the requested standard is the subject (`standardId = standard.id`).
  *Example:* `IS 2347:2023 ── TEST_METHOD ──> IS 2:2022`
- **Incoming Relationships:** Relationships where the requested standard is referenced by another standard (`relatedStandardId = standard.id`).
  *Example:* `IS 5522:2014 ── MATERIAL ──> IS 2347:2023`

The API returns directional indicators (`direction: "outgoing" | "incoming"`) and formatted human-readable labels:
- Outgoing: `"IS 2347:2023 citations: IS 2:2022"`
- Incoming: `"Cited by IS 2347:2023"`

---

## 4. API Endpoints

### 4.1 Get Related Standards
`GET /api/standards/:id/related`

**Query Parameters:**
- `type` (optional): Filter by `RelationshipType` enum (e.g. `?type=TEST_METHOD`)
- `direction` (optional): `"both"` (default), `"outgoing"`, or `"incoming"`

**Response:**
```json
{
  "success": true,
  "standard": {
    "id": "std-2347",
    "standardNumber": "IS 2347:2023",
    "title": "Domestic Pressure Cookers — Specification",
    "currentness": "CURRENT"
  },
  "total": 5,
  "relationships": [
    {
      "id": "rel-01",
      "direction": "outgoing",
      "relationshipType": "TEST_METHOD",
      "notes": "Demo relationship — verify against authoritative BIS source.",
      "isDemo": true,
      "relatedStandard": {
        "id": "std-is2",
        "standardNumber": "IS 2:2022",
        "title": "Rules for rounding off numerical values",
        "currentness": "CURRENT",
        "statusBadge": "CURRENT"
      },
      "evidence": null
    }
  ]
}
```

### 4.2 Get Knowledge Graph
`GET /api/standards/:id/graph`

**Query Parameters:**
- `depth` (integer, default `1`, max capped at `3`): Graph traversal depth.

**Response:**
```json
{
  "success": true,
  "rootId": "std-2347",
  "depth": 1,
  "nodes": [
    {
      "id": "std-2347",
      "standardNumber": "IS 2347:2023",
      "title": "Domestic Pressure Cookers — Specification",
      "status": "CURRENT",
      "isRoot": true,
      "level": 0
    },
    {
      "id": "std-is2",
      "standardNumber": "IS 2:2022",
      "title": "Rules for rounding off numerical values",
      "status": "CURRENT",
      "isRoot": false,
      "level": 1
    }
  ],
  "edges": [
    {
      "id": "rel-01",
      "source": "std-2347",
      "target": "std-is2",
      "relationshipType": "TEST_METHOD",
      "notes": "Demo relationship — verify against authoritative BIS source.",
      "evidenceId": null
    }
  ],
  "meta": {
    "totalNodes": 6,
    "totalEdges": 5,
    "maxDepthEnforced": 3
  }
}
```

### 4.3 Administrative Relationship Management
Protected endpoints:
- `POST /api/standards/:id/related` — Create a relationship with validation.
- `PATCH /api/standards/:id/related/:relationshipId` — Update notes, status, or type.
- `DELETE /api/standards/:id/related/:relationshipId` — Remove a relationship edge.

---

## 5. Graph Traversal & Depth Control

To ensure fast query times and protect against exponential BFS fan-out:
- Depth parameter is clamped between `1` and `3`: `Math.min(3, Math.max(1, depth))`.
- Requests specifying `depth > 3` are rejected or capped at `3`.
- Visited standard IDs are tracked in a `Set` to prevent circular edge infinite loops.
- Level-by-level breadth-first search ensures controlled data volume.

---

## 6. Currentness & Warning Badges

When related standards are loaded:
- Each node displays its `currentness` status (`CURRENT`, `AMENDED`, `REVISED`, `SUPERSEDED`, `WITHDRAWN`, `UNKNOWN`).
- For `SUPERSEDED` or `WITHDRAWN` standards, a warning badge is highlighted (`Superseded / Withdrawn — review current applicable version`).
- **Data Integrity Rule:** NormWise does NOT automatically hallucinate a replacement standard unless an explicit verified `SUPERSEDED_BY` edge exists in the database.

---

## 7. Evidence Linkage

- If `evidenceId` exists, the relationship edge displays an `"Evidence available"` badge with direct click-through to open the Evidence Drawer / Traceability view.
- If `evidenceId` is absent: `"Relationship source not available in demo dataset"`.
- **Zero Fabrication Rule:** No fake BIS clauses, fake Gazette citations, or fake quotations are fabricated.

---

## 8. Demo Data Limitations & Boundary Notice

> [!WARNING]
> **Demo relationships must not be interpreted as authoritative BIS relationship data.**
> Seeded relationships (such as those connecting `IS 2347:2023` to `IS 5522`, `IS 6911`, `IS 15997`, `IS 7466`, and `IS 2:2022`) are included solely to demonstrate the knowledge graph UI and API traversal. In production environments, relationships must be populated via verified BIS Gazette notifications, sectional committee documentation, or certified standard bibliographies.

---

## 9. Future Migration to Neo4j / Graph Database

When repository volume expands beyond tens of thousands of standards and complex multi-hop pathfinding is required:
1. The `standardRelationshipService` interface (`getRelatedStandards`, `getRelationshipGraph`) remains unchanged.
2. A graph adapter (e.g. `neo4jGraphAdapter.js` with Cypher queries) will replace the recursive SQL / Prisma calls.
3. The REST API routes and React frontend components require zero modifications.
