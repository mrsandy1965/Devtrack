const BaseRepository = require('./BaseRepository');
const ActivityLog = require('../models/ActivityLog');

class ActivityRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }

  /**
   * Append an activity entry (Observer pattern — called after every mutation).
   */
  log({ entityType, entityId, userId, action, oldValue = null, newValue = null, message }) {
    return ActivityLog.create({ entityType, entityId, userId, action, oldValue, newValue, message });
  }

  findByEntity(entityId, limit = 30) {
    return ActivityLog.find({ entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name');
  }

  findByUser(userId, limit = 20) {
    return ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new ActivityRepository();
