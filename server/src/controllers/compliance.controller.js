import { complianceRuleService } from "../services/complianceRuleService.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Controller for Compliance & QCO Rules Engine
 */
export const complianceController = {
  /**
   * GET /api/compliance/rules
   */
  async getRules(req, res, next) {
    try {
      const rules = await complianceRuleService.getActiveRules();
      return res.json({
        success: true,
        data: rules,
        total: rules.length,
        isDemoDataset: true,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/compliance/rules/:id
   */
  async getRuleById(req, res, next) {
    try {
      const { id } = req.params;
      const rule = await complianceRuleService.getRuleById(id);
      if (!rule) {
        return res.status(404).json({
          success: false,
          error: { message: `Compliance rule not found with ID: ${id}` },
        });
      }
      return res.json({
        success: true,
        data: rule,
        isDemoDataset: true,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/compliance/evaluate
   * Evaluates compliance against provided requirement attributes and standard context
   */
  async evaluate(req, res, next) {
    try {
      const { recommendationId, attributes, standardId, standardNumber, standardStatus, evaluationDate } = req.body;

      const evaluation = await complianceRuleService.evaluateCompliance({
        recommendationId,
        attributes: attributes || {},
        standardId,
        standardNumber,
        standardStatus,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : new Date(),
      });

      return res.json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/recommendations/:id/compliance
   */
  async getRecommendationCompliance(req, res, next) {
    try {
      const { id } = req.params;
      const evaluation = await complianceRuleService.getRecommendationCompliance(id);

      if (!evaluation) {
        // If not found in DB, check if recommendation exists and run on-the-fly evaluation
        const recommendation = await prisma.recommendation.findUnique({
          where: { id },
          include: {
            recommendationStandards: {
              where: { isPrimary: true },
              include: { standard: true },
            },
          },
        });

        if (!recommendation) {
          return res.status(404).json({
            success: false,
            error: { message: `Recommendation not found: ${id}` },
          });
        }

        const primaryStd = recommendation.recommendationStandards[0]?.standard;
        const freshEval = await complianceRuleService.evaluateCompliance({
          recommendationId: id,
          attributes: {
            product: recommendation.product || recommendation.requirementText,
            material: recommendation.material,
            capacity: recommendation.capacity,
            application: recommendation.application,
          },
          standardId: primaryStd?.id,
          standardNumber: primaryStd?.standardNumber,
          standardStatus: primaryStd?.status,
        });

        return res.json({
          success: true,
          data: freshEval,
        });
      }

      return res.json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  },
};
