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
            const { name, email, phone, gender, password } = req.body;

            // Check if user already exists by email
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
            user.name = name;
            user.email = email;
            user.phone = phone;
            user.gender = gender;
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
        console.log (req.body)
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await this.userRepository.findOne({ where: { email } });
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
                { userId: user.id, email: user.email },
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

    // Delete all users (for development/testing only)
    async deleteAllUsers(req: Request, res: Response) {
        try {
            // Force delete all users, handling foreign key constraints
            await this.userRepository.query('DELETE FROM users CASCADE');
            res.json({
                success: true,
                message: "All users deleted successfully"
            });
        } catch (error) {
            console.error("Delete all users error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Database management endpoint
    async manageDatabaseTable(req: Request, res: Response) {
        try {
            const { action, table } = req.body;

            switch (action) {
                case 'drop_users_table':
                    await this.userRepository.query('DROP TABLE IF EXISTS users CASCADE');
                    return res.json({ success: true, message: "Users table dropped successfully" });

                case 'reset_database':
                    await this.userRepository.query('DELETE FROM rides CASCADE');
                    await this.userRepository.query('DELETE FROM users CASCADE');
                    return res.json({ success: true, message: "Database reset successfully" });

                case 'show_users':
                    const users = await this.userRepository.find();
                    return res.json({ success: true, users });

                default:
                    return res.status(400).json({ success: false, message: "Unknown action" });
            }
        } catch (error) {
            console.error("Database management error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}