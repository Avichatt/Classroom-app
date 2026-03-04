// ============================================
// Global Error Handler
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // Prisma known errors
    if ((err as any).code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: 'A record with this value already exists.',
        });
    }

    if ((err as any).code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'Record not found.',
        });
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: (err as any).errors,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
    }

    console.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        error: env.isDev ? err.message : 'Internal server error',
    });
}
