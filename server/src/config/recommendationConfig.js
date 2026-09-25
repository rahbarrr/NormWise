/**
 * NormWise Recommendation Engine Configuration
 * Engineering parameters for candidate scoring and hybrid retrieval
 */

export const SCORING_WEIGHTS = {
  // Configurable scoring weights (total = 1.00)
  PRODUCT_WEIGHT: parseFloat(process.env.PRODUCT_WEIGHT || "0.30"),
  APPLICATION_WEIGHT: parseFloat(process.env.APPLICATION_WEIGHT || "0.25"),
  MATERIAL_WEIGHT: parseFloat(process.env.MATERIAL_WEIGHT || "0.15"),
  TECHNICAL_WEIGHT: parseFloat(process.env.TECHNICAL_WEIGHT || "0.10"),
  SEMANTIC_WEIGHT: parseFloat(process.env.SEMANTIC_WEIGHT || "0.20"),
};

export const RECOMMENDATION_THRESHOLDS = {
  // Score required to confirm standard as primary recommendation
  MIN_ACCEPTABLE_SCORE: parseFloat(process.env.MIN_ACCEPTABLE_SCORE || "0.60"),
  // High confidence boundary
  HIGH_CONFIDENCE_SCORE: parseFloat(process.env.HIGH_CONFIDENCE_SCORE || "0.85"),
  // If top 2 candidates are within this difference, consider ambiguity
  AMBIGUITY_SCORE_GAP: parseFloat(process.env.AMBIGUITY_SCORE_GAP || "0.06"),
  // Minimum requirement text length
  MIN_REQUIREMENT_LENGTH: 5,
  MAX_REQUIREMENT_LENGTH: 10000,
};

export const RETRIEVAL_LIMITS = {
  KEYWORD_LIMIT: 20,
  SEMANTIC_LIMIT: 20,
  MAX_ALTERNATIVES_RETURNED: 3,
};
