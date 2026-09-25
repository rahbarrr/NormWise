import { Router } from "express";
import standardsRoutes from "./standards.routes.js";
import recommendationsRoutes from "./recommendations.routes.js";
import documentsRoutes from "./documents.routes.js";
import { handleRecommend } from "../controllers/recommendEngine.controller.js";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "NormWise API",
    database: "PostgreSQL",
    orm: "Prisma",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Resource routes
apiRouter.post("/recommend", handleRecommend);
apiRouter.use("/standards", standardsRoutes);
apiRouter.use("/recommendations", recommendationsRoutes);
apiRouter.use("/documents", documentsRoutes);

export default apiRouter;
