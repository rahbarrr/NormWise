/**
 * NormWise Frontend JSDoc Type Definitions
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string[]} [permissions]
 *
 * @typedef {Object} Standard
 * @property {string} id
 * @property {string} standardNumber
 * @property {string} title
 * @property {string} [status]
 * @property {string} [category]
 * @property {string} [scope]
 *
 * @typedef {Object} Recommendation
 * @property {string} id
 * @property {string} requirementText
 * @property {Object} primaryRecommendation
 * @property {Object[]} alternativeStandards
 * @property {Object[]} evidence
 * @property {string} status
 * @property {number} confidence
 */

export {};
