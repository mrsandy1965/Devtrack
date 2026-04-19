import express from 'express';
import { protect } from '../middleware/auth';
import CycleController from '../controllers/CycleController';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', CycleController.getCycles);
router.post('/', CycleController.createCycle);
router.get('/:id', CycleController.getCycleDetail);
router.put('/:id', CycleController.updateCycle);
router.delete('/:id', CycleController.deleteCycle);
router.post('/:id/tasks', CycleController.addTask);
router.delete('/:id/tasks/:taskId', CycleController.removeTask);

export default router;
