/**
 * NormWise Shared Constants
 * Shared between frontend and backend (copy to each service as needed,
 * or import directly in a monorepo/workspace setup).
 */

// Recommendation pipeline status values
export const RecommendationStatus = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACCEPTED: 'ACCEPTED',
  UNDER_TECHNICAL_REVIEW: 'UNDER_TECHNICAL_REVIEW',
  CLARIFICATION_REQUESTED: 'CLARIFICATION_REQUESTED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

// Standard status values
export const StandardStatus = {
  CURRENT: 'CURRENT',
  SUPERSEDED: 'SUPERSEDED',
  WITHDRAWN: 'WITHDRAWN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  UNKNOWN: 'UNKNOWN',
};

// User roles
export const UserRole = {
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
  TECHNICAL_REVIEWER: 'TECHNICAL_REVIEWER',
  ADMIN: 'ADMIN',
  AUDITOR: 'AUDITOR',
};

// Evidence types
export const EvidenceType = {
  SCOPE: 'SCOPE',
  REQUIREMENT: 'REQUIREMENT',
  MATERIAL: 'MATERIAL',
  CERTIFICATION: 'CERTIFICATION',
  CURRENTNESS: 'CURRENTNESS',
  RELATED_STANDARD: 'RELATED_STANDARD',
  TEST_METHOD: 'TEST_METHOD',
};

// API routes (backend endpoint paths)
export const ApiRoutes = {
  RECOMMEND: '/api/recommend',
  RECOMMENDATIONS: '/api/recommendations',
  STANDARDS: '/api/standards',
  DOCUMENTS: '/api/documents',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  REVIEW: '/api/recommendations',
  HEALTH: '/api/health',
};

// ML service routes
export const MlRoutes = {
  RERANK: '/api/v1/rerank',
  HEALTH: '/health',
};

// Recommendation engine thresholds (keep in sync with backend recommendationConfig.js)
export const RecommendationThresholds = {
  MIN_REQUIREMENT_LENGTH: 10,
  MAX_REQUIREMENT_LENGTH: 10000,
  HIGH_CONFIDENCE: 85,
  MEDIUM_CONFIDENCE: 65,
  LOW_CONFIDENCE: 45,
};
