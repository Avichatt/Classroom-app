// ============================================
// Class Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { classService } from './class.service';
import { AuthRequest } from '../../types';

const createClassSchema = z.object({
    name: z.string().min(1).max(255),
    section: z.string().optional(),
    subject: z.string().optional(),
    description: z.string().optional(),
    colorTheme: z.string().optional(),
});

export const classController = {
    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const classes = await classService.list(req.user!.sub, req.user!.role);
            res.json({ success: true, data: classes });
        } catch (err) { next(err); }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cls = await classService.getById(req.params.id);
            res.json({ success: true, data: cls });
        } catch (err) { next(err); }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = createClassSchema.parse(req.body);
            const cls = await classService.create(data, req.user!.sub);
            res.status(201).json({ success: true, data: cls });
        } catch (err) { next(err); }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = createClassSchema.partial().parse(req.body);
            const cls = await classService.update(req.params.id, data, req.user!.sub);
            res.json({ success: true, data: cls });
        } catch (err) { next(err); }
    },

    async join(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { code } = z.object({ code: z.string().min(1) }).parse(req.body);
            const cls = await classService.join(code, req.user!.sub);
            res.json({ success: true, data: cls });
        } catch (err) { next(err); }
    },

    async leave(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await classService.leave(req.params.id, req.user!.sub);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const members = await classService.getMembers(req.params.id);
            res.json({ success: true, data: members });
        } catch (err) { next(err); }
    },

    async archive(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cls = await classService.archive(req.params.id, req.user!.sub);
            res.json({ success: true, data: cls });
        } catch (err) { next(err); }
    },
};
