const HabitService = require('../services/HabitService');

class HabitController {
  async getHabits(req, res, next) {
    try {
      const habits = await HabitService.getUserHabits(req.user.id);
      res.status(200).json({ success: true, count: habits.length, habits });
    } catch (err) {
      next(err);
    }
  }

  async createHabit(req, res, next) {
    try {
      const habit = await HabitService.createHabit(req.user.id, req.body);
      res.status(201).json({ success: true, habit });
    } catch (err) {
      next(err);
    }
  }

  async updateHabit(req, res, next) {
    try {
      const habit = await HabitService.updateHabit(req.params.id, req.body);
      res.status(200).json({ success: true, habit });
    } catch (err) {
      next(err);
    }
  }

  async deleteHabit(req, res, next) {
    try {
      await HabitService.deleteHabit(req.params.id);
      res.status(200).json({ success: true, message: 'Habit deactivated' });
    } catch (err) {
      next(err);
    }
  }

  async logActivity(req, res, next) {
    try {
      const result = await HabitService.logActivity(req.params.id, req.user.id, req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const heatmap = await HabitService.getHeatmapData(req.user.id);
      res.status(200).json({ success: true, heatmap });
    } catch (err) {
      next(err);
    }
  }

  async getLogs(req, res, next) {
    try {
      const logs = await HabitService.getHabitLogs(req.params.id);
      res.status(200).json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HabitController();
