import TaskRepository from '../repositories/TaskRepository';
import ProjectRepository from '../repositories/ProjectRepository';
import CommentRepository from '../repositories/CommentRepository';
import ActivityRepository from '../repositories/ActivityRepository';
import AppError from '../utils/AppError';
import { ITaskDocument } from '../models/Task';
import { ICommentDocument } from '../models/Comment';

class TaskService {
  async _assertOwner(taskId: string, userId: string): Promise<ITaskDocument> {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    const project = await ProjectRepository.findById(task.projectId.toString());
    if (!project || project.userId.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }
    return task;
  }

  async createTask(userId: string, projectId: string, data: Partial<ITaskDocument>): Promise<ITaskDocument> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);

    const existing = await TaskRepository.findByProject(projectId, { status: data.status || 'backlog' });
    const orderIndex = existing.length;

    const task = await TaskRepository.create({ ...data, projectId, userId, orderIndex } as Partial<ITaskDocument>);

    await ActivityRepository.create({
      entityType: 'Task',
      entityId: task._id as any,
      userId: userId as any,
      action: 'created',
      metadata: { message: `Created task "${task.title}"` },
    });

    return task;
  }

  async getProjectTasks(projectId: string, filters: any = {}): Promise<ITaskDocument[]> {
    return TaskRepository.findByProject(projectId, filters);
  }

  async getTasksPaginated(projectId: string, options: any = {}): Promise<any> {
    return TaskRepository.findByProjectPaginated(projectId, options);
  }

  async getTask(taskId: string): Promise<ITaskDocument> {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  async updateTask(taskId: string, userId: string, data: Partial<ITaskDocument>): Promise<ITaskDocument | null> {
    const task = await this._assertOwner(taskId, userId);
    const updated = await TaskRepository.update(taskId, data);

    const changes = Object.keys(data)
      .filter((k) => ['status', 'priority', 'cycleId'].includes(k))
      .map((k) => `${k}: ${(task as any)[k]} → ${(data as any)[k]}`);

    if (changes.length > 0) {
      await ActivityRepository.create({
        entityType: 'Task',
        entityId: taskId as any,
        userId: userId as any,
        action: 'updated',
        metadata: {
          oldValue: task.status,
          newValue: data.status || task.status,
          message: `Updated ${changes.join(', ')} on "${task.title}"`,
        },
      });
    }

    return updated;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this._assertOwner(taskId, userId);
    await TaskRepository.delete(taskId);

    await ActivityRepository.create({
      entityType: 'Task',
      entityId: taskId as any,
      userId: userId as any,
      action: 'deleted',
      metadata: { message: `Deleted task "${task.title}"` },
    });
  }

  async reorderTasks(updates: any[]): Promise<any> {
    return TaskRepository.bulkUpdateOrder(updates);
  }

  async getSubtasks(parentTaskId: string): Promise<ITaskDocument[]> {
    return TaskRepository.findSubtasks(parentTaskId);
  }

  async addComment(taskId: string, userId: string, content: string): Promise<ICommentDocument> {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    const comment = await CommentRepository.create({ taskId, userId, content } as Partial<ICommentDocument>);

    await ActivityRepository.create({
      entityType: 'Task',
      entityId: taskId as any,
      userId: userId as any,
      action: 'commented',
      metadata: { message: `Commented on "${task.title}"` },
    });

    return comment;
  }

  async getComments(taskId: string): Promise<ICommentDocument[]> {
    return CommentRepository.findByTask(taskId);
  }

  async deleteComment(commentId: string, userId: string): Promise<ICommentDocument | null> {
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.userId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return CommentRepository.delete(commentId);
  }

  async getActivity(taskId: string): Promise<any[]> {
    return ActivityRepository.findByEntity(taskId, 50);
  }

  async getProjectStats(projectId: string): Promise<Record<string, number>> {
    return TaskRepository.getStatusStats(projectId);
  }

  async search(userId: string, q: string): Promise<any[]> {
    if (!q || q.trim().length < 2) return [];
    return TaskRepository.search(userId, q.trim());
  }
}

export default new TaskService();
