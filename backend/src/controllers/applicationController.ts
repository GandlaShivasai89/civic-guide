import { Response } from 'express';
import { DatabaseAdapter } from '../utils/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ApplicationController {
  public static async getApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const apps = await DatabaseAdapter.getUserApplications(userId);
      res.json({ success: true, count: apps.length, data: apps });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { service_id, application_reference_number, applied_on, status, next_action, notes } = req.body;

      if (!service_id) {
        res.status(400).json({ success: false, message: 'Service ID is required' });
        return;
      }

      const service = await DatabaseAdapter.getServiceById(service_id);
      if (!service) {
        res.status(404).json({ success: false, message: 'Government service not found' });
        return;
      }

      const newApp = await DatabaseAdapter.createApplication({
        user_id: userId,
        service_id,
        service_title: service.title,
        application_reference_number: application_reference_number || '',
        applied_on: applied_on || new Date().toISOString().split('T')[0],
        status: status || 'DRAFT',
        next_action: next_action || 'Prepare required documentation',
        notes: notes || '',
        submission_portal_url: service.official_url
      });

      res.status(201).json({ success: true, message: 'Application tracker created', data: newApp });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { id } = req.params;
      const { status, next_action, notes, application_reference_number } = req.body;

      const updated = await DatabaseAdapter.updateApplication(id, userId, {
        status,
        next_action,
        notes,
        application_reference_number
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Application updated successfully', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async deleteApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { id } = req.params;

      const deleted = await DatabaseAdapter.deleteApplication(id, userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Application removed from tracker' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateDocumentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      const { status, notes } = req.body;

      if (!['NOT_READY', 'READY', 'UPLOADED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status. Must be NOT_READY, READY, or UPLOADED.' });
        return;
      }

      const updatedDoc = await DatabaseAdapter.updateApplicationDocStatus(docId, status, notes);
      if (!updatedDoc) {
        res.status(404).json({ success: false, message: 'Document checklist item not found' });
        return;
      }

      res.json({ success: true, data: updatedDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getSavedServices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const saved = await DatabaseAdapter.getSavedServices(userId);
      res.json({ success: true, count: saved.length, data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async toggleSavedService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'usr-citizen-1';
      const { serviceId } = req.body;

      if (!serviceId) {
        res.status(400).json({ success: false, message: 'Service ID is required' });
        return;
      }

      const result = await DatabaseAdapter.toggleSavedService(userId, serviceId);
      res.json({ success: true, isSaved: result.isSaved });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
