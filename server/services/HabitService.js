const HabitRepository = require('../repositories/HabitRepository');
const HabitLogRepository = require('../repositories/HabitLogRepository');
const CareerScoreEngine = require('../utils/CareerScoreEngine');
const UserRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

class HabitService {
  async createHabit(userId, data) {
    return HabitRepository.create({ ...data, userId });
  }

  async getUserHabits(userId) {
    return HabitRepository.findActiveByUser(userId);
  }

  async getHabitById(habitId) {
    return HabitRepository.findById(habitId);
  }

  async updateHabit(habitId, data) {
    return HabitRepository.update(habitId, data);
  }

  async deleteHabit(habitId) {
    return HabitRepository.update(habitId, { isActive: false });
  }

  async logActivity(habitId, userId, logData = {}) {
    const habit = await HabitRepository.findById(habitId);
    if (!habit) throw new AppError('Habit not found', 404);

    // Create log entry
    const log = await HabitLogRepository.create({
      habitId,
      userId,
      logDate: new Date(),
      source: logData.source || 'manual',
      notes: logData.notes || '',
      commitCount: logData.commitCount || 0,
      completed: true,
    });

    // Recalculate streak
    const newStreak = await this._calculateStreak(habitId, userId, habit);

    // Trigger career score recalculation
    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return { log, streak: newStreak };
  }

  async _calculateStreak(habitId, userId, habit) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentLogs = await HabitLogRepository.findByHabitAndDateRange(
      habitId,
      yesterday,
      now
    );

    let streak = habit.streak;

    if (recentLogs.length > 0) {
      const lastLog = habit.lastLoggedAt;
      if (lastLog) {
        const lastLogDay = new Date(lastLog).toDateString();
        const todayDay = now.toDateString();
        const yesterdayDay = yesterday.toDateString();

        if (lastLogDay === todayDay) {
          // Already logged today – no streak change
        } else if (lastLogDay === yesterdayDay) {
          // Consecutive – increment streak
          streak += 1;
        } else {
          // Streak broken
          streak = 1;
        }
      } else {
        streak = 1;
      }
    }

    const longestStreak = Math.max(habit.longestStreak || 0, streak);
    await HabitRepository.updateStreak(habitId, streak, longestStreak, now);
    return streak;
  }

  async getHabitLogs(habitId) {
    return HabitLogRepository.findByHabitAndDateRange(
      habitId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    );
  }

  async getHeatmapData(userId) {
    return HabitLogRepository.getHeatmapData(userId, 90);
  }
}

module.exports = new HabitService();
