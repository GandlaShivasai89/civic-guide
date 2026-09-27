import { Router } from 'express';
import { AiController } from '../controllers/aiController.js';

const router = Router();

router.post('/ask', AiController.ask);
router.post('/explain', AiController.explain);
router.post('/guidance', AiController.generateGuidance);

export default router;
