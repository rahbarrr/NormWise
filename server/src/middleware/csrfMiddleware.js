/**
 * NormWise CSRF Protection Middleware (Phase 18)
 * Section 24: Protects state-changing requests when cookie authentication is utilized.
 */

import env from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Validates CSRF token on state-changing requests when HTTP-only cookie authentication is used
 */
export function csrfProtection(req, res, next) {
  // Safe HTTP methods are exempt
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // If request uses Bearer token authorization header, it is not vulnerable to ambient browser CSRF
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return next();
  }

  // Exempt auth lifecycle endpoints
  if (req.path.endsWith("/login") || req.path.endsWith("/logout") || req.path.endsWith("/csrf")) {
    return next();
  }

  // If in test environment, bypass unless testing CSRF explicitly
  if (env.isTest && !req.headers["x-test-csrf-enforce"]) {
    return next();
  }

  // If authenticated via cookie, check CSRF token
  const hasAuthCookie = req.cookies && req.cookies[env.AUTH_COOKIE_NAME];
  if (hasAuthCookie) {
    const clientCsrfToken = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"];
    const cookieCsrfToken = req.cookies["normwise_csrf"];

    if (!clientCsrfToken || !cookieCsrfToken || clientCsrfToken !== cookieCsrfToken) {
      return res.status(403).json({
        error: {
          code: "CSRF_ERROR",
          message: "Invalid or missing CSRF token.",
        },
      });
    }
  }

  next();
}
