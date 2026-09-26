/**
 * NormWise Admin User Management & Security Routes (Phase 18)
 */
import { Router } from "express";
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  getSecurityCheck,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/authorizationMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = Router();

// User management endpoints (requires USER_MANAGE permission)
router.get("/users", requireAuth, requirePermission(PERMISSIONS.USER_MANAGE), listUsers);
router.put("/users/:id/role", requireAuth, requirePermission(PERMISSIONS.USER_MANAGE), updateUserRole);
router.put("/users/:id/status", requireAuth, requirePermission(PERMISSIONS.USER_MANAGE), updateUserStatus);

// Security configuration check endpoint
router.get("/security/check", requireAuth, requirePermission(PERMISSIONS.USER_MANAGE), getSecurityCheck);

export default router;
