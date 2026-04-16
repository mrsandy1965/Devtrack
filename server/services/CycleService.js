const CycleRepository    = require('../repositories/CycleRepository');
const ProjectRepository  = require('../repositories/ProjectRepository');
const ActivityRepository = require('../repositories/ActivityRepository');
const TaskRepository     = require('../repositories/TaskRepository');
const AppError = require('../utils/AppError');

class CycleService {
  async _assertOwner(projectId, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.ownerId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return project;
  }

  async createCycle(projectId, userId, data) {
    await this._assertOwner(projectId, userId);

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new AppError('End date must be after start date', 400);
    }

    const cycle = await CycleRepository.create({ ...data, projectId });

    await ActivityRepository.log({
      entityType: 'cycle',
      entityId:   cycle._id,
      userId,
      action:     'created',
      message:    `Created cycle "${cycle.name}"`,
    });

    return cycle;
  }

  async getCycles(projectId, userId) {
    await this._assertOwner(projectId, userId);
    return CycleRepository.findByProject(projectId);
  }

  async getCycleWithStats(cycleId) {
    const cycle    = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    const burndown = await CycleRepository.getCycleBurndown(cycleId);
    const tasks    = await CycleRepository.findTasksInCycle(cycleId);
    return { cycle, burndown, tasks };
  }

  async addTaskToCycle(cycleId, taskId, userId) {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId, userId);

    const task = await TaskRepository.update(taskId, { cycleId });

    await ActivityRepository.log({
      entityType: 'task',
      entityId:   taskId,
      userId,
      action:     'cycle_assigned',
      message:    `Added task to cycle "${cycle.name}"`,
    });

    return task;
  }

  async removeTaskFromCycle(taskId, userId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    return TaskRepository.update(taskId, { cycleId: null });
  }

  async updateCycle(cycleId, userId, data) {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId, userId);
    return CycleRepository.update(cycleId, data);
  }

  async deleteCycle(cycleId, userId) {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId, userId);
    // Unlink tasks from this cycle
    await TaskRepository.bulkUpdateOrder(
      (await CycleRepository.findTasksInCycle(cycleId)).map((t) => ({
        id: t._id, orderIndex: t.orderIndex, status: t.status,
      }))
    );
    return CycleRepository.delete(cycleId);
  }
}

module.exports = new CycleService();
