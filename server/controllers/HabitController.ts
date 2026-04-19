import { Request, Response } from 'express';
import HabitService from '../services/HabitService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';
import AppError from '../utils/AppError';

class HabitController {
  getHabits = asyncHandler(async (req: Request, res: Response) => {
    const habits = await HabitService.getUserHabits((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, count: habits.length, habits });
  });

  createHabit = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      title:      ['required', { maxLength: 120 }],
      type:       [{ enum: ['dsa', 'project', 'learning', 'other'] }],
      recurrence: [{ enum: ['daily', 'weekly'] }],
    });

    const habit = await HabitService.createHabit((req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, habit });
  });

  updateHabit = asyncHandler(async (req: Request, res: Response) => {
    const habit = await HabitService.getHabitById(req.params.id);
    if (!habit) throw new AppError('Habit not found', 404);
    if (habit.userId.toString() !== ((req.user as any)._id || req.user.id).toString()) throw new AppError('Not authorized', 403);

    const updated = await HabitService.updateHabit(req.params.id, req.body);
    res.status(200).json({ success: true, habit: updated });
  });

  deleteHabit = asyncHandler(async (req: Request, res: Response) => {
    const habit = await HabitService.getHabitById(req.params.id);
    if (!habit) throw new AppError('Habit not found', 404);
    if (habit.userId.toString() !== ((req.user as any)._id || req.user.id).toString()) throw new AppError('Not authorized', 403);

    await HabitService.deleteHabit(req.params.id);
    res.status(200).json({ success: true, message: 'Habit deactivated' });
  });

  logActivity = asyncHandler(async (req: Request, res: Response) => {
    const result = await HabitService.logActivity(req.params.id, (req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
  });

  getHeatmap = asyncHandler(async (req: Request, res: Response) => {
    const heatmap = await HabitService.getHeatmapData((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, heatmap });
  });

  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await HabitService.getHabitLogs(req.params.id);
    res.status(200).json({ success: true, logs });
  });
}

export default new HabitController();
