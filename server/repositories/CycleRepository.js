const BaseRepository = require('./BaseRepository');
const Cycle = require('../models/Cycle');
const Task  = require('../models/Task');

class CycleRepository extends BaseRepository {
  constructor() {
    super(Cycle);
  }

  findByProject(projectId) {
    return Cycle.find({ projectId }).sort({ startDate: -1 });
  }

  findActive(projectId) {
    return Cycle.findOne({ projectId, status: 'active' });
  }

  // Burn-down stats: total vs completed tasks in cycle
  async getCycleBurndown(cycleId) {
    const [total, done] = await Promise.all([
      Task.countDocuments({ cycleId }),
      Task.countDocuments({ cycleId, status: 'done' }),
    ]);
    return { total, done, remaining: total - done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  // Tasks in a cycle
  findTasksInCycle(cycleId) {
    return Task.find({ cycleId }).sort({ orderIndex: 1 });
  }
}

module.exports = new CycleRepository();
