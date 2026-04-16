const ProjectRepository = require('../repositories/ProjectRepository');
const TaskRepository    = require('../repositories/TaskRepository');
const ActivityRepository = require('../repositories/ActivityRepository');
const AppError = require('../utils/AppError');

class ProjectService {
  async createProject(userId, data) {
    const project = await ProjectRepository.create({ ...data, ownerId: userId });

    await ActivityRepository.log({
      entityType: 'project',
      entityId:   project._id,
      userId,
      action:     'created',
      message:    `Created project "${project.name}"`,
    });

    return project;
  }

  async getProjects(userId) {
    const projects = await ProjectRepository.findByOwner(userId);

    // Attach task counts to each project (parallel)
    return Promise.all(
      projects.map(async (p) => {
        const stats  = await TaskRepository.getStatusStats(p._id);
        const total  = Object.values(stats).reduce((a, b) => a + b, 0);
        const done   = stats.done || 0;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...p.toObject(), stats: { ...stats, total }, progress };
      })
    );
  }

  async getProject(projectId, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.ownerId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return project;
  }

  async updateProject(projectId, userId, data) {
    const project = await this.getProject(projectId, userId);
    const updated = await ProjectRepository.update(projectId, data);

    await ActivityRepository.log({
      entityType: 'project',
      entityId:   projectId,
      userId,
      action:     'updated',
      message:    `Updated project "${updated.name}"`,
    });

    return updated;
  }

  async archiveProject(projectId, userId) {
    await this.getProject(projectId, userId); // ownership check
    return ProjectRepository.archive(projectId);
  }

  async deleteProject(projectId, userId) {
    await this.getProject(projectId, userId); // ownership check
    await ProjectRepository.delete(projectId);
  }
}

module.exports = new ProjectService();
