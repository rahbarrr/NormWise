import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ALLOWED_FIELDS = [
  "product",
  "productCategory",
  "material",
  "application",
  "capacity",
  "standardNumber",
  "standardStatus",
  "certificationScheme",
  "regulatoryCategory",
];

export const ALLOWED_OPERATORS = [
  "EQUALS",
  "CONTAINS",
  "MATCHES",
  "IN",
  "NOT_EQUALS",
];

/**
 * Validates condition configuration
 */
export function validateCondition(condition) {
  if (!condition || typeof condition !== "object") {
    throw new Error("Condition must be an object");
  }
  if (!ALLOWED_FIELDS.includes(condition.field)) {
    throw new Error(`Invalid condition field: "${condition.field}". Allowed: ${ALLOWED_FIELDS.join(", ")}`);
  }
  if (!ALLOWED_OPERATORS.includes(condition.operator)) {
    throw new Error(`Invalid condition operator: "${condition.operator}". Allowed: ${ALLOWED_OPERATORS.join(", ")}`);
  }
  if (condition.value === undefined || condition.value === null) {
    throw new Error("Condition value is required");
  }
  return true;
}

/**
 * Deterministically evaluates a single condition against actual attribute value
 */
export function evaluateSingleCondition(operator, expectedValue, actualValue) {
  if (actualValue === undefined || actualValue === null || String(actualValue).trim() === "") {
    return { matches: false, missing: true };
  }

  const actualStr = String(actualValue).toLowerCase().trim();
  const expectedStr = String(expectedValue).toLowerCase().trim();

  switch (operator) {
    case "EQUALS":
      return { matches: actualStr === expectedStr, missing: false };

    case "NOT_EQUALS":
      return { matches: actualStr !== expectedStr, missing: false };

    case "CONTAINS":
      return { matches: actualStr.includes(expectedStr), missing: false };

    case "MATCHES": {
      try {
        // Safe regex escape if not regex
        const regex = new RegExp(expectedStr, "i");
        return { matches: regex.test(actualStr), missing: false };
      } catch {
        return { matches: actualStr.includes(expectedStr), missing: false };
      }
    }

    case "IN": {
      // Split by comma
      const items = expectedStr.split(",").map((s) => s.trim().toLowerCase());
      return { matches: items.includes(actualStr), missing: false };
    }

    default:
      return { matches: false, missing: false };
  }
}

/**
 * Compliance Rule Engine Service
 * Implements deterministic, versioned, evidence-linked compliance evaluation.
 */
