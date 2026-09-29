/**
 * Audit Repository
 * Database access layer for audit_events table
 */
import prisma from "../config/db.js";

export const logAuditEvent = async ({ recommendationId, actorId, action, details }) => {
  return await prisma.auditEvent.create({
    data: {
      recommendationId,
      actorId,
      action,
      details: typeof details === "object" ? JSON.stringify(details) : details,
    },
  });
};

export const findAuditEventsByRecommendation = async (recommendationId) => {
  return await prisma.auditEvent.findMany({
    where: { recommendationId },
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
