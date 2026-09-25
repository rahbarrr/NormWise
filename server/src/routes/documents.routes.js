import { Router } from "express";
import * as docController from "../controllers/documents.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post(
  "/",
  validate(docController.createDocumentSchema),
  docController.createDocument
);
router.get("/:id", docController.getDocumentById);
router.patch(
  "/:id",
  validate(docController.updateDocumentStatusSchema),
  docController.updateDocumentStatus
);

export default router;
