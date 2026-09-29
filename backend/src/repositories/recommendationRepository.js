/**
 * Recommendation Repository
 * Database access layer for recommendations and recommendation_standards tables
 */
import prisma from "../config/db.js";

export const findRecommendationById = async (id) => {
  return await prisma.recommendation.findUnique({
    where: { id },
    include: {
      recommendationStandards: {
        include: { standard: true },
      },
      evidence: true,
      reviews: true,
    },
  });
};

export const createRecommendationRecord = async (data) => {
  return await prisma.recommendation.create({
    data,
  });
};

export const updateRecommendationStatus = async (id, status, decisionNotes) => {
  return await prisma.recommendation.update({
    where: { id },
    data: {
      status,
      decisionNotes,
      updatedAt: new Date(),
    },
  });
};
