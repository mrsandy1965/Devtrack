const BaseRepository = require('./BaseRepository');
const HabitLog = require('../models/HabitLog');

class HabitLogRepository extends BaseRepository {
  constructor() {
    super(HabitLog);
  }

  async findByHabitAndDateRange(habitId, startDate, endDate) {
    return HabitLog.find({
      habitId,
      logDate: { $gte: startDate, $lte: endDate },
    }).sort({ logDate: 1 });
  }

  async findByUserAndDateRange(userId, startDate, endDate) {
    return HabitLog.find({
      userId,
      logDate: { $gte: startDate, $lte: endDate },
    }).populate('habitId', 'title type');
  }

  async countByUserInRange(userId, startDate, endDate) {
    return HabitLog.countDocuments({
      userId,
      logDate: { $gte: startDate, $lte: endDate },
    });
  }

  async getHeatmapData(userId, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return HabitLog.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString
            ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString())
            : new (require('mongoose').Types.ObjectId)(userId.toString()),
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

module.exports = new HabitLogRepository();
