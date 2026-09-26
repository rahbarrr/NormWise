/**
 * NormWise Environment Configuration & Validation (Phase 18)
 * Validates required environment variables at application startup.
 * Fails closed in production if critical security secrets are missing or weak.
 */
import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";

// 1. Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "[SecurityStartupError] Critical environment variable DATABASE_URL is missing. Server cannot start."
  );
}

// 2. Validate AUTH_SECRET / JWT_SECRET
let authSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
if (!authSecret) {
  if (isProduction) {
    throw new Error(
      "[SecurityStartupError] Critical environment variable AUTH_SECRET is required in production mode. " +
      "Must be a high-entropy secret string at least 32 characters long."
    );
  }
  // In development and testing, fall back with explicit notification
  authSecret = "normwise-dev-insecure-fallback-secret-minimum-32-characters";
} else if (isProduction && authSecret.length < 32) {
  throw new Error(
    "[SecurityStartupError] AUTH_SECRET in production must be at least 32 characters long."
  );
}

export const env = {
  NODE_ENV,
  isProduction,
  isTest,
  PORT: parseInt(process.env.PORT || "5001", 10),
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: authSecret,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Cookie Security Settings
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "normwise_session",
  AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE !== undefined
    ? process.env.AUTH_COOKIE_SECURE === "true"
    : isProduction,
  AUTH_COOKIE_SAME_SITE: (process.env.AUTH_COOKIE_SAME_SITE || "lax").toLowerCase(),

  // Token Durations
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "1h",
  SESSION_EXPIRY_DAYS: parseInt(process.env.SESSION_EXPIRY_DAYS || "7", 10),

  // Rate Limiting Config
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10),
  RATE_LIMIT_API_MAX: parseInt(process.env.RATE_LIMIT_API_MAX || "120", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 mins
};

export default env;
