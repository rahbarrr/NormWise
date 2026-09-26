# NormWise — Certification & QCO Compliance Rules Engine

## Purpose & Scope

The NormWise Certification & Compliance Rules Engine provides deterministic, evidence-linked decision support regarding statutory certification mandates and Quality Control Orders (QCOs) under the Bureau of Indian Standards Act, 2016.

> **Legal Disclaimer:**
> The compliance engine provides structured decision support. It does not replace legal, regulatory, procurement, or technical review.
> All regulatory rules currently in the environment represent a curated demonstration dataset.

---

## 1. Core Architectural Principle

The system answers a strictly bounded question:

> *"Based on the standards and regulatory rules available in the current dataset, is there a potentially applicable certification/compliance requirement?"*

The system **never** outputs unconditional claims such as `"This product is legally mandatory to be certified"` unless authoritative, verified statutory evidence exists in the repository. Instead, it computes controlled categorical outcomes:

| Outcome | Meaning | Presentation Treatment |
| :--- | :--- | :--- |
| `POTENTIALLY_APPLICABLE` | Active rule matched requirement attributes and standard citations | Amber / Warning badge |
| `NOT_IDENTIFIED` | No active mandatory QCO or certification rule matched in dataset | Gray / Neutral badge |
| `REQUIRES_REVIEW` | Missing source reference, date ambiguity, or conflicting rules detected | Amber badge + Human review |
| `INSUFFICIENT_EVIDENCE`| Essential product attributes (e.g. product identity, standard number) are missing | Amber / Slate badge + Edit action |
| `UNKNOWN` | Status cannot be determined from available data records | Slate badge |

---

## 2. End-to-End Pipeline

```
Requirement Text / Extracted Attributes
    ↓
Primary Recommended Standard (IS 2347:2023)
    ↓
Standard Currentness Validation (CURRENT, AMENDED, etc.)
    ↓
Relationship / Allied Standards (Normative, Material, Safety)
    ↓
Deterministic Compliance Rules Engine
    ├─ Completeness Check (Missing attribute detection)
    ├─ Effective Date Evaluation (effectiveFrom <= now <= effectiveTo)
    ├─ Condition Operator Matching (EQUALS, CONTAINS, MATCHES, IN, NOT_EQUALS)
    └─ Conflict & Priority Resolution
    ↓
Evidence Linkage (Conformity Assessment Scheme, Gazette citation)
    ↓
Compliance Evaluation Result
    ↓
Human Review & Audit Event Logging (COMPLIANCE_EVALUATED, COMPLIANCE_VERIFIED)
```

---

## 3. Database Schema

The compliance models are implemented in PostgreSQL via Prisma:

```prisma
enum RuleStatus {
  ACTIVE
  INACTIVE
  UNKNOWN
}

enum ComplianceOutcome {
  POTENTIALLY_APPLICABLE
  NOT_IDENTIFIED
  REQUIRES_REVIEW
  INSUFFICIENT_EVIDENCE
  UNKNOWN
}

enum ComplianceConditionOperator {
  EQUALS
  CONTAINS
  MATCHES
  IN
  NOT_EQUALS
}

model ComplianceRule {
  id              String            @id @default(uuid())
  name            String
  description     String?           @db.Text
  standardId      String?
  productCategory String?
  applicability   String?
  outcome         ComplianceOutcome @default(POTENTIALLY_APPLICABLE)
  authority       String            @default("BIS / Regulatory Authority")
  sourceReference String            @default("Gazette / QCO Notification Reference")
  effectiveFrom   DateTime?
  effectiveTo     DateTime?
  status          RuleStatus        @default(ACTIVE)
  notes           String?           @db.Text
  isDemo          Boolean           @default(true)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  standard    Standard?              @relation(fields: [standardId], references: [id], onDelete: SetNull)
  conditions  ComplianceCondition[]
  evidences   ComplianceEvidence[]
  evaluations ComplianceEvaluation[]

  @@map("compliance_rules")
}

model ComplianceCondition {
  id               String                      @id @default(uuid())
  complianceRuleId String
  field            String
  operator         ComplianceConditionOperator @default(CONTAINS)
  value            String
  createdAt        DateTime                    @default(now())

  complianceRule ComplianceRule @relation(fields: [complianceRuleId], references: [id], onDelete: Cascade)

  @@map("compliance_conditions")
}

model ComplianceEvidence {
  id               String    @id @default(uuid())
  complianceRuleId String
  evidenceId       String?
  sourceTitle      String
  sourceReference  String
  effectiveDate    DateTime?
  notes            String?   @db.Text
  createdAt        DateTime  @default(now())

  complianceRule ComplianceRule @relation(fields: [complianceRuleId], references: [id], onDelete: Cascade)
  evidence       Evidence?      @relation(fields: [evidenceId], references: [id], onDelete: SetNull)

  @@map("compliance_evidence")
}

model ComplianceEvaluation {
  id                  String            @id @default(uuid())
  recommendationId    String
  complianceRuleId    String?
  outcome             ComplianceOutcome @default(POTENTIALLY_APPLICABLE)
  matchedConditions   Json?
  explanation         String            @db.Text
  evidenceId          String?
  requiresHumanReview Boolean           @default(true)
  missingAttributes   String[]          @default([])
  evaluatedAt         DateTime          @default(now())

  recommendation Recommendation  @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  complianceRule ComplianceRule? @relation(fields: [complianceRuleId], references: [id], onDelete: SetNull)
  evidence       Evidence?       @relation(fields: [evidenceId], references: [id], onDelete: SetNull)

  @@map("compliance_evaluations")
}
```

