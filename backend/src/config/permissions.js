/**
 * NormWise Role & Permission Matrix (Phase 18)
 * Explicit, centralized role-based authorization model.
 */

export const PERMISSIONS = {
  // Recommendations
  RECOMMENDATION_CREATE: "RECOMMENDATION_CREATE",
  RECOMMENDATION_READ: "RECOMMENDATION_READ",
  RECOMMENDATION_REVIEW: "RECOMMENDATION_REVIEW",
  RECOMMENDATION_DECIDE: "RECOMMENDATION_DECIDE",

  // Documents
  DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD",
  DOCUMENT_READ: "DOCUMENT_READ",
  DOCUMENT_DELETE: "DOCUMENT_DELETE",

  // Evidence
  EVIDENCE_READ: "EVIDENCE_READ",

  // Standards Catalog
  STANDARD_READ: "STANDARD_READ",
  STANDARD_MANAGE: "STANDARD_MANAGE",

  // Knowledge Graph & Allied Relationships
  RELATIONSHIP_READ: "RELATIONSHIP_READ",
  RELATIONSHIP_MANAGE: "RELATIONSHIP_MANAGE",

  // Compliance & Regulatory Rules
  COMPLIANCE_READ: "COMPLIANCE_READ",
  COMPLIANCE_MANAGE: "COMPLIANCE_MANAGE",

  // Human Review Workflow
  REVIEW_READ: "REVIEW_READ",
  REVIEW_MANAGE: "REVIEW_MANAGE",

  // Audit Events
  AUDIT_READ: "AUDIT_READ",

  // Dataset Ingestion & Foundations
  DATASET_IMPORT: "DATASET_IMPORT",
  DATASET_MANAGE: "DATASET_MANAGE",

  // Quality Evaluation & Benchmarking
  EVALUATION_RUN: "EVALUATION_RUN",
  EVALUATION_READ: "EVALUATION_READ",

  // Terminology
  TERMINOLOGY_MANAGE: "TERMINOLOGY_MANAGE",

  // User Management
  USER_MANAGE: "USER_MANAGE",
};

export const ROLE_PERMISSIONS = {
  PROCUREMENT_OFFICER: [
    PERMISSIONS.RECOMMENDATION_CREATE,
    PERMISSIONS.RECOMMENDATION_READ,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.STANDARD_READ,
    PERMISSIONS.RELATIONSHIP_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.REVIEW_READ,
  ],

  TECHNICAL_REVIEWER: [
    PERMISSIONS.RECOMMENDATION_CREATE,
    PERMISSIONS.RECOMMENDATION_READ,
    PERMISSIONS.RECOMMENDATION_REVIEW,
    PERMISSIONS.RECOMMENDATION_DECIDE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.STANDARD_READ,
    PERMISSIONS.RELATIONSHIP_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.REVIEW_MANAGE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.EVALUATION_READ,
  ],

  AUDITOR: [
    PERMISSIONS.RECOMMENDATION_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.STANDARD_READ,
    PERMISSIONS.RELATIONSHIP_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.EVALUATION_READ,
  ],

  ADMIN: Object.values(PERMISSIONS),
};

/**
 * Checks if a specific role possesses a given permission
 * @param {string} role - User role string (e.g. "PROCUREMENT_OFFICER")
 * @param {string} permission - Required permission string from PERMISSIONS
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const roleUpper = role.toUpperCase();
  const permissions = ROLE_PERMISSIONS[roleUpper] || [];
  return permissions.includes(permission);
}

/**
 * Returns list of all permissions granted to a given role
 * @param {string} role - User role
 * @returns {Array<string>}
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  const roleUpper = role.toUpperCase();
  return ROLE_PERMISSIONS[roleUpper] || [];
}
