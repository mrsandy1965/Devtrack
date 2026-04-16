const BaseRepository = require('./BaseRepository');
const InternshipApplication = require('../models/InternshipApplication');

class InternshipRepository extends BaseRepository {
  constructor() {
    super(InternshipApplication);
  }

  async findByStatus(userId, status) {
    return InternshipApplication.find({ userId, status }).sort({ appliedDate: -1 });
  }

  async getConversionStats(userId) {
    const mongoose = require('mongoose');
    const oid = new mongoose.Types.ObjectId(userId.toString());

    const stats = await InternshipApplication.aggregate([
      { $match: { userId: oid } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform to friendly map
    const result = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0,
    };
    stats.forEach((s) => {
      result[s._id] = s.count;
    });

    const total = Object.values(result).reduce((a, b) => a + b, 0);
    const offerRate = total > 0 ? ((result.Offer / total) * 100).toFixed(1) : 0;
    const interviewRate =
      total > 0 ? (((result.Interview + result.Offer) / total) * 100).toFixed(1) : 0;

    return { ...result, total, offerRate, interviewRate };
  }

  async appendStatusHistory(id, newStatus) {
    return InternshipApplication.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        $push: { statusHistory: { status: newStatus, changedAt: new Date() } },
      },
      { new: true }
    );
  }
}

module.exports = new InternshipRepository();
