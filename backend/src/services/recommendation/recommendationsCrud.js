import prisma from "../config/db.js";

export const getRecommendations = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  savedOnly = false,
} = {}) => {
  const skip = (Math.max(1, page) - 1) * limit;
  const where = { archived: false };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (savedOnly) {
    where.saved = true;
  }

  if (search) {
    where.OR = [
      { requirementText: { contains: search, mode: "insensitive" } },
      { product: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
      {
        recommendationStandards: {
          some: {
            standard: {
              OR: [
                { standardNumber: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.recommendation.count({ where }),
    prisma.recommendation.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
        recommendationStandards: {
          include: { standard: true },
          orderBy: { isPrimary: "desc" },
        },
        reviews: {
          include: { reviewer: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { evidence: true, auditEvents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Aggregate stats
  const [totalAll, acceptedCount, underReviewCount, clarificationCount] = await Promise.all([
    prisma.recommendation.count({ where: { archived: false } }),
    prisma.recommendation.count({ where: { status: "ACCEPTED", archived: false } }),
    prisma.recommendation.count({ where: { status: "UNDER_TECHNICAL_REVIEW", archived: false } }),
    prisma.recommendation.count({ where: { status: "CLARIFICATION_REQUESTED", archived: false } }),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
    statistics: {
      total: totalAll,
      accepted: acceptedCount,
      underReview: underReviewCount,
      clarificationRequested: clarificationCount,
    },
  };
};

export const getRecommendationById = async (id) => {
  return await prisma.recommendation.findUnique({
    where: { id },
    include: {
      user: true,
      recommendationStandards: {
        include: { standard: { include: { amendments: true } } },
        orderBy: { isPrimary: "desc" },
      },
      evidence: {
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        include: {
          reviewer: true,
          checklist: true,
        },
        orderBy: { createdAt: "desc" },
      },
      auditEvents: {
        include: { actor: true },
        orderBy: { createdAt: "desc" },
      },
      documents: true,
    },
  });
};

export const createRecommendation = async (data) => {
  const {
    requirementText,
    product,
    material,
    capacity,
    application,
    technicalCharacteristics,
    standardNumber = "IS 2347:2023",
    department = "Central Evaluation Committee (Demo)",
    confidence = 94,
    userId,
  } = data;

  // Find or create default user if not provided
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }
  if (!user) {
    user = await prisma.user.upsert({
      where: { email: "officer@normwise.gov.in" },
      update: {},
      create: {
        name: "Demo User",
        email: "officer@normwise.gov.in",
        role: "PROCUREMENT_OFFICER",
      },
    });
  }

  // Find standard to link
  const standard = await prisma.standard.findFirst({
    where: {
      OR: [
        { standardNumber: standardNumber },
        { standardNumber: { contains: "IS 2347" } },
      ],
    },
  });

  return await prisma.$transaction(async (tx) => {
    const recommendation = await tx.recommendation.create({
      data: {
        userId: user.id,
        requirementText,
        product: product || "Pressure Cooker",
        material: material || "Stainless Steel",
        capacity: capacity || "5 litre",
        application: application || "Institutional Kitchen",
        technicalCharacteristics: technicalCharacteristics || "",
        confidence: Number(confidence) || 94,
        status: "PENDING_REVIEW",
        department,
      },
    });

    // Link standard
    if (standard) {
      await tx.recommendationStandard.create({
        data: {
          recommendationId: recommendation.id,
          standardId: standard.id,
          matchConfidence: Number(confidence) || 94,
          reason: "Primary product classification and material match.",
          isPrimary: true,
        },
      });
    }

    // Create initial audit event
    await tx.auditEvent.create({
      data: {
        recommendationId: recommendation.id,
        actorId: user.id,
        action: "RECOMMENDATION_CREATED",
        details: `Recommendation generated for "${product || "requirement"}". Initial candidate matched.`,
      },
    });

    return recommendation;
  });
};

export const toggleSaveRecommendation = async (id) => {
  const current = await prisma.recommendation.findUnique({ where: { id } });
  if (!current) throw new Error("Recommendation not found");

  return await prisma.recommendation.update({
    where: { id },
    data: { saved: !current.saved },
  });
};

export const archiveRecommendation = async (id) => {
  return await prisma.recommendation.update({
    where: { id },
    data: { archived: true },
  });
};
