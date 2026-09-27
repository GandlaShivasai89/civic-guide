import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Require admin authentication
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/stats', AdminController.getAdminStats as any);
router.post('/services', AdminController.createService as any);
router.patch('/services/:id', AdminController.updateService as any);
router.post('/services/:id/verify', AdminController.verifyServiceAction as any);
router.get('/verification-history', AdminController.getVerificationHistory as any);

export default router;
