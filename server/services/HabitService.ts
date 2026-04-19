import HabitRepository from '../repositories/HabitRepository';
import HabitLogRepository from '../repositories/HabitLogRepository';
import CareerScoreEngine from '../utils/CareerScoreEngine';
import UserRepository from '../repositories/UserRepository';
import AppError from '../utils/AppError';
import { IHabitDocument } from '../models/Habit';

class HabitService {
  async createHabit(userId: string, data: Partial<IHabitDocument>): Promise<IHabitDocument> {
    return HabitRepository.create({ ...data, userId } as Partial<IHabitDocument>);
  }

  async getUserHabits(userId: string): Promise<IHabitDocument[]> {
    return HabitRepository.findActiveByUser(userId);
  }

  async getHabitById(habitId: string): Promise<IHabitDocument | null> {
    return HabitRepository.findById(habitId);
  }

  async updateHabit(habitId: string, data: Partial<IHabitDocument>): Promise<IHabitDocument | null> {
    return HabitRepository.update(habitId, data);
  }

  async deleteHabit(habitId: string): Promise<IHabitDocument | null> {
    return HabitRepository.update(habitId, { isActive: false });
  }

  async logActivity(habitId: string, userId: string, logData: any = {}): Promise<any> {
    const habit = await HabitRepository.findById(habitId);
    if (!habit) throw new AppError('Habit not found', 404);

    const log = await HabitLogRepository.create({
      habitId,
      userId,
      logDate: new Date(),
      source: logData.source || 'manual',
      notes: logData.notes || '',
      commitCount: logData.commitCount || 0,
      completed: true,
    } as any);

    const newStreak = await this._calculateStreak(habitId, userId, habit);

    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return { log, streak: newStreak };
  }

  async _calculateStreak(habitId: string, userId: string, habit: IHabitDocument): Promise<number> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentLogs = await HabitLogRepository.findByHabitAndDateRange(habitId, yesterday, now);

    let streak = habit.currentStreak || 0;

    if (recentLogs.length > 0) {
      const lastLog = (habit as any).lastLoggedAt;
      if (lastLog) {
        const lastLogDay = new Date(lastLog).toDateString();
        const todayDay = now.toDateString();
        const yesterdayDay = yesterday.toDateString();

        if (lastLogDay === todayDay) {
          // Already logged today
        } else if (lastLogDay === yesterdayDay) {
          streak += 1;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
    }

    const longestStreak = Math.max(habit.longestStreak || 0, streak);
    await HabitRepository.incrementStreak(habitId, streak - 1, longestStreak); // adjusted for logic sync
    return streak;
  }

  async getHabitLogs(habitId: string): Promise<any[]> {
    return HabitLogRepository.findByHabitAndDateRange(
      habitId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    );
  }

  async getHeatmapData(userId: string): Promise<any[]> {
    return HabitLogRepository.getHeatmapData(userId, 90);
  }
}

export default new HabitService();
