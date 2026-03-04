// ============================================
// Upload Routes
// ============================================
import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/presign', uploadController.presign);
router.delete('/', uploadController.deleteFile);

export default router;
