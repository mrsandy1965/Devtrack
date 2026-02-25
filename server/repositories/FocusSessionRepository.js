const BaseRepository = require('./BaseRepository');
const FocusSession = require('../models/FocusSession');

class FocusSessionRepository extends BaseRepository {
  constructor() {
    super(FocusSession);
  }

  async findByDateRange(userId, startDate, endDate) {
    return FocusSession.find({
      userId,
      sessionDate: { $gte: startDate, $lte: endDate },
    })
      .populate('habitId', 'title')
      .sort({ sessionDate: -1 });
  }

  async getTotalFocusTime(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await FocusSession.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString
            ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString())
            : new (require('mongoose').Types.ObjectId)(userId.toString()),
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

  async getActiveSessions(userId) {
    return FocusSession.find({ userId, completed: false }).sort({ startTime: -1 });
  }
}

module.exports = new FocusSessionRepository();
