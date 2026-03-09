const InternshipRepository = require('../repositories/InternshipRepository');
const CareerScoreEngine = require('../utils/CareerScoreEngine');
const UserRepository = require('../repositories/UserRepository');

class InternshipService {
  async addApplication(userId, data) {
    const app = await InternshipRepository.create({
      ...data,
      userId,
      statusHistory: [{ status: data.status || 'Applied', changedAt: new Date() }],
    });

    // Update score
    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return app;
  }

  async getApplications(userId) {
    return InternshipRepository.findByUser(userId);
  }

  async getApplicationById(id) {
    return InternshipRepository.findById(id);
  }

  async updateStatus(id, userId, newStatus) {
    const app = await InternshipRepository.findById(id);
    if (!app) throw new Error('Application not found');

    const updated = await InternshipRepository.appendStatusHistory(id, newStatus);

    // Recalculate career score on status change
    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return updated;
  }

  async updateApplication(id, data) {
    return InternshipRepository.update(id, data);
  }

  async deleteApplication(id) {
    return InternshipRepository.delete(id);
  }

  async getStats(userId) {
    return InternshipRepository.getConversionStats(userId);
  }
}

module.exports = new InternshipService();
