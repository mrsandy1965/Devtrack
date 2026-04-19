import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import Cycle, { ICycleDocument } from '../models/Cycle';
import Task from '../models/Task';

class CycleRepository extends BaseRepository<ICycleDocument> {
  constructor() {
    super(Cycle);
  }

  findByProject(projectId: string): Promise<ICycleDocument[]> {
    return this.model.find({ projectId }).sort({ startDate: 1 }).exec();
  }

  findActiveCycle(projectId: string): Promise<ICycleDocument | null> {
    return this.model.findOne({ projectId, status: 'active' }).exec();
  }

  async getCycleWithStats(cycleId: string): Promise<any> {
    const oid = new mongoose.Types.ObjectId(cycleId);

    const [cycle, stats] = await Promise.all([
      this.model.findById(cycleId).exec(),
      Task.aggregate([
        { $match: { cycleId: oid } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            estimate: { $sum: '$estimate' },
          },
        },
      ]),
    ]);

    if (!cycle) return null;

    const breakdown = stats.reduce(
      (acc: any, s: any) => ({
        ...acc,
        [s._id]: { count: s.count, estimate: s.estimate },
      }),
      {}
    );

    const totalTasks = stats.reduce((sum: number, s: any) => sum + s.count, 0);
    const totalEstimate = stats.reduce((sum: number, s: any) => sum + s.estimate, 0);
    
    // Default done stats to 0 if they don't exist
    const doneTasks = breakdown['done']?.count || 0;
    const doneEstimate = breakdown['done']?.estimate || 0;

    return {
      ...cycle.toObject(),
      stats: {
        breakdown,
        totalTasks,
        totalEstimate,
        doneTasks,
        doneEstimate,
        progress: totalEstimate > 0 ? Math.round((doneEstimate / totalEstimate) * 100) : 0,
      },
    };
  }
}

export default new CycleRepository();
