/**
 * NormWise Shared Type Definitions
 * These are JSDoc type definitions usable by both frontend and backend.
 * For TypeScript projects, convert to .ts interface files.
 *
 * @typedef {Object} Standard
 * @property {string} id - UUID
 * @property {string} standardNumber - e.g. "IS 1234"
 * @property {string} title
 * @property {string|null} edition
 * @property {string} status - StandardStatus enum value
 * @property {string|null} category
 * @property {string|null} technicalDomain
 * @property {string|null} description
 * @property {string|null} scope
 * @property {string[]} keywords
 * @property {string[]} applicableProducts
 * @property {string[]} materials
 * @property {string[]} applications
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} RecommendationRequest
 * @property {string} text - Procurement requirement text
 * @property {string} [language] - Language code (default "en")
 * @property {string} [documentId] - Associated document UUID
 * @property {string} [userId] - User UUID
 */

/**
 * @typedef {Object} RankedStandard
 * @property {string} id
 * @property {string} standardNumber
 * @property {string} title
 * @property {number} matchConfidence - 0-100
 * @property {number} matchScore - 0.0-1.0
 * @property {boolean} isPrimary
 * @property {string|null} reason
 * @property {string[]} retrievedBy
 */

/**
 * @typedef {Object} RecommendationResult
 * @property {string} id - Recommendation UUID
 * @property {string} requirementText
 * @property {RankedStandard} primaryRecommendation
 * @property {RankedStandard[]} alternativeStandards
 * @property {Evidence[]} evidence
 * @property {RelatedStandard[]} relatedStandards
 * @property {Object} certification
 * @property {Object} currentness
 * @property {string} status
 * @property {number} confidence
 * @property {boolean} requiresReview
 */

/**
 * @typedef {Object} Evidence
 * @property {string} id
 * @property {string} type - EvidenceType enum
 * @property {string} reference
 * @property {string} content
 * @property {string} source
 * @property {string} status
 */

/**
 * @typedef {Object} ReviewDecision
 * @property {string} recommendationId
 * @property {"ACCEPTED"|"UNDER_TECHNICAL_REVIEW"|"CLARIFICATION_REQUESTED"|"NOT_APPLICABLE"} status
 * @property {string} [notes]
 */

export {};
