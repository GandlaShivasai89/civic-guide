import { Response } from 'express';
import { DatabaseAdapter } from '../utils/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ReminderController {
  public static async getReminders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const reminders = await DatabaseAdapter.getReminders(userId);
      res.json({ success: true, count: reminders.length, data: reminders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { title, reminder_date, service_id, service_title, notes } = req.body;

      if (!title || !reminder_date) {
        res.status(400).json({ success: false, message: 'Title and reminder date are required' });
        return;
      }

      const reminder = await DatabaseAdapter.createReminder({
        user_id: userId,
        service_id,
        service_title,
        title,
        reminder_date,
        notes
      });

      res.status(201).json({ success: true, message: 'Reminder created', data: reminder });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async toggleReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { id } = req.params;
      const { is_completed } = req.body;

      const updated = await DatabaseAdapter.updateReminder(id, userId, Boolean(is_completed));
      if (!updated) {
        res.status(404).json({ success: false, message: 'Reminder not found or unauthorized' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async deleteReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { id } = req.params;

      const deleted = await DatabaseAdapter.deleteReminder(id, userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Reminder not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Reminder deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
