const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const ProjectController = require('../controllers/ProjectController');
const TaskController    = require('../controllers/TaskController');

// All project routes require auth
router.use(protect);

// ── Projects ──────────────────────────────────────────────────────────────────
router.get ('/',           ProjectController.getProjects);
router.post('/',           ProjectController.createProject);
router.get ('/:id',        ProjectController.getProject);
router.put ('/:id',        ProjectController.updateProject);
router.delete('/:id',      ProjectController.deleteProject);
router.patch('/:id/archive', ProjectController.archiveProject);

// ── Tasks within a project ────────────────────────────────────────────────────
router.get ('/:id/tasks',  ProjectController.getProjectTasks);
router.post('/:id/tasks',  TaskController.createTask);       // :id = projectId
router.get ('/:id/board',  ProjectController.getBoardView);

module.exports = router;
