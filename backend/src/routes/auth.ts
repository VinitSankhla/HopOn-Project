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
router.get("/check-login-id/:loginId", (req, res) => authController.checkLoginIdAvailability(req, res));
router.get("/check-email/:email", (req, res) => authController.checkEmailAvailability(req, res));

export default router;