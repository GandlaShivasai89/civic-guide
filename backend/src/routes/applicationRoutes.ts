import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Tracked applications
router.get('/', optionalAuth as any, ApplicationController.getApplications as any);
router.post('/', optionalAuth as any, ApplicationController.createApplication as any);
router.patch('/:id', optionalAuth as any, ApplicationController.updateApplication as any);
router.delete('/:id', optionalAuth as any, ApplicationController.deleteApplication as any);
router.patch('/documents/:docId', optionalAuth as any, ApplicationController.updateDocumentStatus as any);

// Saved services / Bookmarks
router.get('/saved', optionalAuth as any, ApplicationController.getSavedServices as any);
router.post('/saved/toggle', optionalAuth as any, ApplicationController.toggleSavedService as any);

export default router;