export const complianceRuleService = {
  /**
   * Retrieves all active compliance rules with relations
   */
  async getActiveRules() {
    return await prisma.complianceRule.findMany({
      where: { status: "ACTIVE" },
      include: {
        conditions: true,
        evidences: {
          include: {
            evidence: true,
          },
        },
        standard: {
          select: {
            id: true,
            standardNumber: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Retrieves rule by ID
   */
  async getRuleById(id) {
    return await prisma.complianceRule.findUnique({
      where: { id },
      include: {
        conditions: true,
        evidences: {
          include: {
            evidence: true,
          },
        },
        standard: true,
      },
    });
  },

  /**
   * Evaluates rules against requirement attributes and standard context
   */
  async evaluateCompliance({
    recommendationId = null,
    attributes = {},
    standardId = null,
    standardNumber = null,
    standardStatus = null,
    evaluationDate = new Date(),
  } = {}) {
    const currentDate = evaluationDate instanceof Date ? evaluationDate : new Date(evaluationDate);

    // 1. Requirement completeness check
    const normalizedAttributes = {
      product: attributes.product || attributes.productCategory || "",
      productCategory: attributes.productCategory || "",
      material: attributes.material || "",
      application: attributes.application || "",
      capacity: attributes.capacity || "",
      standardNumber: standardNumber || attributes.standardNumber || "",
      standardStatus: standardStatus || attributes.standardStatus || "CURRENT",
      certificationScheme: attributes.certificationScheme || "",
      regulatoryCategory: attributes.regulatoryCategory || "",
    };

    // If core product identifier is completely missing, return INSUFFICIENT_EVIDENCE
    if (!normalizedAttributes.product.trim() && !normalizedAttributes.standardNumber.trim()) {
      const evaluation = {
        outcome: "INSUFFICIENT_EVIDENCE",
        explanation: "Product identifier or standard number is missing. Unable to evaluate compliance rules without product context.",
        matchedRules: [],
        matchedConditions: [],
        missingAttributes: ["product", "standardNumber"],
        requiresHumanReview: true,
        isDemoDataset: true,
        evaluatedAt: currentDate,
      };

      if (recommendationId) {
        await this.persistEvaluation(recommendationId, null, evaluation, null);
      }
      return evaluation;
    }

    // 2. Fetch active rules
    const activeRules = await this.getActiveRules();

    if (!activeRules || activeRules.length === 0) {
      const evaluation = {
        outcome: "NOT_IDENTIFIED",
        explanation: "No active regulatory or certification rules found in the current dataset.",
        matchedRules: [],
        matchedConditions: [],
        missingAttributes: [],
        requiresHumanReview: false,
        isDemoDataset: true,
        evaluatedAt: currentDate,
      };

      if (recommendationId) {
        await this.persistEvaluation(recommendationId, null, evaluation, null);
      }
      return evaluation;
    }

    const matchedRules = [];
    const missingAttributesSet = new Set();
    const evaluatedConditionsList = [];

    // 3. Evaluate each rule
    for (const rule of activeRules) {
      // Check effective dates
      if (rule.effectiveFrom && new Date(rule.effectiveFrom) > currentDate) {
        // Future rule, not yet active
        continue;
      }
      if (rule.effectiveTo && new Date(rule.effectiveTo) < currentDate) {
        // Expired rule
        continue;
      }

      // Check if standardId is specified and doesn't match
      if (rule.standardId && standardId && rule.standardId !== standardId) {
        continue;
      }

      // Evaluate conditions
      if (!rule.conditions || rule.conditions.length === 0) {
        continue;
      }

      let anyConditionFailed = false;
      const ruleMissingAttributes = [];
      const matchedConditionsForRule = [];

      for (const cond of rule.conditions) {
        // Validate operator and field safely
        validateCondition(cond);

        const actualVal = normalizedAttributes[cond.field];
        const res = evaluateSingleCondition(cond.operator, cond.value, actualVal);

        if (res.missing) {
          ruleMissingAttributes.push(cond.field);
        } else if (!res.matches) {
          anyConditionFailed = true;
          break; // Rule is not relevant for this requirement
        } else {
          matchedConditionsForRule.push({
            field: cond.field,
            operator: cond.operator,
            expectedValue: cond.value,
            actualValue: actualVal,
          });
        }
      }

      if (!anyConditionFailed) {
        if (ruleMissingAttributes.length === 0 && matchedConditionsForRule.length > 0) {
          matchedRules.push({
            rule,
            matchedConditions: matchedConditionsForRule,
          });
          evaluatedConditionsList.push(...matchedConditionsForRule);
        } else if (matchedConditionsForRule.length > 0 && ruleMissingAttributes.length > 0) {
          // Rule partially matched, but requires missing attributes
          ruleMissingAttributes.forEach((attr) => missingAttributesSet.add(attr));
        }
      }
    }

    // 4. Handle Missing Information
    if (matchedRules.length === 0 && missingAttributesSet.size > 0) {
      const missingList = Array.from(missingAttributesSet);
      const evaluation = {
        outcome: "INSUFFICIENT_EVIDENCE",
        explanation: `Unable to definitively evaluate potential regulatory compliance because key product attributes are missing: ${missingList.join(", ")}.`,
        matchedRules: [],
        matchedConditions: [],
        missingAttributes: missingList,
        requiresHumanReview: true,
        isDemoDataset: true,
        evaluatedAt: currentDate,
      };

      if (recommendationId) {
        await this.persistEvaluation(recommendationId, null, evaluation, null);
      }
      return evaluation;
    }

    // 5. Handle No Rules Matched
    if (matchedRules.length === 0) {
      const evaluation = {
        outcome: "NOT_IDENTIFIED",
        explanation: "Based on the standards and regulatory rules available in the current dataset, no potentially applicable certification or QCO rule was identified.",
        matchedRules: [],
        matchedConditions: [],
        missingAttributes: [],
        requiresHumanReview: false,
        isDemoDataset: true,
        evaluatedAt: currentDate,
      };

      if (recommendationId) {
        await this.persistEvaluation(recommendationId, null, evaluation, null);
      }
      return evaluation;
    }

    // 6. Handle Conflicting Rules
    const distinctOutcomes = new Set(matchedRules.map((m) => m.rule.outcome));
    if (distinctOutcomes.size > 1) {
      const primaryRule = matchedRules[0].rule;
      const evaluation = {
        outcome: "REQUIRES_REVIEW",
        explanation: "Multiple applicable rules with conflicting compliance outcomes matched the requirement. Human verification is required.",
        matchedRules: matchedRules.map((m) => ({
          id: m.rule.id,
          name: m.rule.name,
          outcome: m.rule.outcome,
          authority: m.rule.authority,
          sourceReference: m.rule.sourceReference,
          conditions: m.matchedConditions,
        })),
        matchedConditions: evaluatedConditionsList,
        missingAttributes: [],
        requiresHumanReview: true,
        isDemoDataset: true,
        evaluatedAt: currentDate,
      };

      if (recommendationId) {
        await this.persistEvaluation(recommendationId, primaryRule.id, evaluation, null);
      }
      return evaluation;
    }

    // 7. Check if Source Reference is missing
    const primaryMatch = matchedRules[0];
    const rule = primaryMatch.rule;
    const hasSource = rule.sourceReference && rule.sourceReference.trim() !== "";
    const primaryEvidence = rule.evidences && rule.evidences.length > 0 ? rule.evidences[0] : null;

    let finalOutcome = rule.outcome;
    let explanation = "";

    if (!hasSource) {
      finalOutcome = "REQUIRES_REVIEW";
      explanation = `Review required because the regulatory rule source reference is missing in the dataset for rule: ${rule.name}.`;
    } else if (finalOutcome === "POTENTIALLY_APPLICABLE") {
      explanation = `Potentially applicable because requirement matched active demo rule "${rule.name}" based on product attributes and standard citation in the current dataset.`;
    } else if (finalOutcome === "NOT_IDENTIFIED") {
      explanation = `Specific certification or mandatory QCO requirement not identified under rule "${rule.name}".`;
    } else {
      explanation = `Evaluation produced "${finalOutcome}" under rule "${rule.name}". Human verification recommended.`;
    }

    const evaluation = {
      outcome: finalOutcome,
      explanation,
      matchedRules: matchedRules.map((m) => ({
        id: m.rule.id,
        name: m.rule.name,
        description: m.rule.description,
        outcome: m.rule.outcome,
        authority: m.rule.authority,
        sourceReference: m.rule.sourceReference,
        effectiveFrom: m.rule.effectiveFrom,
        effectiveTo: m.rule.effectiveTo,
        isDemo: m.rule.isDemo,
        conditions: m.matchedConditions,
        evidences: m.rule.evidences || [],
      })),
      matchedConditions: evaluatedConditionsList,
      missingAttributes: [],
      requiresHumanReview: true, // Legal / regulatory compliance always flags review for human procurement officers
      evidenceId: primaryEvidence?.evidenceId || null,
      primaryRuleId: rule.id,
      authority: rule.authority,
      sourceReference: rule.sourceReference,
      effectiveFrom: rule.effectiveFrom,
      effectiveTo: rule.effectiveTo,
      isDemoDataset: true,
      evaluatedAt: currentDate,
    };

    if (recommendationId) {
      await this.persistEvaluation(recommendationId, rule.id, evaluation, primaryEvidence?.evidenceId);
    }

    return evaluation;
  },

  /**
   * Persists evaluation and creates an AuditEvent record
   */
  async persistEvaluation(recommendationId, ruleId, evaluation, evidenceId = null) {
    try {
      const evaluationRecord = await prisma.complianceEvaluation.create({
        data: {
          recommendationId,
          complianceRuleId: ruleId || null,
          outcome: evaluation.outcome,
          matchedConditions: evaluation.matchedConditions || [],
          explanation: evaluation.explanation,
          evidenceId: evidenceId || null,
          requiresHumanReview: evaluation.requiresHumanReview,
          missingAttributes: evaluation.missingAttributes || [],
          evaluatedAt: evaluation.evaluatedAt || new Date(),
        },
      });

      // Audit Log
      await prisma.auditEvent.create({
        data: {
          recommendationId,
          action: "COMPLIANCE_EVALUATED",
          details: `Compliance rules evaluated. Outcome: ${evaluation.outcome}. Matched rules: ${evaluation.matchedRules?.length || 0}. Human review required: ${evaluation.requiresHumanReview}. Evaluation ID: ${evaluationRecord.id}`,
        },
      });

      return evaluationRecord;
    } catch (err) {
      console.error("[complianceRuleService] Error persisting evaluation or audit event:", err);
      return null;
    }
  },

  /**
   * Retrieves compliance evaluation for a specific recommendation
   */
  async getRecommendationCompliance(recommendationId) {
    const evaluation = await prisma.complianceEvaluation.findFirst({
      where: { recommendationId },
      orderBy: { evaluatedAt: "desc" },
      include: {
        complianceRule: {
          include: {
            conditions: true,
            evidences: true,
          },
        },
        evidence: true,
      },
    });

    return evaluation;
  },

  /**
   * Creates a compliance rule with validation
   */
  async createRule(data) {
    const { conditions = [], evidences = [], ...ruleData } = data;

    // Validate conditions
    for (const c of conditions) {
      validateCondition(c);
    }

    return await prisma.complianceRule.create({
      data: {
        ...ruleData,
        conditions: {
          create: conditions.map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
        },
        evidences: {
          create: evidences.map((e) => ({
            sourceTitle: e.sourceTitle,
            sourceReference: e.sourceReference,
            effectiveDate: e.effectiveDate ? new Date(e.effectiveDate) : null,
            notes: e.notes || null,
            evidenceId: e.evidenceId || null,
          })),
        },
      },
      include: {
        conditions: true,
        evidences: true,
      },
    });
  },
};
