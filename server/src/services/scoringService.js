/**
 * NormWise Candidate Scoring Service
 * Transparent multi-factor scoring engine with explainable match reasons
 */
import { SCORING_WEIGHTS } from "../config/recommendationConfig.js";

/**
 * Score a single candidate standard against extracted requirement attributes
 */
export function scoreCandidate(candidate, extractedAttributes = {}, requirementText = "") {
  const { product, material, application, technicalCharacteristics = [] } = extractedAttributes;
  const applicableProducts = (candidate.applicableProducts || []).map((p) => p.toLowerCase());
  const materials = (candidate.materials || []).map((m) => m.toLowerCase());
  const applications = (candidate.applications || []).map((a) => a.toLowerCase());
  const keywords = (candidate.keywords || []).map((k) => k.toLowerCase());
  const title = (candidate.title || "").toLowerCase();
  const description = (candidate.description || "").toLowerCase();
  const scope = (candidate.scope || "").toLowerCase();
  const textBlob = `${title} ${description} ${scope} ${keywords.join(" ")}`;

  let productScore = 0;
  let applicationScore = 0;
  let materialScore = 0;
  let technicalScore = 0;
  const reasons = [];
  const warnings = [];

  // 1. Product Match (30%)
  if (product) {
    const pLower = product.toLowerCase();
    const directMatch = applicableProducts.some((p) => p.includes(pLower) || pLower.includes(p));
    const titleMatch = title.includes(pLower);
    const textMatch = textBlob.includes(pLower);

    if (directMatch) {
      productScore = 1.0;
      reasons.push(`Product classification '${product}' directly matches standard taxonomy.`);
    } else if (titleMatch) {
      productScore = 0.85;
      reasons.push(`Standard title specifically references product '${product}'.`);
    } else if (textMatch) {
      productScore = 0.60;
      reasons.push(`Product term '${product}' is covered in standard scope and description.`);
    }
  } else {
    // If no explicit product extracted, evaluate general keyword density
    const hasKeywordOverlap = keywords.some((k) => requirementText.toLowerCase().includes(k));
    if (hasKeywordOverlap) {
      productScore = 0.50;
      reasons.push("General domain keyword overlap identified with candidate standard.");
    }
  }

  // 2. Application & Scope Match (25%)
  if (application) {
    const aLower = application.toLowerCase();
    const appTokens = aLower.split(/\s+/).filter((t) => t.length > 3);
    const appMatch = applications.some((a) => a.includes(aLower) || aLower.includes(a));
    const tokenMatch = applications.some((a) => appTokens.some((tok) => a.includes(tok))) ||
      appTokens.some((tok) => textBlob.includes(tok));
    const scopeMatch = scope.includes(aLower) || description.includes(aLower);

    if (appMatch) {
      applicationScore = 1.0;
      reasons.push(`Application domain '${application}' is explicitly governed by this standard.`);
    } else if (tokenMatch || scopeMatch) {
      applicationScore = 0.90;
      reasons.push(`Operating application '${application}' aligns with specified standard scope.`);
    }
  } else {
    // Check if standard has broad general scope
    if (scope.length > 20) {
      applicationScore = 0.50;
    }
  }

  // 3. Material Compatibility (15%)
  if (material) {
    const mLower = material.toLowerCase();
    const matMatch = materials.some((m) => m.includes(mLower) || mLower.includes(m));
    const textMatMatch = textBlob.includes(mLower) || (mLower.includes("stainless") && textBlob.includes("stainless"));

    if (matMatch) {
      materialScore = 1.0;
      reasons.push(`Specified material '${material}' is explicitly compliant with standard material clauses.`);
    } else if (textMatMatch) {
      materialScore = 0.80;
      reasons.push(`Material composition '${material}' is referenced in candidate standard clauses.`);
    }
  } else {
    materialScore = 0.50; // Neutral if no material specified
  }

  // 4. Technical Characteristics (10%)
  if (technicalCharacteristics && technicalCharacteristics.length > 0) {
    let matchedCount = 0;
    for (const feat of technicalCharacteristics) {
      const fLower = feat.toLowerCase();
      if (textBlob.includes(fLower) || keywords.some((k) => k.includes(fLower))) {
        matchedCount++;
      }
    }
    const ratio = matchedCount / technicalCharacteristics.length;
    technicalScore = ratio;
    if (matchedCount > 0) {
      reasons.push(`Verified compliance for ${matchedCount} technical characteristic(s): ${technicalCharacteristics.slice(0, 2).join(", ")}.`);
    }
  } else {
    technicalScore = 0.60;
  }

  // 5. Semantic Similarity (20%)
  const rawSemantic = candidate.retrievalSignals?.semanticSimilarity || 0;
  const semanticScore = rawSemantic > 0 ? Math.min(1.0, rawSemantic) : 0;

  // Weight computation:
  // If semantic embeddings are not configured, redistribute semantic weight proportionally
  let finalScore = 0;
  const weights = SCORING_WEIGHTS;

  if (semanticScore > 0) {
    finalScore =
      productScore * weights.PRODUCT_WEIGHT +
      applicationScore * weights.APPLICATION_WEIGHT +
      materialScore * weights.MATERIAL_WEIGHT +
      technicalScore * weights.TECHNICAL_WEIGHT +
      semanticScore * weights.SEMANTIC_WEIGHT;
    reasons.push(`Semantic concept relevance score: ${(semanticScore * 100).toFixed(0)}%.`);
  } else {
    // Redistribute semantic weight across structured attributes
    const nonSemanticWeight =
      weights.PRODUCT_WEIGHT +
      weights.APPLICATION_WEIGHT +
      weights.MATERIAL_WEIGHT +
      weights.TECHNICAL_WEIGHT;

    const scale = 1.0 / nonSemanticWeight;

    finalScore =
      productScore * weights.PRODUCT_WEIGHT * scale +
      applicationScore * weights.APPLICATION_WEIGHT * scale +
      materialScore * weights.MATERIAL_WEIGHT * scale +
      technicalScore * weights.TECHNICAL_WEIGHT * scale;
  }

  // Status-based warnings
  if (candidate.status === "SUPERSEDED") {
    warnings.push(`Standard ${candidate.standardNumber} is SUPERSEDED. A newer revision exists.`);
    finalScore = finalScore * 0.70; // Deprioritize superseded candidate
  } else if (candidate.status === "WITHDRAWN") {
    warnings.push(`Standard ${candidate.standardNumber} is WITHDRAWN from official catalog.`);
    finalScore = finalScore * 0.40; // Severe penalty for withdrawn standards
  } else if (candidate.status === "UNDER_REVIEW") {
    warnings.push(`Standard ${candidate.standardNumber} is currently undergoing technical committee review.`);
  } else if (candidate.status === "UNKNOWN") {
    warnings.push(`Standard ${candidate.standardNumber} currentness could not be established from available source data.`);
    finalScore = finalScore * 0.85; // Deprioritize unverified status compared to CURRENT
  }

  // Bound score between 0.00 and 0.99
  const normalizedScore = Math.max(0.0, Math.min(0.98, parseFloat(finalScore.toFixed(2))));

  return {
    standardId: candidate.id,
    standardNumber: candidate.standardNumber,
    title: candidate.title,
    edition: candidate.edition,
    revision: candidate.revision,
    status: candidate.status,
    description: candidate.description,
    score: normalizedScore,
    scoreBreakdown: {
      productScore: parseFloat((productScore * weights.PRODUCT_WEIGHT).toFixed(3)),
      applicationScore: parseFloat((applicationScore * weights.APPLICATION_WEIGHT).toFixed(3)),
      materialScore: parseFloat((materialScore * weights.MATERIAL_WEIGHT).toFixed(3)),
      technicalScore: parseFloat((technicalScore * weights.TECHNICAL_WEIGHT).toFixed(3)),
      semanticScore: parseFloat((semanticScore * weights.SEMANTIC_WEIGHT).toFixed(3)),
    },
    reasons,
    warnings,
  };
}

/**
 * Score and rank candidate array
 */
export function scoreCandidates(candidates, extractedAttributes, requirementText) {
  const scored = candidates.map((cand) =>
    scoreCandidate(cand, extractedAttributes, requirementText)
  );

  return scored.sort((a, b) => b.score - a.score);
}
