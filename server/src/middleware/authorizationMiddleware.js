/**
 * NormWise Authorization Middleware (Phase 18)
 *
 * Enforces:
 * - Permission-based access control (requirePermission)
 * - Role-based access control (requireRole)
 * - Resource ownership (preventing ID enumeration)
 * - Self-approval prevention for procurement officers (Section 15)
 */

import { hasPermission } from "../config/permissions.js";
import prisma from "../config/db.js";

/**
 * Requires a specific granular permission
 * @param {string} permission - Granular permission from PERMISSIONS enum
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires permission: ${permission}.`,
        },
      });
    }

    next();
  };
}

/**
 * Requires one of the specified roles
 * @param {string|string[]} roles - Single role or array of allowed roles
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
    }

    const userRole = (req.user.role || "").toUpperCase();
    if (!allowed.some((r) => r.toUpperCase() === userRole)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires one of roles: [${allowed.join(", ")}].`,
        },
      });
    }

    next();
  };
}

/**
 * Enforces Section 15: A procurement officer cannot approve their own recommendation
 */
export async function forbidSelfApproval(req, res, next) {
  if (!req.user) return next();

  // Auditors are strictly read-only and cannot make decisions
  if (req.user.role === "AUDITOR") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Auditors have read-only access and cannot make recommendation review decisions.",
      },
    });
  }

  // If user is a PROCUREMENT_OFFICER, check if they authored this recommendation
  if (req.user.role === "PROCUREMENT_OFFICER") {
    const recId = req.params.id || req.body.recommendationId;
    if (recId) {
      const rec = await prisma.recommendation.findUnique({
        where: { id: recId },
        select: { userId: true },
      });

      if (rec && rec.userId === req.user.id) {
        return res.status(403).json({
          error: {
            code: "SELF_APPROVAL_FORBIDDEN",
            message: "Procurement officers cannot approve their own recommendations. Independent technical review is required.",
          },
        });
      }
    }
  }

  next();
}

/**
 * Enforces resource ownership (Section 14)
 * Allows ADMINs, TECHNICAL_REVIEWERs, or AUDITORs with read permission, but ensures
 * ordinary users can only access their own records.
 */
export function requireOwnershipOrReviewer(resourceLoader) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      });
    }

    // Admins, Reviewers, and Auditors have cross-organization visibility based on role
    if (["ADMIN", "TECHNICAL_REVIEWER", "AUDITOR"].includes(req.user.role)) {
      return next();
    }

    try {
      const resource = await resourceLoader(req);
      if (!resource) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Resource not found." },
        });
      }

      // Check user ownership
      const ownerId = resource.userId || resource.uploadedById || resource.actorId;
      if (ownerId && ownerId !== req.user.id) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to access another user's private records.",
          },
        });
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
}
