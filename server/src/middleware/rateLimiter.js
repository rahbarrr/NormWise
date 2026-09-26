/**
 * NormWise Rate Limiting Middleware (Phase 18)
 * Configurable in-memory sliding-window rate limiter.
 * Sections 20 & 21 adherence:
 * - Generic error message ("Too many attempts. Please try again later.")
 * - Protects auth, recommendation, upload, and admin endpoints
 * - Does not break normal procurement workflows
 */

import env from "../config/env.js";

const clientRequestStore = new Map();

// Periodic cleanup of expired rate limit windows (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of clientRequestStore.entries()) {
    if (now > data.resetTime) {
      clientRequestStore.delete(key);
    }
  }
}, 300000).unref();

/**
 * Creates a rate limiter middleware for a given category
 * @param {Object} options - { windowMs, max, keyPrefix }
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || env.RATE_LIMIT_WINDOW_MS;
  const max = options.max || env.RATE_LIMIT_API_MAX;
  const prefix = options.keyPrefix || "gen";

  return (req, res, next) => {
    // In test environment or test suite runs, only enforce if explicitly testing rate limits
    if ((env.isTest || process.env.NODE_ENV === "test") && !req.headers["x-test-rate-limit"]) {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || "127.0.0.1";
    const key = req.headers["x-test-rate-limit"]
      ? `test:${prefix}:${ip}`
      : `${prefix}:${ip}`;
    const now = Date.now();

    let client = clientRequestStore.get(key);

    if (!client || now > client.resetTime) {
      client = {
        count: 1,
        resetTime: now + windowMs,
      };
      clientRequestStore.set(key, client);
      return next();
    }

    client.count++;

    if (client.count > max) {
      return res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many attempts. Please try again later.",
        },
      });
    }

    next();
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_AUTH_MAX, // 10 attempts
  keyPrefix: "auth",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: env.RATE_LIMIT_API_MAX, // 120 requests
  keyPrefix: "api",
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 document uploads per min
  keyPrefix: "upload",
});
