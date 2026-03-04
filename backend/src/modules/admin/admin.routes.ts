// ============================================
// Admin Routes
// ============================================
import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Only Admins can access these routes
router.use(authenticate, authorize('ADMIN'));

router.get('/config', adminController.getConfig);
router.put('/config', adminController.updateConfig);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/analytics/overview', adminController.getAnalyticsOverview);

export default router;
