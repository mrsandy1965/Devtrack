import { Request, Response } from 'express';
import CycleService from '../services/CycleService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';

class CycleController {
  getCycles = asyncHandler(async (req: Request, res: Response) => {
    const cycles = await CycleService.getCycles(req.params.projectId, (req.user as any)._id || req.user.id);
    res.json({ success: true, cycles });
  });

  createCycle = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      name:      ['required', { maxLength: 100 }],
      startDate: ['required'],
      endDate:   ['required'],
    });
    const cycle = await CycleService.createCycle(req.params.projectId, (req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, cycle });
  });

  getCycleDetail = asyncHandler(async (req: Request, res: Response) => {
    const data = await CycleService.getCycleWithStats(req.params.id);
    res.json({ success: true, ...data });
  });

  updateCycle = asyncHandler(async (req: Request, res: Response) => {
    const cycle = await CycleService.updateCycle(req.params.id, (req.user as any)._id || req.user.id, req.body);
    res.json({ success: true, cycle });
  });

  deleteCycle = asyncHandler(async (req: Request, res: Response) => {
    await CycleService.deleteCycle(req.params.id, (req.user as any)._id || req.user.id);
    res.json({ success: true, message: 'Cycle deleted' });
  });

  addTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.body;
    const task = await CycleService.addTaskToCycle(req.params.id, taskId, (req.user as any)._id || req.user.id);
    res.json({ success: true, task });
  });

  removeTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await CycleService.removeTaskFromCycle(req.params.taskId, (req.user as any)._id || req.user.id);
    res.json({ success: true, task });
  });
}

export default new CycleController();
