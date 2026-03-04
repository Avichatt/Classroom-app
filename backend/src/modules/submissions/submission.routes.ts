// ============================================
// Submission Routes
// ============================================
import { Router } from 'express';
import { submissionController } from './submission.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Student submits an assignment
router.post('/assignment/:assignmentId', authorize('STUDENT'), submissionController.submit);

// Faculty views submissions for an assignment
router.get('/assignment/:assignmentId', authorize('FACULTY', 'ADMIN'), submissionController.getForAssignment);

// View a specific submission
router.get('/:id', submissionController.getById);

export default router;
