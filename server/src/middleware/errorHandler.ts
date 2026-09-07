import { Request, Response, NextFunction } from "express";
import { MongoError } from "mongodb";

export interface ApiError extends Error {
  statusCode?: number;
  code?: number | string;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error:", err);

  // MongoDB duplicate key error
  if (err.name === "MongoError" && err.code === 11000) {
    res.status(400).json({
      error: "Duplicate entry",
      message: "A record with this value already exists",
    });
    return;
  }

  // MongoDB connection error
  if (
    err.message?.includes("connection") ||
    err.message?.includes("ECONNREFUSED")
  ) {
    res.status(503).json({
      error: "Service unavailable",
      message: "Database connection error. Please try again later.",
    });
    return;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: "Validation error",
      message: err.message,
    });
    return;
  }

  // Cast errors (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      error: "Invalid ID format",
      message: "The provided ID is not valid",
    });
    return;
  }

  // Custom status code errors
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.name || "Error",
      message: err.message,
    });
    return;
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
  });
}

// Not found middleware
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.url} not found`,
  });
}

// Async error wrapper to catch async route errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

