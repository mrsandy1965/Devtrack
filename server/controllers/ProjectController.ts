import { Request, Response } from 'express';
import ProjectService from '../services/ProjectService';
import TaskService from '../services/TaskService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';

class ProjectController {
  getProjects = asyncHandler(async (req: Request, res: Response) => {
    const projects = await ProjectService.getProjects((req.user as any)._id || req.user.id);
    res.json({ success: true, count: projects.length, projects });
  });

  createProject = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      name: ['required', { maxLength: 100 }],
    });
    const project = await ProjectService.createProject((req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, project });
  });

  getProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await ProjectService.getProject(req.params.id, (req.user as any)._id || req.user.id);
    const stats = await TaskService.getProjectStats(req.params.id);
    res.json({ success: true, project, stats });
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await ProjectService.updateProject(req.params.id, (req.user as any)._id || req.user.id, req.body);
    res.json({ success: true, project });
  });

  archiveProject = asyncHandler(async (req: Request, res: Response) => {
    await ProjectService.archiveProject(req.params.id, (req.user as any)._id || req.user.id);
    res.json({ success: true, message: 'Project archived' });
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await ProjectService.deleteProject(req.params.id, (req.user as any)._id || req.user.id);
    res.json({ success: true, message: 'Project deleted' });
  });

  getProjectTasks = asyncHandler(async (req: Request, res: Response) => {
    const { status, priority, cycleId, page, limit } = req.query;
    const result = await TaskService.getTasksPaginated(req.params.id, {
      status, priority, cycleId, page: Number(page) || 1, limit: Number(limit) || 100,
    });
    res.json({ success: true, ...result });
  });

  getBoardView = asyncHandler(async (req: Request, res: Response) => {
    const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
    const tasks = await TaskService.getProjectTasks(req.params.id, {});

    const board = STATUSES.reduce((acc: any, s: string) => ({
      ...acc,
      [s]: tasks.filter((t: any) => t.status === s).sort((a: any, b: any) => a.orderIndex - b.orderIndex),
    }), {});

    res.json({ success: true, board });
  });
}

export default new ProjectController();
