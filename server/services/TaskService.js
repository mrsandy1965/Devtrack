const TaskRepository     = require('../repositories/TaskRepository');
const ProjectRepository  = require('../repositories/ProjectRepository');
const CommentRepository  = require('../repositories/CommentRepository');
const ActivityRepository = require('../repositories/ActivityRepository');
const AppError = require('../utils/AppError');

class TaskService {
  // ── Ownership guard ──────────────────────────────────────────────────────────
  async _assertOwner(taskId, userId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    const project = await ProjectRepository.findById(task.projectId);
    if (!project || project.ownerId.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }
    return task;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async createTask(userId, projectId, data) {
    // Verify project belongs to user
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.ownerId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);

    // Assign orderIndex at end of backlog column
    const existing = await TaskRepository.findByProject(projectId, { status: data.status || 'backlog' });
    const orderIndex = existing.length;

    const task = await TaskRepository.create({ ...data, projectId, creatorId: userId, orderIndex });

    await ActivityRepository.log({
      entityType: 'task',
      entityId:   task._id,
      userId,
      action:     'created',
      message:    `Created task "${task.title}"`,
    });

    return task;
  }

  async getProjectTasks(projectId, filters) {
    return TaskRepository.findByProject(projectId, filters);
  }

  async getTasksPaginated(projectId, options) {
    return TaskRepository.findByProjectPaginated(projectId, options);
  }

  async getTask(taskId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  async updateTask(taskId, userId, data) {
    const task    = await this._assertOwner(taskId, userId);
    const updated = await TaskRepository.update(taskId, data);

    // Log field-level change (Observer pattern)
    const changes = Object.keys(data)
      .filter((k) => ['status', 'priority', 'assignee', 'cycleId'].includes(k))
      .map((k) => `${k}: ${task[k]} → ${data[k]}`);

    if (changes.length > 0) {
      await ActivityRepository.log({
        entityType: 'task',
        entityId:   taskId,
        userId,
        action:     'updated',
        oldValue:   task.status,
        newValue:   data.status || task.status,
        message:    `Updated ${changes.join(', ')} on "${task.title}"`,
      });
    }

    return updated;
  }

  async deleteTask(taskId, userId) {
    const task = await this._assertOwner(taskId, userId);
    await TaskRepository.delete(taskId);

    await ActivityRepository.log({
      entityType: 'task',
      entityId:   taskId,
      userId,
      action:     'deleted',
      message:    `Deleted task "${task.title}"`,
    });
  }

  // ── Bulk operations ──────────────────────────────────────────────────────────
  async reorderTasks(updates) {
    return TaskRepository.bulkUpdateOrder(updates);
  }

  // ── Subtasks ─────────────────────────────────────────────────────────────────
  async getSubtasks(parentTaskId) {
    return TaskRepository.findSubtasks(parentTaskId);
  }

  // ── Comments ─────────────────────────────────────────────────────────────────
  async addComment(taskId, userId, content) {
    const task    = await TaskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    const comment = await CommentRepository.create({ taskId, authorId: userId, content });

    await ActivityRepository.log({
      entityType: 'comment',
      entityId:   taskId,
      userId,
      action:     'commented',
      message:    `Commented on "${task.title}"`,
    });

    return comment;
  }

  async getComments(taskId) {
    return CommentRepository.findByTask(taskId);
  }

  async deleteComment(commentId, userId) {
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.authorId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return CommentRepository.delete(commentId);
  }

  // ── Activity ─────────────────────────────────────────────────────────────────
  async getActivity(taskId) {
    return ActivityRepository.findByEntity(taskId, 50);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  async getProjectStats(projectId) {
    return TaskRepository.getStatusStats(projectId);
  }

  // ── Global search ────────────────────────────────────────────────────────────
  async search(userId, q) {
    if (!q || q.trim().length < 2) return [];
    return TaskRepository.search(userId, q.trim());
  }
}

module.exports = new TaskService();
