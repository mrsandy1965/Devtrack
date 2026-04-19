import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import HabitLog, { IHabitLogDocument } from '../models/HabitLog';

class HabitLogRepository extends BaseRepository<IHabitLogDocument> {
  constructor() {
    super(HabitLog);
  }

  findByHabitAndDateRange(habitId: string, startDate: Date, endDate: Date): Promise<IHabitLogDocument[]> {
    return this.model.find({
      habitId,
      logDate: { $gte: startDate, $lte: endDate },
    }).sort({ logDate: 1 }).exec();
  }

  findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IHabitLogDocument[]> {
    return this.model.find({
      userId,
      logDate: { $gte: startDate, $lte: endDate },
    }).populate('habitId', 'title type').exec();
  }

  countByUserInRange(userId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.model.countDocuments({
      userId,
      logDate: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  async getHeatmapData(userId: string, days: number = 90): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const oid = new mongoose.Types.ObjectId(userId);

    return this.model.aggregate([
      {
        $match: {
          userId: oid,
          logDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$logDate' },
          },
          count: { $sum: 1 },
          commits: { $sum: '$commitCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

export default new HabitLogRepository();
