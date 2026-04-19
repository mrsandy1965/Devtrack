import CycleRepository from '../repositories/CycleRepository';
import ProjectRepository from '../repositories/ProjectRepository';
import ActivityRepository from '../repositories/ActivityRepository';
import TaskRepository from '../repositories/TaskRepository';
import AppError from '../utils/AppError';
import { ICycleDocument } from '../models/Cycle';
import { IProjectDocument } from '../models/Project';

class CycleService {
  async _assertOwner(projectId: string, userId: string): Promise<IProjectDocument> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return project;
  }

  async createCycle(projectId: string, userId: string, data: Partial<ICycleDocument>): Promise<ICycleDocument> {
    await this._assertOwner(projectId, userId);

    if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      throw new AppError('End date must be after start date', 400);
    }

    const cycle = await CycleRepository.create({ ...data, projectId } as Partial<ICycleDocument>);

    await ActivityRepository.create({
      entityType: 'Cycle',
      entityId: cycle._id as any,
      userId: userId as any,
      action: 'created',
      metadata: { message: `Created cycle "${cycle.name}"` },
    });

    return cycle;
  }

  async getCycles(projectId: string, userId: string): Promise<ICycleDocument[]> {
    await this._assertOwner(projectId, userId);
    return CycleRepository.findByProject(projectId);
  }

  async getCycleWithStats(cycleId: string): Promise<any> {
    const stats = await CycleRepository.getCycleWithStats(cycleId);
    if (!stats) throw new AppError('Cycle not found', 404);
    
    // Polyfill the tasks lookup since getCycleBurndown/findTasksInCycle were merged or simplified in getCycleWithStats
    const tasks = await TaskRepository.findByProject(stats.projectId.toString(), { cycleId });
    return { cycle: stats, burndown: [], tasks };
  }

  async addTaskToCycle(cycleId: string, taskId: string, userId: string): Promise<any> {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId.toString(), userId);

    const task = await TaskRepository.update(taskId, { cycleId });

    await ActivityRepository.create({
      entityType: 'Task',
      entityId: taskId as any,
      userId: userId as any,
      action: 'assigned_cycle',
      metadata: { message: `Added task to cycle "${cycle.name}"` },
    });

    return task;
  }

  async removeTaskFromCycle(taskId: string, userId: string): Promise<any> {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    return TaskRepository.update(taskId, { cycleId: null });
  }

  async updateCycle(cycleId: string, userId: string, data: Partial<ICycleDocument>): Promise<ICycleDocument | null> {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId.toString(), userId);
    return CycleRepository.update(cycleId, data);
  }

  async deleteCycle(cycleId: string, userId: string): Promise<ICycleDocument | null> {
    const cycle = await CycleRepository.findById(cycleId);
    if (!cycle) throw new AppError('Cycle not found', 404);
    await this._assertOwner(cycle.projectId.toString(), userId);

    const tasks = await TaskRepository.findByProject(cycle.projectId.toString(), { cycleId });
    await TaskRepository.bulkUpdateOrder(
      tasks.map((t) => ({ id: t._id, orderIndex: t.orderIndex, status: t.status }))
    );

    return CycleRepository.delete(cycleId);
  }
}

export default new CycleService();
