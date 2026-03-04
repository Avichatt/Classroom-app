// ============================================
// Assignment Routes
// ============================================
import { Router } from 'express';
import { assignmentController } from './assignment.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Global assignment overview for Admin
router.get('/overview', authorize('ADMIN'), assignmentController.overview);

// Student listing of their assignments
router.get('/my-assignments', assignmentController.listForStudent);

// Class-specific assignments
router.get('/class/:classId', assignmentController.listByClass);
router.post('/class/:classId', authorize('FACULTY', 'ADMIN'), assignmentController.create);

// Individual assignment
router.get('/:id', assignmentController.getById);
router.put('/:id', authorize('FACULTY', 'ADMIN'), assignmentController.update);
router.delete('/:id', authorize('FACULTY', 'ADMIN'), assignmentController.remove);

export default router;
