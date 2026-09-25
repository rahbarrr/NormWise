import "dotenv/config";
import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("Connected to PostgreSQL database successfully via Prisma.");

    const server = app.listen(PORT, () => {
      console.log(`NormWise Backend API running on http://localhost:${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("Disconnected from PostgreSQL. Server shut down cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    process.exit(1);
  }
}

startServer();
