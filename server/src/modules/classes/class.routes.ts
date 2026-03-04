// ============================================
// Class Routes
// ============================================
import { Router } from 'express';
import { classController } from './class.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', classController.list);
router.post('/', authorize('FACULTY', 'ADMIN'), classController.create);
router.post('/join', classController.join);
router.get('/:id', classController.getById);
router.put('/:id', authorize('FACULTY', 'ADMIN'), classController.update);
router.post('/:id/leave', classController.leave);
router.get('/:id/members', classController.getMembers);
router.post('/:id/archive', authorize('FACULTY', 'ADMIN'), classController.archive);

export default router;
