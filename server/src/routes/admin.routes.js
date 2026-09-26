import express from "express";
import multer from "multer";
import { standardsImportController } from "../controllers/standardsImport.controller.js";

const router = express.Router();

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

// Admin Import Routes
router.post(
  "/standards/import",
  upload.single("file"),
  standardsImportController.handleImport
);

router.post("/standards/validate", standardsImportController.validate);

router.get("/imports", standardsImportController.getImports);
router.get("/imports/:id", standardsImportController.getImportById);
router.get("/imports/:id/report", standardsImportController.getImportReport);

export default router;
