// ============================================
// Grade Routes
// ============================================
import { Router } from 'express';
import { gradeController } from './grade.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/submission/:submissionId', authorize('FACULTY'), gradeController.grade);
router.get('/class/:classId/gradebook', authorize('FACULTY', 'ADMIN'), gradeController.getGradebook);

export default router;
