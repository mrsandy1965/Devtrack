import express from 'express';
import HabitController from '../controllers/HabitController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', HabitController.getHabits);
router.post('/', HabitController.createHabit);
router.put('/:id', HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);
router.post('/:id/log', HabitController.logActivity);
router.get('/:id/logs', HabitController.getLogs);
router.get('/heatmap/data', HabitController.getHeatmap);

export default router;
