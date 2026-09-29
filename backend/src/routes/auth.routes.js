/**
 * NormWise Auth Routes (Phase 18)
 */
import { Router } from "express";
import {
  login,
  logout,
  getMe,
  getCsrfTokenEndpoint,
  changePassword,
  register,
  listUsers,
  updateUserRole,
  updateUserStatus,
  getSecurityCheck,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission, requireRole } from "../middleware/authorizationMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = Router();

// Public auth endpoints
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.get("/csrf", getCsrfTokenEndpoint);

// Authenticated session endpoints
router.get("/me", requireAuth, getMe);
router.post("/change-password", requireAuth, authRateLimiter, changePassword);

// Registration (Development or Admin only)
router.post("/register", authRateLimiter, register);

export default router;
