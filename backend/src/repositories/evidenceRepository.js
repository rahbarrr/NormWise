/**
 * Evidence Repository
 * Database access layer for evidence table
 */
import prisma from "../config/db.js";

export const findEvidenceByStandardId = async (standardId) => {
  return await prisma.evidence.findMany({
    where: { standardId },
    orderBy: { createdAt: "asc" },
  });
};

export const findEvidenceByRecommendationId = async (recommendationId) => {
  return await prisma.evidence.findMany({
    where: { recommendationId },
    include: { standard: true },
    orderBy: { createdAt: "asc" },
  });
};

export const createEvidenceRecord = async (data) => {
  return await prisma.evidence.create({
    data,
  });
};