---

## 4. Controlled Condition Language

To prevent arbitrary script execution and ensure complete predictability, conditions use a strictly enumerated field and operator set:

### Allowed Fields
- `product`
- `productCategory`
- `material`
- `application`
- `capacity`
- `standardNumber`
- `standardStatus`
- `certificationScheme`
- `regulatoryCategory`

### Allowed Operators
- `EQUALS` — Case-insensitive exact string match.
- `NOT_EQUALS` — Case-insensitive inequality.
- `CONTAINS` — Substring presence check.
- `MATCHES` — Case-insensitive regular expression pattern match.
- `IN` — Comma-delimited list inclusion check.

Any attempt to specify arbitrary fields or operators throws an immediate validation exception. No database rule can execute arbitrary JavaScript.

---

## 5. Effective Date & Validity Handling

- Rules specify `effectiveFrom` and optional `effectiveTo` timestamps.
- Rules whose `effectiveFrom` lies in the future are discarded during evaluation.
- Rules whose `effectiveTo` lies in the past (expired orders) are discarded during evaluation.
- If a rule's source reference is empty or missing, the engine automatically sets outcome to `REQUIRES_REVIEW` and flags `requiresHumanReview: true`.

---

## 6. Conflict Resolution & Human Review

If a product requirement matches multiple active rules with divergent outcomes (e.g., Rule A indicates `POTENTIALLY_APPLICABLE` and Rule B indicates `NOT_IDENTIFIED` or exempt):
- The engine **never** silently guesses or uses arbitrary probabilities.
- It returns `outcome: "REQUIRES_REVIEW"`.
- It sets `requiresHumanReview: true`.
- It records an explanation: `"Multiple applicable rules with conflicting compliance outcomes matched the requirement. Human verification is required."`

---

## 7. LLM Boundary & Non-Hallucination Guarantee

1. **Deterministic Rule Supremacy:** An LLM may assist with requirement extraction or text normalization, but **never** determines legal or regulatory compliance.
2. **Zero Fabrication Policy:** No BIS Gazette numbers, Ministry circular numbers, clause quotations, or certification dates are generated by the model.
3. **Data Boundary:** All evaluated rules are explicitly tagged `isDemo: true` and display persistent notices to verify against current Gazette publications.

---

## 8. API Endpoints

- `GET /api/compliance/rules` — Lists all active compliance rules and conditions.
- `GET /api/compliance/rules/:id` — Retrieves detailed rule definition with evidence links.
- `POST /api/compliance/evaluate` — Evaluates compliance for given product attributes and standard context.
- `GET /api/recommendations/:id/compliance` — Retrieves or computes compliance evaluation for a specific recommendation.

---

## 9. Audit Logging

Every evaluation creates an `AuditEvent`:
- **Action:** `COMPLIANCE_EVALUATED`
- **Details:** Contains recommendation ID, evaluated rule ID, outcome, and reviewer requirement flag.
- When an officer verifies compliance during Phase 6 human review, `COMPLIANCE_VERIFIED` is logged.
