import express from 'express';
import ProjectController from '../controllers/ProjectController';
import TaskController from '../controllers/TaskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.patch('/:id/archive', ProjectController.archiveProject);

router.get('/:id/tasks', ProjectController.getProjectTasks);
router.post('/:id/tasks', TaskController.createTask);
router.get('/:id/board', ProjectController.getBoardView);

export default router;
