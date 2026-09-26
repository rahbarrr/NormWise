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
      console.log(`Liveness health check: http://localhost:${PORT}/api/health`);
      console.log(`Readiness health check: http://localhost:${PORT}/api/health/ready`);
      console.log(`System version: http://localhost:${PORT}/api/version`);
    });

    // Track active HTTP connections for graceful draining
    const activeSockets = new Set();
    server.on("connection", (socket) => {
      activeSockets.add(socket);
      socket.on("close", () => activeSockets.delete(socket));
    });

    let isShuttingDown = false;

    // Graceful shutdown handler (Section 14)
    const shutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\n[Shutdown] Received ${signal}. Draining active connections and shutting down gracefully...`);

      // Set force termination safety timeout (10 seconds)
      const forceTimeout = setTimeout(() => {
        console.error("[Shutdown] Forcefully terminating remaining active connections after timeout.");
        for (const socket of activeSockets) {
          socket.destroy();
        }
        process.exit(1);
      }, 10000);
      forceTimeout.unref();

      // Stop accepting new incoming requests
      server.close(async (err) => {
        if (err) {
          console.error("[Shutdown] Error during server close:", err);
        }

        try {
          // Disconnect Prisma and release DB connection pool
          await prisma.$disconnect();
          console.log("[Shutdown] PostgreSQL connection pool disconnected cleanly.");
        } catch (dbErr) {
          console.error("[Shutdown] Error disconnecting Prisma:", dbErr);
        }

        clearTimeout(forceTimeout);
        console.log("[Shutdown] NormWise backend shut down cleanly.");
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
