import prisma from "../config/db.js";
import { sendSuccess } from "../utils/response.js";

export const getAuditEventsByRecommendationId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auditEvents = await prisma.auditEvent.findMany({
      where: { recommendationId: id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, auditEvents);
  } catch (error) {
    next(error);
  }
};
