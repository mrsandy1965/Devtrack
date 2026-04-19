import ProjectRepository from '../repositories/ProjectRepository';
import TaskRepository from '../repositories/TaskRepository';
import ActivityRepository from '../repositories/ActivityRepository';
import AppError from '../utils/AppError';
import { IProjectDocument } from '../models/Project';

class ProjectService {
  async createProject(userId: string, data: Partial<IProjectDocument>): Promise<IProjectDocument> {
    const project = await ProjectRepository.create({ ...data, userId } as Partial<IProjectDocument>);

    await ActivityRepository.create({
      entityType: 'Project',
      entityId: project._id as any,
      userId: userId as any,
      action: 'created',
      metadata: { message: `Created project "${project.name}"` },
    });

    return project;
  }

  async getProjects(userId: string): Promise<any[]> {
    const projects = await ProjectRepository.findByOwner(userId);

    return Promise.all(
      projects.map(async (p: any) => {
        const stats = await TaskRepository.getStatusStats(p._id);
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        const done = stats['done'] || 0;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...p.toObject(), stats: { ...stats, total }, progress };
      })
    );
  }

  async getProject(projectId: string, userId: string): Promise<IProjectDocument> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId.toString() !== userId.toString()) throw new AppError('Not authorized', 403);
    return project;
  }

  async updateProject(projectId: string, userId: string, data: Partial<IProjectDocument>): Promise<IProjectDocument | null> {
    const project = await this.getProject(projectId, userId);
    const updated = await ProjectRepository.update(projectId, data);

    if (updated) {
      await ActivityRepository.create({
        entityType: 'Project',
        entityId: projectId as any,
        userId: userId as any,
        action: 'updated',
        metadata: { message: `Updated project "${updated.name}"` },
      });
    }

    return updated;
  }

  async archiveProject(projectId: string, userId: string): Promise<IProjectDocument | null> {
    await this.getProject(projectId, userId); 
    return ProjectRepository.archive(projectId);
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    await this.getProject(projectId, userId); 
    await ProjectRepository.delete(projectId);
  }
}

export default new ProjectService();
