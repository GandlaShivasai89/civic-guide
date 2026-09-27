import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth as any, ReminderController.getReminders as any);
router.post('/', optionalAuth as any, ReminderController.createReminder as any);
router.patch('/:id', optionalAuth as any, ReminderController.toggleReminder as any);
router.delete('/:id', optionalAuth as any, ReminderController.deleteReminder as any);

export default router;
