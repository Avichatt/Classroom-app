// ============================================
// Submission Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { submissionService } from './submission.service';
import { AuthRequest } from '../../types';

const submitSchema = z.object({
    textEntry: z.string().optional(),
    files: z.array(z.object({
        fileName: z.string(),
        fileKey: z.string(),
        fileUrl: z.string().optional(),
        fileSize: z.number(),
        fileType: z.string(),
    })).optional(),
});

export const submissionController = {
    async submit(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = submitSchema.parse(req.body);
            const result = await submissionService.submit(req.params.assignmentId, req.user!.sub, data);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async getForAssignment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const submissions = await submissionService.getForAssignment(req.params.assignmentId, req.user!.sub, req.user!.role);
            res.json({ success: true, data: submissions });
        } catch (err) { next(err); }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const submission = await submissionService.getById(req.params.id, req.user!.sub, req.user!.role);
            res.json({ success: true, data: submission });
        } catch (err) { next(err); }
    },
};
