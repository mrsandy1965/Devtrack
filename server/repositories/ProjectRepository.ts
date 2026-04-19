import mongoose from 'mongoose';
import BaseRepository from './BaseRepository';
import Project, { IProjectDocument } from '../models/Project';
import Task from '../models/Task';

class ProjectRepository extends BaseRepository<IProjectDocument> {
  constructor() {
    super(Project);
  }

  findByOwner(userId: string): Promise<IProjectDocument[]> {
    return this.model.find({ userId, status: 'active' }).sort({ createdAt: -1 }).exec(); // Note: ownerId in js became userId in IProject
  }

  findByOwnerIncludingArchived(userId: string): Promise<IProjectDocument[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  archive(id: string): Promise<IProjectDocument | null> {
    return this.model.findByIdAndUpdate(id, { status: 'archived' }, { new: true }).exec();
  }

  async getProjectWithStats(projectId: string): Promise<any> {
    const oid = new mongoose.Types.ObjectId(projectId);

    const [project, stats] = await Promise.all([
      this.model.findById(projectId).exec(),
      Task.aggregate([
        { $match: { projectId: oid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    if (!project) return null;

    const counts = stats.reduce((acc: any, s: any) => ({ ...acc, [s._id]: s.count }), {});
    const total  = Object.values(counts).reduce((a: any, b: any) => a + b, 0);

    return { ...project.toObject(), stats: { ...counts, total } };
  }
}

export default new ProjectRepository();
