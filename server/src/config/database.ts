import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI = `mongodb+srv://alok722:${process.env.DB_PASSWORD}@cluster0.ok94uxx.mongodb.net/expense-tracker?retryWrites=true&w=majority&appName=Cluster0`;

export async function connectDatabase() {
  try {
    logger.info("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    logger.info("MongoDB connected successfully!");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  return mongoose.connection.readyState === 1;
}
