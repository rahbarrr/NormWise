import { sendError } from "../utils/response.js";
import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.originalUrl}: ${err?.message || "Unknown error"}`);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return sendError(res, `Validation error: ${message}`, 400, err.errors);
  }

  // Prisma Client Known Request Error
  if (err.code === "P2002") {
    const fields = err.meta?.target ? err.meta.target.join(", ") : "field";
    return sendError(res, `A record with this ${fields} already exists.`, 409);
  }

  if (err.code === "P2025") {
    return sendError(res, "The requested record was not found.", 404);
  }

  // Generic fallback
  const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;
  const isProd = process.env.NODE_ENV === "production";
  const message = isProd && statusCode === 500
    ? "An unexpected internal server error occurred."
    : (err.message || "An unexpected internal server error occurred.");

  return sendError(res, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};
