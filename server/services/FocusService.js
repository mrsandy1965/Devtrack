const FocusSessionRepository = require('../repositories/FocusSessionRepository');
const CareerScoreEngine = require('../utils/CareerScoreEngine');
const UserRepository = require('../repositories/UserRepository');

class FocusService {
  async startSession(userId, data = {}) {
    const session = await FocusSessionRepository.create({
      userId,
      duration: data.duration || 25,
      habitId: data.habitId || null,
      notes: data.notes || '',
      startTime: new Date(),
      sessionDate: new Date(),
      completed: false,
    });
    return session;
  }

  async endSession(sessionId, userId) {
    const session = await FocusSessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId.toString() !== userId.toString()) throw new Error('Not authorized');

    const endTime = new Date();
    const updated = await FocusSessionRepository.update(sessionId, {
      endTime,
      completed: true,
    });

    // Recalculate score after completing a focus session
    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return updated;
  }

  async getHistory(userId) {
    return FocusSessionRepository.findByUser(userId);
  }

  async getStats(userId) {
    const weekly = await FocusSessionRepository.getTotalFocusTime(userId, 7);
    const monthly = await FocusSessionRepository.getTotalFocusTime(userId, 30);
    return { weekly, monthly };
  }

  async deleteSession(sessionId) {
    return FocusSessionRepository.delete(sessionId);
  }
}

module.exports = new FocusService();
