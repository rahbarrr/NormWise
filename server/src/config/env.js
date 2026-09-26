/**
 * NormWise Environment Configuration & Validation (Phase 18)
 * Validates required environment variables at application startup.
 * Fails closed in production if critical security secrets are missing or weak.
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  APP_VERSION: process.env.APP_VERSION || "1.0.0-mvp",
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

  // Storage Settings
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads"),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "25", 10),

  // AI & External Service Providers
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || "local",
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
  EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY || "",

  LLM_PROVIDER: process.env.LLM_PROVIDER || "mock",
  LLM_MODEL: process.env.LLM_MODEL || "gpt-4o-mini",
  LLM_API_KEY: process.env.LLM_API_KEY || "",

  TRANSLATION_PROVIDER: process.env.TRANSLATION_PROVIDER || "local",
  TRANSLATION_MODEL: process.env.TRANSLATION_MODEL || "bhashini",
  TRANSLATION_API_KEY: process.env.TRANSLATION_API_KEY || "",

  OCR_ENABLED: process.env.OCR_ENABLED !== "false",

  // Retrieval & Algorithm Limits
  VECTOR_CANDIDATE_LIMIT: parseInt(process.env.VECTOR_CANDIDATE_LIMIT || "20", 10),
  LEXICAL_CANDIDATE_LIMIT: parseInt(process.env.LEXICAL_CANDIDATE_LIMIT || "30", 10),

  // Operational & Resource Limits
  LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT || "10mb",
  DOCUMENT_PROCESSING_TIMEOUT: parseInt(process.env.DOCUMENT_PROCESSING_TIMEOUT || "60000", 10),

  // Rate Limiting Config
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10),
  RATE_LIMIT_API_MAX: parseInt(process.env.RATE_LIMIT_API_MAX || "120", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 mins
};

export default env;
