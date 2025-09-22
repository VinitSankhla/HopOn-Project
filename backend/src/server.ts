import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
import fs from "fs"

// Import routes
import authRoutes from "./routes/auth";
import bikeRoutes from "./routes/bikes";
import rideRoutes from "./routes/rides";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));



app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HopOn Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/rides", rideRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 HopOn Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("📝 SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📝 SIGINT signal received: closing HTTP server");
  process.exit(0);
});

startServer();
