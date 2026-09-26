import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import env from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { csrfProtection } from "./middleware/csrfMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

// Request ID and Structured Logging (Phase 19)
app.use(requestLogger);

// Security Headers (Section 23 & 44)
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", env.CLIENT_URL],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (Section 23: Specific origin with credentials)
const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!env.isProduction) {
        return callback(null, true); // Dev-friendly fallback
      }
      return callback(new Error("CORS policy violation. Origin not allowed."));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-XSRF-Token",
      "X-Requested-With",
    ],
  })
);

// Cookie & Body Parsers
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Anti-CSRF protection on state-changing requests
app.use("/api", csrfProtection);

// Mount REST API
app.use("/api", apiRouter);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
