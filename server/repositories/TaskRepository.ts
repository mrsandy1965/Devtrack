import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import Task, { ITaskDocument } from '../models/Task';
import Project from '../models/Project';

class TaskRepository extends BaseRepository<ITaskDocument> {
  constructor() {
    super(Task);
  }

  async findByProject(projectId: string, filters: any = {}): Promise<ITaskDocument[]> {
    const query = { projectId, ...filters };
    return this.model.find(query)
      .sort({ status: 1, orderIndex: 1, createdAt: -1 })
      .populate('parentTaskId', 'title status')
      .exec();
  }

  async findByProjectPaginated(projectId: string, options: any = {}): Promise<any> {
    const { status, priority, cycleId, page = 1, limit = 50 } = options;
    const query: any = { projectId };
    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (cycleId)  query.cycleId  = cycleId;

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      this.model.find(query).sort({ priority: 1, orderIndex: 1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { tasks, total, page, pages: Math.ceil(total / limit) };
  }

  findSubtasks(parentTaskId: string): Promise<ITaskDocument[]> {
    return this.model.find({ parentTaskId }).sort({ orderIndex: 1 }).exec();
  }

  async bulkUpdateOrder(updates: any[]): Promise<any> {
    const ops = updates.map(({ id, orderIndex, status }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { orderIndex, ...(status ? { status } : {}) } },
      },
    }));
    return this.model.bulkWrite(ops);
  }

  async search(userId: string, q: string): Promise<any[]> {
    const regex = new RegExp(q, 'i');
    
    // Get all project IDs for this user
    const projects = await Project.find({ userId }).select('_id').exec();
    const projectIds = projects.map((p: any) => p._id);

    return this.model.find({
      projectId: { $in: projectIds },
      $or: [{ title: regex }, { description: regex }],
    })
      .limit(20)
      .populate('projectId', 'name color icon')
      .exec();
  }

  async getStatusStats(projectId: string): Promise<Record<string, number>> {
    const oid = new mongoose.Types.ObjectId(projectId);

    const result = await this.model.aggregate([
      { $match: { projectId: oid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return result.reduce((acc: any, r: any) => ({ ...acc, [r._id]: r.count }), {});
  }
}

export default new TaskRepository();
