const BaseRepository = require('./BaseRepository');
const Project = require('../models/Project');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  findByOwner(ownerId) {
    return Project.find({ ownerId, status: 'active' }).sort({ createdAt: -1 });
  }

  findByOwnerIncludingArchived(ownerId) {
    return Project.find({ ownerId }).sort({ createdAt: -1 });
  }

  archive(id) {
    return Project.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
  }

  // Returns task count stats per project via join
  async getProjectWithStats(projectId) {
    const mongoose = require('mongoose');
    const Task = require('../models/Task');
    const oid = new mongoose.Types.ObjectId(projectId.toString());

    const [project, stats] = await Promise.all([
      Project.findById(projectId),
      Task.aggregate([
        { $match: { projectId: oid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
    const total  = Object.values(counts).reduce((a, b) => a + b, 0);

    return { ...project.toObject(), stats: { ...counts, total } };
  }
}

module.exports = new ProjectRepository();
