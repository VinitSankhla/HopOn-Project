import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from '../src/config/database';

// Import routes
import authRoutes from '../src/routes/auth';
import bikeRoutes from '../src/routes/bikes';
import rideRoutes from '../src/routes/rides';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors(
  {
    origin:['https://main.d2v2y6uuqi1nje.amplifyapp.com/']
  }
));
app.use(express.json({ limit: "10mb" }));

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

// Initialize database connection
let dbInitialized = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Initialize database only once
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    // Handle the request with Express
    return app(req as any, res as any);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      //@ts-ignore:ignore this
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};