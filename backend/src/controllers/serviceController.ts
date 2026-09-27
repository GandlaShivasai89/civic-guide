import { Request, Response } from 'express';
import { DatabaseAdapter } from '../utils/db.js';

export class ServiceController {
  public static async getServices(req: Request, res: Response): Promise<void> {
    try {
      const { category, state, audience, mode, departmentId } = req.query;
      const services = await DatabaseAdapter.getAllServices({
        category: category as string,
        state: state as string,
        audience: audience as string,
        mode: mode as string,
        departmentId: departmentId as string
      });

      res.json({
        success: true,
        count: services.length,
        data: services
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await DatabaseAdapter.getServiceById(id);

      if (!service) {
        res.status(404).json({ success: false, message: 'Government service not found' });
        return;
      }

      res.json({
        success: true,
        data: service
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async searchServices(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, state, audience, mode } = req.query;
      const query = (q as string) || '';

      const results = await DatabaseAdapter.searchServices(query, {
        category: category as string,
        state: state as string,
        audience: audience as string,
        mode: mode as string
      });

      res.json({
        success: true,
        query,
        count: results.length,
        data: results
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getServiceDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await DatabaseAdapter.getServiceById(id);
      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({
        success: true,
        serviceTitle: service.title,
        documents: service.documents || []
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getServiceSteps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await DatabaseAdapter.getServiceById(id);
      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({
        success: true,
        serviceTitle: service.title,
        steps: service.steps || []
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getServiceSources(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await DatabaseAdapter.getServiceById(id);
      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({
        success: true,
        serviceTitle: service.title,
        lastVerified: service.last_verified,
        verificationStatus: service.verification_status,
        sources: service.sources || []
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const depts = await DatabaseAdapter.getDepartments();
      res.json({ success: true, count: depts.length, data: depts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getCategories(req: Request, res: Response): Promise<void> {
    const categories = [
      'Identity & Citizenship',
      'Civil Registration',
      'Transport & Driving',
      'Revenue & Certificates',
      'Welfare & Schemes',
      'Education & Scholarships',
      'Business & Taxation',
      'Land & Property'
    ];
    res.json({ success: true, data: categories });
  }
}
