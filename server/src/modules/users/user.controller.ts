// ============================================
// User Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from './user.service';
import { AuthRequest } from '../../types';

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['student', 'faculty', 'admin']).optional(),
    status: z.enum(['active', 'suspended', 'pending']).optional(),
});

export const userController = {
    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page, limit, role, status, search } = req.query as any;
            const result = await userService.list({
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                role, status, search,
            });
            res.json({ success: true, data: result.users, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
        } catch (err) { next(err); }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await userService.getById(req.params.id);
            res.json({ success: true, data: user });
        } catch (err) { next(err); }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = updateUserSchema.parse(req.body);
            const user = await userService.update(req.params.id, data, req.user!.sub);
            res.json({ success: true, data: user });
        } catch (err) { next(err); }
    },

    async suspend(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await userService.suspend(req.params.id, req.user!.sub);
            res.json({ success: true, data: user });
        } catch (err) { next(err); }
    },

    async reactivate(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await userService.reactivate(req.params.id, req.user!.sub);
            res.json({ success: true, data: user });
        } catch (err) { next(err); }
    },

    async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { password } = z.object({ password: z.string().min(6) }).parse(req.body);
            const result = await userService.resetPassword(req.params.id, password, req.user!.sub);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async remove(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await userService.remove(req.params.id, req.user!.sub);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async bulkImport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const schema = z.array(z.object({ name: z.string(), email: z.string().email(), role: z.string(), password: z.string().optional() }));
            const users = schema.parse(req.body.users);
            const result = await userService.bulkImport(users, req.user!.sub);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async stats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const stats = await userService.getStats();
            res.json({ success: true, data: stats });
        } catch (err) { next(err); }
    },
};
