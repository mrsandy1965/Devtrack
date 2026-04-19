import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import InternshipApplication, { IInternshipApplicationDocument } from '../models/InternshipApplication';

class InternshipRepository extends BaseRepository<IInternshipApplicationDocument> {
  constructor() {
    super(InternshipApplication);
  }

  findByStatus(userId: string, status: string): Promise<IInternshipApplicationDocument[]> {
    return this.model.find({ userId, status }).sort({ appliedDate: -1 }).exec();
  }

  async getConversionStats(userId: string): Promise<any> {
    const oid = new mongoose.Types.ObjectId(userId);

    const stats = await this.model.aggregate([
      { $match: { userId: oid } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0,
    };
    
    stats.forEach((s: any) => {
      result[s._id] = s.count;
    });

    const total = Object.values(result).reduce((a, b) => a + b, 0);
    const offerRate = total > 0 ? ((result.Offer / total) * 100).toFixed(1) : '0.0';
    const interviewRate = total > 0 ? (((result.Interview + result.Offer) / total) * 100).toFixed(1) : '0.0';

    return { ...result, total, offerRate, interviewRate };
  }

  appendStatusHistory(id: string, newStatus: string): Promise<IInternshipApplicationDocument | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        $push: { statusHistory: { status: newStatus, changedAt: new Date() } },
      },
      { new: true }
    ).exec();
  }
}

export default new InternshipRepository();
