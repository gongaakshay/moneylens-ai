import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";
import recurringRoutes from "./routes/recurring";
import insightsRoutes from "./routes/insights";
import {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
} from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger, stream } from "./config/logger";
import { startKeepAlive } from "./utils/keepAlive";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Custom morgan format for nice, readable logs
morgan.token("status-color", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return "\x1b[31m"; // Red
  if (status >= 400) return "\x1b[33m"; // Yellow
  if (status >= 300) return "\x1b[36m"; // Cyan
  if (status >= 200) return "\x1b[32m"; // Green
  return "\x1b[0m"; // Reset
});

morgan.token("reset-color", () => "\x1b[0m");

// Nice formatted HTTP logger
app.use(
  morgan(
    ":status-color:method :url :status:reset-color - :response-time ms - :res[content-length] bytes",
    { stream }
  )
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/insights", insightsRoutes);

// Health check with database status
app.get("/api/health", async (_req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  res.json({
    status: dbHealthy ? "ok" : "degraded",
    database: dbHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function bootstrap() {
  try {
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);

      // Start keep-alive mechanism for Render free tier
      startKeepAlive();
    });

    // Graceful shutdown handlers
    process.on("SIGINT", async () => {
      logger.warn("SIGINT received. Closing gracefully...");
      await disconnectDatabase();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.warn("SIGTERM received. Closing gracefully...");
      await disconnectDatabase();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Only run bootstrap if this file is executed directly (not imported for testing)
if (require.main === module) {
  bootstrap();
}

// Export app for testing
export default app;
