import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import FocusSession, { IFocusSessionDocument } from '../models/FocusSession';

class FocusSessionRepository extends BaseRepository<IFocusSessionDocument> {
  constructor() {
    super(FocusSession);
  }

  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<IFocusSessionDocument[]> {
    return this.model.find({
      userId,
      sessionDate: { $gte: startDate, $lte: endDate },
    })
      .populate('habitId', 'title')
      .sort({ sessionDate: -1 })
      .exec();
  }

  async getTotalFocusTime(userId: string, days: number = 7): Promise<{ totalMinutes: number; sessionCount: number }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const oid = new mongoose.Types.ObjectId(userId);

    const result = await this.model.aggregate([
      {
        $match: {
          userId: oid,
          sessionDate: { $gte: startDate },
          completed: true,
        },
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { totalMinutes: 0, sessionCount: 0 };
  }

  getActiveSessions(userId: string): Promise<IFocusSessionDocument[]> {
    return this.model.find({ userId, completed: false }).sort({ startTime: -1 }).exec();
  }
}

export default new FocusSessionRepository();
