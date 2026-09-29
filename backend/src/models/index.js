/**
 * NormWise 8-Table MVP Model Definitions & Constants
 *
 * The 8 core MVP tables:
 *   1. users
 *   2. standards
 *   3. recommendations
 *   4. recommendation_standards
 *   5. related_standards
 *   6. evidence
 *   7. documents
 *   8. audit_events
 */

export const TableNames = {
  USERS: "users",
  STANDARDS: "standards",
  RECOMMENDATIONS: "recommendations",
  RECOMMENDATION_STANDARDS: "recommendation_standards",
  RELATED_STANDARDS: "related_standards",
  EVIDENCE: "evidence",
  DOCUMENTS: "documents",
  AUDIT_EVENTS: "audit_events",
};

export const Roles = {
  PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER",
  TECHNICAL_REVIEWER: "TECHNICAL_REVIEWER",
  ADMIN: "ADMIN",
  AUDITOR: "AUDITOR",
};

export const StandardStatuses = {
  CURRENT: "CURRENT",
  SUPERSEDED: "SUPERSEDED",
  WITHDRAWN: "WITHDRAWN",
  UNDER_REVIEW: "UNDER_REVIEW",
  UNKNOWN: "UNKNOWN",
};

export const RecommendationStatuses = {
  PENDING_REVIEW: "PENDING_REVIEW",
  ACCEPTED: "ACCEPTED",
  UNDER_TECHNICAL_REVIEW: "UNDER_TECHNICAL_REVIEW",
  CLARIFICATION_REQUESTED: "CLARIFICATION_REQUESTED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};
