const TaskService  = require('../services/TaskService');
const asyncHandler = require('../utils/asyncHandler');
const Validator    = require('../utils/Validator');
const AppError     = require('../utils/AppError');

const VALID_STATUSES   = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low', 'no_priority'];

class TaskController {
  createTask = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      title:    ['required', { maxLength: 255 }],
      status:   [{ enum: VALID_STATUSES }],
      priority: [{ enum: VALID_PRIORITIES }],
    });

    const projectId = req.params.id || req.params.projectId; // route uses :id
    const task = await TaskService.createTask(req.user.id, projectId, req.body);
    res.status(201).json({ success: true, task });
  });

  getTask = asyncHandler(async (req, res) => {
    const task     = await TaskService.getTask(req.params.id);
    const comments = await TaskService.getComments(req.params.id);
    const activity = await TaskService.getActivity(req.params.id);
    const subtasks = await TaskService.getSubtasks(req.params.id);
    res.json({ success: true, task, comments, activity, subtasks });
  });

  updateTask = asyncHandler(async (req, res) => {
    if (req.body.status)   Validator.assert(req.body, { status:   [{ enum: VALID_STATUSES }] });
    if (req.body.priority) Validator.assert(req.body, { priority: [{ enum: VALID_PRIORITIES }] });

    const task = await TaskService.updateTask(req.params.id, req.user.id, req.body);
    res.json({ success: true, task });
  });

  deleteTask = asyncHandler(async (req, res) => {
    await TaskService.deleteTask(req.params.id, req.user.id);
    res.json({ success: true, message: 'Task deleted' });
  });

  reorderTasks = asyncHandler(async (req, res) => {
    // Body: [{ id, orderIndex, status }]
    const { updates } = req.body;
    if (!Array.isArray(updates)) throw new AppError('updates must be an array', 400);
    await TaskService.reorderTasks(updates);
    res.json({ success: true });
  });

  // Comments
  addComment = asyncHandler(async (req, res) => {
    Validator.assert(req.body, { content: ['required', { maxLength: 5000 }] });
    const comment = await TaskService.addComment(req.params.id, req.user.id, req.body.content);
    res.status(201).json({ success: true, comment });
  });

  deleteComment = asyncHandler(async (req, res) => {
    await TaskService.deleteComment(req.params.commentId, req.user.id);
    res.json({ success: true, message: 'Comment deleted' });
  });

  // Global search (also accessible from here)
  search = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const results = await TaskService.search(req.user.id, q);
    res.json({ success: true, count: results.length, results });
  });
}

module.exports = new TaskController();
