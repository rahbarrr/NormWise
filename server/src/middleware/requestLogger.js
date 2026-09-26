/**
 * NormWise Request ID & Structured Logging Middleware (Phase 19)
 *
 * Requirements:
 * - Generates or validates client-supplied X-Request-ID
 * - Emits structured log entries: timestamp, level, service, requestId, method, route, status, duration
 * - Never logs passwords, tokens, API keys, or raw confidential document bodies
 * - Updates internal telemetry metrics
 */

import crypto from "node:crypto";
import metricsService from "../services/metricsService.js";

// Validate client-provided X-Request-ID: alphanumeric, hyphens, underscores up to 64 chars
const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export function requestLogger(req, res, next) {
  const incomingId = req.headers["x-request-id"];
  const requestId = (typeof incomingId === "string" && SAFE_REQUEST_ID_REGEX.test(incomingId))
    ? incomingId
    : crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);

  const startHrTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endHrTime = process.hrtime.bigint();
    const durationMs = Number(endHrTime - startHrTime) / 1e6;
    const roundedDurationMs = Math.round(durationMs * 10) / 10;
    const status = res.statusCode;

    // Determine log level
    let level = "INFO";
    if (status >= 500) {
      level = "ERROR";
    } else if (status >= 400) {
      level = "WARN";
    }

    // Sanitize route from potential long queries or tokens
    const route = req.baseUrl || req.path || req.originalUrl?.split("?")[0] || "/";

    // Structured Log Output
    const logLine = `${new Date().toISOString()} [${level}] service=normwise-api requestId=${requestId} method=${req.method} route=${route} status=${status} duration=${roundedDurationMs}ms`;

    if (level === "ERROR") {
      console.error(logLine);
    } else if (level === "WARN") {
      console.warn(logLine);
    } else if (process.env.NODE_ENV !== "test" || route === "/api/recommend") {
      // In production and dev, log structured entry; suppress noisy test logs
      console.log(logLine);
    }

    // Record internal metrics
    metricsService.recordRequest({
      method: req.method,
      route,
      status,
      durationMs: roundedDurationMs,
    });

    if (status >= 400) {
      metricsService.recordError({
        requestId,
        method: req.method,
        route,
        status,
        message: res.statusMessage || `HTTP ${status}`,
      });
    }

    // Record specific feature processing times
    if (route.includes("/recommend") && req.method === "POST" && status < 400) {
      metricsService.recordRecommendation(roundedDurationMs);
    } else if (route.includes("/documents") && req.method === "POST") {
      metricsService.recordDocument(roundedDurationMs, status < 400);
    }
  });

  next();
}

export default requestLogger;
