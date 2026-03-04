// ============================================
// User Routes
// ============================================
import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), userController.list);
router.get('/stats', authorize('ADMIN'), userController.stats);
router.get('/:id', authorize('ADMIN'), userController.getById);
router.patch('/:id', authorize('ADMIN'), userController.update);
router.delete('/:id', authorize('ADMIN'), userController.remove);
router.post('/:id/suspend', authorize('ADMIN'), userController.suspend);
router.post('/:id/reactivate', authorize('ADMIN'), userController.reactivate);
router.post('/:id/reset-password', authorize('ADMIN'), userController.resetPassword);
router.post('/bulk-import', authorize('ADMIN'), userController.bulkImport);

export default router;
