// ============================================
// Assignment Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { assignmentService } from './assignment.service';
import { AuthRequest } from '../../types';

const createSchema = z.object({
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    instructions: z.string().optional(),
    points: z.number().min(0).max(1000).optional(),
    dueDate: z.string().optional(),
    dueTime: z.string().optional(),
    topic: z.string().optional(),
    allowLate: z.boolean().optional(),
    latePenaltyPct: z.number().min(0).max(100).optional(),
    allowedFormats: z.array(z.string()).optional(),
    maxFileSizeMb: z.number().min(1).max(200).optional(),
    rubrics: z.array(z.object({ criterion: z.string(), maxPoints: z.number() })).optional(),
});

export const assignmentController = {
    async listByClass(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const assignments = await assignmentService.listByClass(req.params.classId);
            res.json({ success: true, data: assignments });
        } catch (err) { next(err); }
    },

    async listForStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const assignments = await assignmentService.listForStudent(req.user!.sub);
            res.json({ success: true, data: assignments });
        } catch (err) { next(err); }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const assignment = await assignmentService.getById(req.params.id);
            res.json({ success: true, data: assignment });
        } catch (err) { next(err); }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = createSchema.parse(req.body);
            const assignment = await assignmentService.create(req.params.classId, data, req.user!.sub);
            res.status(201).json({ success: true, data: assignment });
        } catch (err) { next(err); }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = createSchema.partial().parse(req.body);
            const assignment = await assignmentService.update(req.params.id, data, req.user!.sub);
            res.json({ success: true, data: assignment });
        } catch (err) { next(err); }
    },

    async remove(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await assignmentService.remove(req.params.id, req.user!.sub);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async overview(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await assignmentService.getOverview();
            res.json({ success: true, data });
        } catch (err) { next(err); }
    },
};
