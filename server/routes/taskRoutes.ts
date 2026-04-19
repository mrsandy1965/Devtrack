import express from 'express';
import TaskController from '../controllers/TaskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/reorder', TaskController.reorderTasks);
router.get('/search', TaskController.search);

router.get('/:id', TaskController.getTask);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

router.post('/:id/comments', TaskController.addComment);
router.delete('/:id/comments/:commentId', TaskController.deleteComment);

export default router;
