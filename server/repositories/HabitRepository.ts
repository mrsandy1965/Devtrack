import BaseRepository from './BaseRepository';
import Habit, { IHabitDocument } from '../models/Habit';

class HabitRepository extends BaseRepository<IHabitDocument> {
  constructor() {
    super(Habit);
  }

  findActiveByUser(userId: string): Promise<IHabitDocument[]> {
    return this.model.find({ userId, isActive: true }).sort({ createdAt: -1 }).exec();
  }

  findByUserAndType(userId: string, type: string): Promise<IHabitDocument[]> {
    return this.model.find({ userId, type, isActive: true }).sort({ createdAt: -1 }).exec();
  }

  incrementStreak(id: string, currentStreak: number, longestStreak: number): Promise<IHabitDocument | null> {
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);
    return this.model.findByIdAndUpdate(
      id,
      {
        currentStreak: newStreak, // streak -> currentStreak
        longestStreak: newLongest,
        lastLoggedAt: new Date(),
        $inc: { totalCompletions: 1 },
      },
      { new: true }
    ).exec();
  }

  resetStreak(id: string): Promise<IHabitDocument | null> {
    return this.model.findByIdAndUpdate(id, { currentStreak: 0 }, { new: true }).exec(); // streak -> currentStreak
  }
}

export default new HabitRepository();
