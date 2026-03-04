// ============================================
// Authentication Middleware
// ============================================
import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest, AppError } from '../types';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'Authentication required');
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error: any) {
        if (error instanceof AppError) return next(error);
        next(new AppError(401, 'Invalid or expired token'));
    }
}

export function authorize(...roles: string[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'Insufficient permissions'));
        }
        next();
    };
}
