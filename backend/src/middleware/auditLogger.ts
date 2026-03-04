// ============================================
// Audit Logger Middleware
// ============================================
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

export function auditLog(action: string, actionType: string, severity: string = 'info') {
    return async (req: AuthRequest, _res: Response, next: NextFunction) => {
        try {
            // Log after the request completes
            const originalEnd = _res.end;
            _res.end = function (...args: any[]) {
                // Only log successful operations
                if (_res.statusCode < 400) {
                    prisma.auditLog.create({
                        data: {
                            userId: req.user?.sub || null,
                            action,
                            actionType,
                            details: `${req.method} ${req.originalUrl}`,
                            ipAddress: req.ip || req.socket.remoteAddress || null,
                            userAgent: req.headers['user-agent'] || null,
                            severity,
                        },
                    }).catch((err) => console.error('Audit log error:', err));
                }
                return originalEnd.apply(_res, args as any);
            };
            next();
        } catch {
            next();
        }
    };
}

// Direct audit log creation utility
export async function createAuditLog(
    userId: string | null,
    action: string,
    actionType: string,
    details: string,
    ipAddress?: string,
    severity: string = 'info'
) {
    try {
        await prisma.auditLog.create({
            data: { userId, action, actionType, details, ipAddress, severity },
        });
    } catch (err) {
        console.error('Audit log error:', err);
    }
}
