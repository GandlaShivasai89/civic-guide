import { Response } from 'express';
import { DatabaseAdapter } from '../utils/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SourceVerifier } from '../../../ai/verification/sourceVerifier.js';

export class AdminController {
  public static async getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const allServices = await DatabaseAdapter.getAllServices();
      const verified = allServices.filter(s => s.verification_status === 'VERIFIED').length;
      const pending = allServices.filter(s => s.verification_status === 'NEEDS_VERIFICATION').length;
      const conflicting = allServices.filter(s => s.verification_status === 'CONFLICTING').length;
      const totalVerifications = (await DatabaseAdapter.getVerificationHistory()).length;

      res.json({
        success: true,
        data: {
          totalServices: allServices.length,
          verifiedServices: verified,
          pendingReview: pending,
          conflictingSources: conflicting,
          totalAuditRecords: totalVerifications
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const serviceData = req.body;
      if (!serviceData.title || !serviceData.category) {
        res.status(400).json({ success: false, message: 'Title and category are required' });
        return;
      }

      // Check URL legitimacy if provided
      if (serviceData.official_url) {
        const urlValidation = SourceVerifier.verifyUrl(serviceData.official_url);
        if (!urlValidation.isOfficialGovDomain) {
          serviceData.verification_status = 'NEEDS_VERIFICATION';
        }
      }

      const created = await DatabaseAdapter.createService(serviceData);
      res.status(201).json({ success: true, message: 'Government service created', data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await DatabaseAdapter.updateService(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Government service not found' });
        return;
      }

      res.json({ success: true, message: 'Service updated successfully', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async verifyServiceAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, findings, source_url } = req.body;

      if (!status || !['VERIFIED', 'NEEDS_VERIFICATION', 'CONFLICTING'].includes(status)) {
        res.status(400).json({ success: false, message: 'Valid status is required (VERIFIED, NEEDS_VERIFICATION, CONFLICTING)' });
        return;
      }

      const verifiedBy = req.user?.id || 'usr-admin-1';
      const record = await DatabaseAdapter.verifyService(
        id,
        verifiedBy,
        status,
        findings || 'Official review completed by administrator.',
        source_url || 'https://services.india.gov.in'
      );

      res.json({ success: true, message: 'Verification status recorded', data: record });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getVerificationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { serviceId } = req.query;
      const records = await DatabaseAdapter.getVerificationHistory(serviceId as string);
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
