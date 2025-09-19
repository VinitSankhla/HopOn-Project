import { Router } from "express";
import { BikeController } from "../controllers/BikeController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = Router();
const bikeController = new BikeController();

// Bike routes
router.get("/", optionalAuth, (req, res) => bikeController.getAllBikes(req, res));
router.get("/location/:location", optionalAuth, (req, res) => bikeController.getAvailableBikes(req, res));
router.get("/stats", optionalAuth, (req, res) => bikeController.getBikeStats(req, res));
router.get("/:bikeId", optionalAuth, (req, res) => bikeController.getBikeById(req, res));

// Protected bike routes (require authentication)
router.post("/:bikeId/book", authenticateToken, (req, res) => bikeController.bookBike(req, res));
router.post("/:bikeId/return", authenticateToken, (req, res) => bikeController.returnBike(req, res));

export default router;