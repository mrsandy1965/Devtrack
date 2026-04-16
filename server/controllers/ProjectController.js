const ProjectService = require('../services/ProjectService');
const TaskService    = require('../services/TaskService');
const asyncHandler   = require('../utils/asyncHandler');
const Validator      = require('../utils/Validator');
const AppError       = require('../utils/AppError');

class ProjectController {
  getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectService.getProjects(req.user.id);
    res.json({ success: true, count: projects.length, projects });
  });

  createProject = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      name: ['required', { maxLength: 100 }],
    });
    const project = await ProjectService.createProject(req.user.id, req.body);
    res.status(201).json({ success: true, project });
  });

  getProject = asyncHandler(async (req, res) => {
    const project = await ProjectService.getProject(req.params.id, req.user.id);
    const stats   = await TaskService.getProjectStats(req.params.id);
    res.json({ success: true, project, stats });
  });

  updateProject = asyncHandler(async (req, res) => {
    const project = await ProjectService.updateProject(req.params.id, req.user.id, req.body);
    res.json({ success: true, project });
  });

  archiveProject = asyncHandler(async (req, res) => {
    await ProjectService.archiveProject(req.params.id, req.user.id);
    res.json({ success: true, message: 'Project archived' });
  });

  deleteProject = asyncHandler(async (req, res) => {
    await ProjectService.deleteProject(req.params.id, req.user.id);
    res.json({ success: true, message: 'Project deleted' });
  });

  // Get all tasks for the project (used by board + list views)
  getProjectTasks = asyncHandler(async (req, res) => {
    const { status, priority, cycleId, page, limit } = req.query;
    const result = await TaskService.getTasksPaginated(req.params.id, {
      status, priority, cycleId, page: Number(page) || 1, limit: Number(limit) || 100,
    });
    res.json({ success: true, ...result });
  });

  // Board view — tasks grouped by status
  getBoardView = asyncHandler(async (req, res) => {
    const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
    const tasks    = await TaskService.getProjectTasks(req.params.id, {});

    const board = STATUSES.reduce((acc, s) => ({
      ...acc,
      [s]: tasks.filter((t) => t.status === s).sort((a, b) => a.orderIndex - b.orderIndex),
    }), {});

    res.json({ success: true, board });
  });
}

module.exports = new ProjectController();
