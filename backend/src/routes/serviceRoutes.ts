import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController.js';

const router = Router();

router.get('/search', ServiceController.searchServices);
router.get('/departments', ServiceController.getDepartments);
router.get('/categories', ServiceController.getCategories);
router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);
router.get('/:id/documents', ServiceController.getServiceDocuments);
router.get('/:id/steps', ServiceController.getServiceSteps);
router.get('/:id/sources', ServiceController.getServiceSources);

export default router;
