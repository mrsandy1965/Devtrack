const HabitService = require('../services/HabitService');
const asyncHandler = require('../utils/asyncHandler');
const Validator = require('../utils/Validator');
const AppError = require('../utils/AppError');

class HabitController {
  getHabits = asyncHandler(async (req, res) => {
    const habits = await HabitService.getUserHabits(req.user.id);
    res.status(200).json({ success: true, count: habits.length, habits });
  });

  createHabit = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      title:      ['required', { maxLength: 120 }],
      type:       [{ enum: ['dsa', 'project', 'learning', 'other'] }],
      recurrence: [{ enum: ['daily', 'weekly'] }],
    });

    const habit = await HabitService.createHabit(req.user.id, req.body);
    res.status(201).json({ success: true, habit });
  });

  updateHabit = asyncHandler(async (req, res) => {
    const habit = await HabitService.getHabitById(req.params.id);
    if (!habit) throw new AppError('Habit not found', 404);
    if (habit.userId.toString() !== req.user.id.toString()) throw new AppError('Not authorized', 403);

    const updated = await HabitService.updateHabit(req.params.id, req.body);
    res.status(200).json({ success: true, habit: updated });
  });

  deleteHabit = asyncHandler(async (req, res) => {
    const habit = await HabitService.getHabitById(req.params.id);
    if (!habit) throw new AppError('Habit not found', 404);
    if (habit.userId.toString() !== req.user.id.toString()) throw new AppError('Not authorized', 403);

    await HabitService.deleteHabit(req.params.id);
    res.status(200).json({ success: true, message: 'Habit deactivated' });
  });

  logActivity = asyncHandler(async (req, res) => {
    const result = await HabitService.logActivity(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
  });

  getHeatmap = asyncHandler(async (req, res) => {
    const heatmap = await HabitService.getHeatmapData(req.user.id);
    res.status(200).json({ success: true, heatmap });
  });

  getLogs = asyncHandler(async (req, res) => {
    const logs = await HabitService.getHabitLogs(req.params.id);
    res.status(200).json({ success: true, logs });
  });
}

module.exports = new HabitController();
