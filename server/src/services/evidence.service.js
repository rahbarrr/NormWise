import prisma from "../config/db.js";

export const getEvidenceByRecommendationId = async (recommendationId) => {
  return await prisma.evidence.findMany({
    where: { recommendationId },
    include: {
      standard: {
        select: {
          id: true,
          standardNumber: true,
          title: true,
          edition: true,
          revision: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const createEvidence = async (recommendationId, data) => {
  return await prisma.evidence.create({
    data: {
      recommendationId,
      standardId: data.standardId,
      type: data.type || "SCOPE",
      reference: data.reference,
      content: data.content,
      source: data.source,
      status: data.status || "Available",
    },
  });
};
