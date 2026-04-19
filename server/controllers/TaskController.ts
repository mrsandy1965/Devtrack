import { Request, Response } from 'express';
import TaskService from '../services/TaskService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';
import AppError from '../utils/AppError';

const VALID_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low', 'no_priority'];

class TaskController {
  createTask = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      title:    ['required', { maxLength: 255 }],
      status:   [{ enum: VALID_STATUSES }],
      priority: [{ enum: VALID_PRIORITIES }],
    });

    const projectId = req.params.id || req.params.projectId;
    const task = await TaskService.createTask((req.user as any)._id || req.user.id, projectId, req.body);
    res.status(201).json({ success: true, task });
  });

  getTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await TaskService.getTask(req.params.id);
    const comments = await TaskService.getComments(req.params.id);
    const activity = await TaskService.getActivity(req.params.id);
    const subtasks = await TaskService.getSubtasks(req.params.id);
    res.json({ success: true, task, comments, activity, subtasks });
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    if (req.body.status)   Validator.assert(req.body, { status:   [{ enum: VALID_STATUSES }] });
    if (req.body.priority) Validator.assert(req.body, { priority: [{ enum: VALID_PRIORITIES }] });

    const task = await TaskService.updateTask(req.params.id, (req.user as any)._id || req.user.id, req.body);
    res.json({ success: true, task });
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    await TaskService.deleteTask(req.params.id, (req.user as any)._id || req.user.id);
    res.json({ success: true, message: 'Task deleted' });
  });

  reorderTasks = asyncHandler(async (req: Request, res: Response) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) throw new AppError('updates must be an array', 400);
    await TaskService.reorderTasks(updates);
    res.json({ success: true });
  });

  addComment = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, { content: ['required', { maxLength: 5000 }] });
    const comment = await TaskService.addComment(req.params.id, (req.user as any)._id || req.user.id, req.body.content);
    res.status(201).json({ success: true, comment });
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await TaskService.deleteComment(req.params.commentId, (req.user as any)._id || req.user.id);
    res.json({ success: true, message: 'Comment deleted' });
  });

  search = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const results = await TaskService.search((req.user as any)._id || req.user.id, q as string);
    res.json({ success: true, count: results.length, results });
  });
}

export default new TaskController();
