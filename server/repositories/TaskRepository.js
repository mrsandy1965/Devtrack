const BaseRepository = require('./BaseRepository');
const Task = require('../models/Task');

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  // Board view: all tasks for a project, grouped by status
  async findByProject(projectId, filters = {}) {
    const query = { projectId, ...filters };
    return Task.find(query)
      .sort({ status: 1, orderIndex: 1, createdAt: -1 })
      .populate('parentTaskId', 'title status');
  }

  // List view with optional status/priority filter and pagination
  async findByProjectPaginated(projectId, { status, priority, cycleId, page = 1, limit = 50 } = {}) {
    const query = { projectId };
    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (cycleId)  query.cycleId  = cycleId;

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ priority: 1, orderIndex: 1 }).skip(skip).limit(limit),
      Task.countDocuments(query),
    ]);

    return { tasks, total, page, pages: Math.ceil(total / limit) };
  }

  // All subtasks of a parent
  findSubtasks(parentTaskId) {
    return Task.find({ parentTaskId }).sort({ orderIndex: 1 });
  }

  // Bulk status update (for Kanban drag-drop reordering)
  async bulkUpdateOrder(updates) {
    const ops = updates.map(({ id, orderIndex, status }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { orderIndex, ...(status ? { status } : {}) } },
      },
    }));
    return Task.bulkWrite(ops);
  }

  // Full-text search across title and description
  async search(userId, q) {
    const regex = new RegExp(q, 'i');
    // Get all project IDs for this user
    const Project = require('../models/Project');
    const projects = await Project.find({ ownerId: userId }).select('_id');
    const projectIds = projects.map((p) => p._id);

    return Task.find({
      projectId: { $in: projectIds },
      $or: [{ title: regex }, { description: regex }],
    })
      .limit(20)
      .populate('projectId', 'name color icon');
  }

  // Stats for dashboard/cycle
  async getStatusStats(projectId) {
    const mongoose = require('mongoose');
    const oid = new mongoose.Types.ObjectId(projectId.toString());

    const result = await Task.aggregate([
      { $match: { projectId: oid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return result.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
  }
}

module.exports = new TaskRepository();
