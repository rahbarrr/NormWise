/**
 * NormWise Authentication Middleware (Phase 18)
 *
 * Validates session token from secure HTTP-only cookie or Authorization header.
 * Attaches sanitized req.user and req.sessionId to request.
 * Never leaks passwordHash.
 */

import env from "../config/env.js";
import { validateSession } from "../services/authService.js";
import prisma from "../config/db.js";

/**
 * Extracts session token from HTTP-only cookie or Bearer header
 */
export function extractToken(req) {
  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies[env.AUTH_COOKIE_NAME]) {
    return req.cookies[env.AUTH_COOKIE_NAME];
  }

  // 2. Check Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Enforces authentication: returns 401 if unauthenticated or session invalid
 */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required to access this resource.",
      },
    });
  }

  const sessionData = await validateSession(token);
  if (!sessionData || !sessionData.user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Session expired or invalid. Please sign in again.",
      },
    });
  }

  if (!sessionData.user.isActive) {
    return res.status(401).json({
      error: {
        code: "ACCOUNT_DEACTIVATED",
        message: "Your account has been deactivated. Please contact an administrator.",
      },
    });
  }

  req.user = sessionData.user;
  req.sessionId = sessionData.sessionId;
  next();
}

/**
 * Optional authentication: attaches user if present, proceeds either way
 */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    const sessionData = await validateSession(token);
    if (sessionData && sessionData.user && sessionData.user.isActive) {
      req.user = sessionData.user;
      req.sessionId = sessionData.sessionId;
    }
  }
  next();
}
