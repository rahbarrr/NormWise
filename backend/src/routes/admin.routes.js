import express from "express";
import multer from "multer";
import { standardsImportController } from "../controllers/standardsImport.controller.js";
import { getSystemHealth } from "../controllers/adminMonitoring.controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission, requireRole } from "../middleware/authorizationMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// System Health & Monitoring endpoint (Section 19)
router.get(
  "/system/health",
  requireAuth,
  requireRole("ADMIN"),
  getSystemHealth
);

// Configure multer for memory storage (capped at 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = [".csv", ".json", ".xlsx", ".xls"];
    const ext = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type ${ext}. Allowed: .csv, .json, .xlsx, .xls`), false);
    }
  },
});

// Admin Import Routes (Protected with DATASET_IMPORT permission)
router.post(
  "/standards/import",
  requireAuth,
  requirePermission(PERMISSIONS.DATASET_IMPORT),
  upload.single("file"),
  standardsImportController.handleImport
);

router.post(
  "/standards/validate",
  requireAuth,
  requirePermission(PERMISSIONS.DATASET_IMPORT),
  standardsImportController.validate
);

router.get("/imports", standardsImportController.getImports);
router.get("/imports/:id", standardsImportController.getImportById);
router.get("/imports/:id/report", standardsImportController.getImportReport);

export default router;
