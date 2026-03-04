// ============================================
// Grade Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { gradeService } from './grade.service';
import { AuthRequest } from '../../types';

const gradeSchema = z.object({
    score: z.number().min(0),
    feedback: z.string().optional(),
    rubricScores: z.array(z.object({ rubricId: z.string(), score: z.number().min(0) })).optional(),
});

export const gradeController = {
    async grade(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = gradeSchema.parse(req.body);
            const grade = await gradeService.gradeSubmission(req.params.submissionId, req.user!.sub, data);
            res.json({ success: true, data: grade });
        } catch (err) { next(err); }
    },

    async getGradebook(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const gradebook = await gradeService.getGradebook(req.params.classId, req.user!.sub, req.user!.role);
            res.json({ success: true, data: gradebook });
        } catch (err) { next(err); }
    },
};
