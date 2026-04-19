import FocusSessionRepository from '../repositories/FocusSessionRepository';
import CareerScoreEngine from '../utils/CareerScoreEngine';
import UserRepository from '../repositories/UserRepository';
import { IFocusSessionDocument } from '../models/FocusSession';

class FocusService {
  async startSession(userId: string, data: Partial<IFocusSessionDocument> = {}): Promise<IFocusSessionDocument> {
    const session = await FocusSessionRepository.create({
      userId,
      duration: data.duration || 25,
      habitId: data.habitId || null,
      notes: data.notes || '',
      startTime: new Date(),
      sessionDate: new Date(),
      completed: false,
    } as any);
    return session;
  }

  async endSession(sessionId: string, userId: string): Promise<IFocusSessionDocument | null> {
    const session = await FocusSessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId.toString() !== userId.toString()) throw new Error('Not authorized');

    const endTime = new Date();
    const updated = await FocusSessionRepository.update(sessionId, {
      endTime,
      completed: true,
    } as any);

    const { total } = await CareerScoreEngine.calculate(userId);
    await UserRepository.updateCareerScore(userId, total);

    return updated;
  }

  async getHistory(userId: string): Promise<IFocusSessionDocument[]> {
    return FocusSessionRepository.findByUser(userId);
  }

  async getStats(userId: string): Promise<any> {
    const weekly = await FocusSessionRepository.getTotalFocusTime(userId, 7);
    const monthly = await FocusSessionRepository.getTotalFocusTime(userId, 30);
    return { weekly, monthly };
  }

  async deleteSession(sessionId: string): Promise<IFocusSessionDocument | null> {
    return FocusSessionRepository.delete(sessionId);
  }
}

export default new FocusService();
