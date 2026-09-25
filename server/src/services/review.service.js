import prisma from "../config/db.js";

export const getReviewByRecommendationId = async (recommendationId) => {
  return await prisma.review.findFirst({
    where: { recommendationId },
    include: {
      reviewer: true,
      checklist: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createOrUpdateReview = async (recommendationId, data) => {
  const { reviewerId, status, notes, checklist = [] } = data;

  let reviewer = null;
  if (reviewerId) {
    reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  }
  if (!reviewer) {
    reviewer = await prisma.user.upsert({
      where: { email: "reviewer@normwise.gov.in" },
      update: {},
      create: {
        name: "Demo User",
        email: "reviewer@normwise.gov.in",
        role: "TECHNICAL_REVIEWER",
      },
    });
  }

  return await prisma.$transaction(async (tx) => {
    // Find existing review
    let review = await tx.review.findFirst({
      where: { recommendationId },
    });

    if (review) {
      review = await tx.review.update({
        where: { id: review.id },
        data: {
          reviewerId: reviewer.id,
          status: status || review.status,
          notes: notes !== undefined ? notes : review.notes,
        },
      });
    } else {
      review = await tx.review.create({
        data: {
          recommendationId,
          reviewerId: reviewer.id,
          status: status || "PENDING",
          notes: notes || "",
        },
      });
    }

    // Upsert checklist items
    if (Array.isArray(checklist) && checklist.length > 0) {
      for (const item of checklist) {
        await tx.reviewChecklist.upsert({
          where: {
            reviewId_itemKey: {
              reviewId: review.id,
              itemKey: item.itemKey || item.id,
            },
          },
          update: {
            completed: Boolean(item.completed),
            label: item.label,
          },
          create: {
            reviewId: review.id,
            itemKey: item.itemKey || item.id,
            label: item.label || item.itemKey || item.id,
            completed: Boolean(item.completed),
          },
        });
      }
    }

    return await tx.review.findUnique({
      where: { id: review.id },
      include: { reviewer: true, checklist: true },
    });
  });
};

export const acceptRecommendation = async (recommendationId, { notes, reviewerId } = {}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Update recommendation status
    const rec = await tx.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: "ACCEPTED",
        decisionNotes: notes || "Recommendation accepted after human review verification.",
      },
    });

    // 2. Update or create review
    let review = await tx.review.findFirst({ where: { recommendationId } });
    if (review) {
      await tx.review.update({
        where: { id: review.id },
        data: { status: "ACCEPTED", notes: notes || review.notes },
      });
    } else {
      await tx.review.create({
        data: {
          recommendationId,
          reviewerId,
          status: "ACCEPTED",
          notes: notes || "Recommendation accepted.",
        },
      });
    }

    // 3. Create AuditEvent
    await tx.auditEvent.create({
      data: {
        recommendationId,
        actorId: reviewerId,
        action: "RECOMMENDATION_ACCEPTED",
        details: `Recommendation accepted and recorded in public procurement audit history. Notes: ${notes || "None"}`,
      },
    });

    return rec;
  });
};

export const requestTechnicalReview = async (recommendationId, { reason, reviewerId } = {}) => {
  return await prisma.$transaction(async (tx) => {
    const rec = await tx.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: "UNDER_TECHNICAL_REVIEW",
        decisionNotes: reason,
      },
    });

    let review = await tx.review.findFirst({ where: { recommendationId } });
    if (review) {
      await tx.review.update({
        where: { id: review.id },
        data: { status: "TECHNICAL_REVIEW", notes: reason },
      });
    } else {
      await tx.review.create({
        data: {
          recommendationId,
          reviewerId,
          status: "TECHNICAL_REVIEW",
          notes: reason,
        },
      });
    }

    await tx.auditEvent.create({
      data: {
        recommendationId,
        actorId: reviewerId,
        action: "REVIEW_REQUESTED",
        details: `Referred to technical committee. Rationale: ${reason || "Additional parameter verification required"}`,
      },
    });

    return rec;
  });
};

export const requestClarification = async (recommendationId, { category, question, reviewerId } = {}) => {
  const detailsText = `Clarification requested [${category || "General"}]: ${question || "Clarification needed"}`;

  return await prisma.$transaction(async (tx) => {
    const rec = await tx.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: "CLARIFICATION_REQUESTED",
        decisionNotes: detailsText,
      },
    });

    let review = await tx.review.findFirst({ where: { recommendationId } });
    if (review) {
      await tx.review.update({
        where: { id: review.id },
        data: { status: "CLARIFICATION_REQUESTED", notes: detailsText },
      });
    } else {
      await tx.review.create({
        data: {
          recommendationId,
          reviewerId,
          status: "CLARIFICATION_REQUESTED",
          notes: detailsText,
        },
      });
    }

    await tx.auditEvent.create({
      data: {
        recommendationId,
        actorId: reviewerId,
        action: "CLARIFICATION_REQUESTED",
        details: detailsText,
      },
    });

    return rec;
  });
};

export const markNotApplicable = async (recommendationId, { reason, explanation, reviewerId } = {}) => {
  const detailsText = `Non-applicable determination (${reason || "Other"}): ${explanation || "No explanation provided"}`;

  return await prisma.$transaction(async (tx) => {
    const rec = await tx.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: "NOT_APPLICABLE",
        decisionNotes: detailsText,
      },
    });

    let review = await tx.review.findFirst({ where: { recommendationId } });
    if (review) {
      await tx.review.update({
        where: { id: review.id },
        data: { status: "NOT_APPLICABLE", notes: detailsText },
      });
    } else {
      await tx.review.create({
        data: {
          recommendationId,
          reviewerId,
          status: "NOT_APPLICABLE",
          notes: detailsText,
        },
      });
    }

    await tx.auditEvent.create({
      data: {
        recommendationId,
        actorId: reviewerId,
        action: "MARKED_NOT_APPLICABLE",
        details: detailsText,
      },
    });

    return rec;
  });
};
