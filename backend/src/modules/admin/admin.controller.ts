// ============================================
// Admin Controller
// ============================================
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import prisma from '../../config/database';
import { createAuditLog } from '../../middleware/auditLogger';

export const adminController = {
    // System Config
    async getConfig(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const settings = await prisma.systemConfig.findMany();
            const configMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
            res.json({ success: true, data: configMap });
        } catch (err) { next(err); }
    },

    async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { settings } = req.body;
            const updates = [];

            for (const [key, value] of Object.entries(settings)) {
                updates.push(prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: value as any, updatedBy: req.user!.sub },
                    create: { key, value: value as any, updatedBy: req.user!.sub },
                }));
            }

            await Promise.all(updates);
            await createAuditLog(req.user!.sub, 'System Config Updated', 'system', 'Updated system configuration settings');

            res.json({ success: true, message: 'Settings updated successfully' });
        } catch (err) { next(err); }
    },

    // Audit Logs
    async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page = '1', limit = '50', search, type, severity } = req.query as any;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where: any = {};
            if (type) where.actionType = type;
            if (severity) where.severity = severity;
            if (search) {
                where.OR = [
                    { action: { contains: search, mode: 'insensitive' } },
                    { details: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [logs, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    include: { user: { select: { email: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit),
                }),
                prisma.auditLog.count({ where }),
            ]);

            res.json({
                success: true,
                data: logs,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
            });
        } catch (err) { next(err); }
    },

    // System Analytics Overview
    async getAnalyticsOverview(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const [users, classes, assignments, submissions, auditLogs] = await Promise.all([
                prisma.user.count(),
                prisma.class.count(),
                prisma.assignment.count(),
                prisma.submission.count(),
                prisma.auditLog.count(),
            ]);

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentSubmissions = await prisma.submission.count({
                where: { submittedAt: { gte: thirtyDaysAgo } },
            });

            res.json({
                success: true,
                data: { users, classes, assignments, submissions, auditLogs, recentSubmissions }
            });
        } catch (err) { next(err); }
    },
};
