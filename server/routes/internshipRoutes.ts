import express from 'express';
import InternshipController from '../controllers/InternshipController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', InternshipController.getApplications);
router.post('/', InternshipController.addApplication);
router.get('/stats', InternshipController.getStats);
router.put('/:id', InternshipController.updateApplication);
router.patch('/:id/status', InternshipController.updateStatus);
router.delete('/:id', InternshipController.deleteApplication);

export default router;
