/**
 * NormWise Authentication & Security Service (Phase 18)
 *
 * Implements:
 * - Password hashing & timing-safe verification via bcryptjs (Section 5)
 * - Safe user serialization (never leaks passwordHash or internal credentials)
 * - Secure server-backed session tokens with SHA-256 token hashing
 * - Refresh & session invalidation support ("Sign out all sessions")
 * - Anti-CSRF token generation & validation
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import env from "../config/env.js";

const BCRYPT_SALT_ROUNDS = env.isProduction ? 12 : 10;

/**
 * Validates password strength (minimum 8 characters)
 */
export function validatePasswordRequirements(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must not exceed 128 characters." };
  }
  return { valid: true };
}

/**
 * Hashes a plaintext password securely
 */
export async function hashPassword(plainPassword) {
  const validation = validatePasswordRequirements(plainPassword);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return await bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Sanitizes user record into safe identity payload (Section 40)
 * NEVER returns passwordHash or internal security attributes.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.isActive),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

/**
 * Computes deterministic SHA-256 hash of a session token for DB storage
 */
export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates an anti-CSRF token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Creates a server-backed authenticated session
 * @param {string} userId - User ID
 * @param {Object} reqContext - { userAgent, ipAddress }
 * @returns {Promise<{ rawToken: string, cookieValue: string, expiresAt: Date }>}
 */
export async function createSession(userId, reqContext = {}) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.SESSION_EXPIRY_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: reqContext.userAgent || null,
      ipAddress: reqContext.ipAddress || null,
    },
  });

  // Sign JWT containing sessionId and token
  const cookieValue = jwt.sign(
    {
      sessionId: session.id,
      token: rawToken,
      userId,
    },
    env.AUTH_SECRET,
    { expiresIn: `${env.SESSION_EXPIRY_DAYS}d` }
  );

  return { rawToken, cookieValue, expiresAt };
}

/**
 * Validates a session cookie or bearer token and returns the safe user
 * @param {string} tokenString - JWT signed session cookie or raw bearer token
 * @returns {Promise<{ user: Object, sessionId: string } | null>}
 */
export async function validateSession(tokenString) {
  if (!tokenString) return null;

  try {
    let sessionId = null;
    let rawToken = null;

    // Check if it's a signed JWT (standard cookie format)
    try {
      const decoded = jwt.verify(tokenString, env.AUTH_SECRET);
      sessionId = decoded.sessionId;
      rawToken = decoded.token;
    } catch (jwtErr) {
      // If not JWT, treat as raw bearer token
      rawToken = tokenString;
    }

    if (!rawToken) return null;

    const tokenH = hashToken(rawToken);

    // Find active session in database
    const session = await prisma.session.findFirst({
      where: {
        tokenHash: tokenH,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user || !session.user.isActive) {
      return null;
    }

    return {
      user: sanitizeUser(session.user),
      sessionId: session.id,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Invalidates a single session (Logout)
 */
export async function invalidateSession(tokenString) {
  if (!tokenString) return;

  try {
    let rawToken = tokenString;
    try {
      const decoded = jwt.verify(tokenString, env.AUTH_SECRET);
      rawToken = decoded.token;
    } catch (_) {}

    const tokenH = hashToken(rawToken);
    await prisma.session.deleteMany({
      where: { tokenHash: tokenH },
    });
  } catch (e) {
    // Non-fatal session deletion
  }
}

/**
 * Invalidates all sessions for a user (Password Change / Deactivation / Sign out all)
 */
export async function invalidateAllUserSessions(userId) {
  if (!userId) return;
  await prisma.session.deleteMany({
    where: { userId },
  });
}
