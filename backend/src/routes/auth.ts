import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// Authentication routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", authenticateToken, (req, res) => authController.getCurrentUser(req, res));

// Validation routes
router.get("/check-email/:email", (req, res) => authController.checkEmailAvailability(req, res));

// Development/testing routes
router.delete("/users/all", (req, res) => authController.deleteAllUsers(req, res));
router.post("/manage-db", (req, res) => authController.manageDatabaseTable(req, res));

export default router;