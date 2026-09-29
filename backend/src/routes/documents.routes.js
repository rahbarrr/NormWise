import { Router } from "express";
import multer from "multer";
import * as docController from "../controllers/documents.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Configure Multer for in-memory buffer handling with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const originalName = file.originalname || "";
    const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
    if (ext === ".pdf" || ext === ".docx") {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Only .pdf and .docx are permitted."), false);
    }
  },
});

// Multer error handling wrapper
const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: { message: "File exceeds maximum allowed size of 10 MB." },
        });
      }
      return res.status(400).json({
        success: false,
        error: { message: err.message },
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: { message: err.message },
      });
    }
    next();
  });
};

// 1. Upload API
router.post("/upload", handleUpload, docController.uploadDocument);

// 2. Document Processing API
router.post("/:id/process", docController.processDocumentHandler);

// 3. Document Status API
router.get("/:id/status", docController.getDocumentStatus);

// 4. Requirements Review & Edit APIs
router.get("/:id/requirements", docController.getDocumentRequirements);
router.patch(
  "/:id/requirements",
  validate(docController.updateRequirementsSchema),
  docController.updateDocumentRequirements
);

// 5. Forward Document to Recommendation Engine
router.post("/:id/recommend", docController.generateRecommendationFromDocument);

// 6. Document Metadata inspection and status update
router.get("/:id", docController.getDocumentById);
router.patch(
  "/:id",
  validate(docController.updateDocumentStatusSchema),
  docController.updateDocumentStatus
);

export default router;
