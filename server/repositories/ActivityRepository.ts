import BaseRepository from './BaseRepository';
import ActivityLog, { IActivityLogDocument } from '../models/ActivityLog';

class ActivityRepository extends BaseRepository<IActivityLogDocument> {
  constructor() {
    super(ActivityLog);
  }

  findByEntity(entityId: string, limit: number = 50): Promise<IActivityLogDocument[]> {
    return this.model.find({ entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name avatarUrl')
      .exec();
  }

  findByUser(userId: string, limit: number = 50): Promise<IActivityLogDocument[]> {
    return this.model.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name avatarUrl')
      .exec();
  }
}

export default new ActivityRepository();
