import InternshipRepository from '../repositories/InternshipRepository';
import CareerScoreEngine from '../utils/CareerScoreEngine';
import UserRepository from '../repositories/UserRepository';
import { IInternshipApplicationDocument } from '../models/InternshipApplication';

class InternshipService {
  async addApplication(userId: string, data: Partial<IInternshipApplicationDocument>): Promise<IInternshipApplicationDocument> {
    const app = await InternshipRepository.create({
      ...data,
      userId,
      statusHistory: [{ status: data.status || 'Applied', changedAt: new Date() }],
    } as any);

    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return app;
  }

  async getApplications(userId: string): Promise<IInternshipApplicationDocument[]> {
    return InternshipRepository.findByUser(userId);
  }

  async getApplicationById(id: string): Promise<IInternshipApplicationDocument | null> {
    return InternshipRepository.findById(id);
  }

  async updateStatus(id: string, userId: string, newStatus: string): Promise<IInternshipApplicationDocument | null> {
    const app = await InternshipRepository.findById(id);
    if (!app) throw new Error('Application not found');

    const updated = await InternshipRepository.appendStatusHistory(id, newStatus);

    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return updated;
  }

  async updateApplication(id: string, data: Partial<IInternshipApplicationDocument>): Promise<IInternshipApplicationDocument | null> {
    return InternshipRepository.update(id, data);
  }

  async deleteApplication(id: string): Promise<IInternshipApplicationDocument | null> {
    return InternshipRepository.delete(id);
  }

  async getStats(userId: string): Promise<any> {
    return InternshipRepository.getConversionStats(userId);
  }
}

export default new InternshipService();
