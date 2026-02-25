const BaseRepository = require('./BaseRepository');
const Habit = require('../models/Habit');

class HabitRepository extends BaseRepository {
  constructor() {
    super(Habit);
  }

  async findActiveByUser(userId) {
    return Habit.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  async findWithLogs(habitId) {
    const HabitLog = require('../models/HabitLog');
    const habit = await Habit.findById(habitId);
    const logs = await HabitLog.find({ habitId }).sort({ logDate: -1 }).limit(30);
    return { habit, logs };
  }

  async updateStreak(habitId, streak, longestStreak, lastLoggedAt) {
    return Habit.findByIdAndUpdate(
      habitId,
      { streak, longestStreak, lastLoggedAt },
      { new: true }
    );
  }
}

module.exports = new HabitRepository();
