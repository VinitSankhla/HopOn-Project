import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export class AuthController {
    private userRepository = AppDataSource.getRepository(User);

    // Register new user
    async register(req: Request, res: Response) {
        try {
            const { loginId, name, email, phone, password } = req.body;

            // Check if user already exists
            const existingUserByLoginId = await this.userRepository.findOne({ where: { loginId } });
            if (existingUserByLoginId) {
                return res.status(400).json({
                    success: false,
                    message: "Login ID already exists"
                });
            }

            const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = new User();
            user.id = User.generateUserId();
            user.loginId = loginId;
            user.name = name;
            user.email = email;
            user.phone = phone;
            user.password = hashedPassword;
            user.totalRides = 0;
            user.profile = {
                avatar: null,
                preferences: {
                    notifications: true,
                    theme: 'auto'
                }
            };

            await this.userRepository.save(user);

            // Return response matching frontend expectation
            res.status(201).json({
                success: true,
                user: user.toJSON()
            });

        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Login user
    async login(req: Request, res: Response) {
        try {
            const { loginId, password } = req.body;

            // Find user by loginId
            const user = await this.userRepository.findOne({ where: { loginId } });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid login credentials"
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid login credentials"
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, loginId: user.loginId },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
            );

            // Return response matching frontend expectation
            res.json({
                success: true,
                user: user.toJSON(),
                token
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get current user
    async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                user: user.toJSON()
            });

        } catch (error) {
            console.error("Get current user error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Check if login ID is available
    async checkLoginIdAvailability(req: Request, res: Response) {
        try {
            const { loginId } = req.params;

            const user = await this.userRepository.findOne({ where: { loginId } });

            res.json({
                success: true,
                available: !user
            });

        } catch (error) {
            console.error("Check login ID availability error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Check if email is available
    async checkEmailAvailability(req: Request, res: Response) {
        try {
            const { email } = req.params;

            const user = await this.userRepository.findOne({ where: { email } });

            res.json({
                success: true,
                available: !user
            });

        } catch (error) {
            console.error("Check email availability error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}