import express from 'express';
import FocusController from '../controllers/FocusController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/start', FocusController.startSession);
router.patch('/:id/end', FocusController.endSession);
router.get('/history', FocusController.getHistory);
router.get('/stats', FocusController.getStats);
router.delete('/:id', FocusController.deleteSession);

export default router;
