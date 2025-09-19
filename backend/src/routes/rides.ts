import { Router } from "express";
import { RideController } from "../controllers/RideController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = Router();
const rideController = new RideController();

// Ride routes
router.get("/", optionalAuth, (req, res) => rideController.getAllRides(req, res));
router.get("/stats", optionalAuth, (req, res) => rideController.getRideStats(req, res));

// Protected ride routes (require authentication)
router.post("/", authenticateToken, (req, res) => rideController.createRide(req, res));
router.get("/user/:userId", authenticateToken, (req, res) => rideController.getUserRides(req, res));
router.get("/user/:userId/active", authenticateToken, (req, res) => rideController.getActiveRide(req, res));
router.put("/:rideId/complete", authenticateToken, (req, res) => rideController.completeRide(req, res));
router.put("/:rideId/cancel", authenticateToken, (req, res) => rideController.cancelRide(req, res));

export default router;