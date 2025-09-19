import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: {
        userId: string;
        loginId: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        req.user = decoded;
        next();
    });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err: any, decoded: any) => {
        if (!err) {
            req.user = decoded;
        }
        next();
    });
};