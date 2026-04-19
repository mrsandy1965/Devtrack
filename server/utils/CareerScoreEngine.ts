import HabitLogRepository from '../repositories/HabitLogRepository';
import InternshipRepository from '../repositories/InternshipRepository';
import FocusSessionRepository from '../repositories/FocusSessionRepository';
import HabitRepository from '../repositories/HabitRepository';

abstract class ScoringStrategy {
  weight: number;

  constructor(weight: number) {
    this.weight = weight;
  }

  abstract calculate(userId: string): Promise<number>;
}

class CodingConsistencyStrategy extends ScoringStrategy {
  constructor() {
    super(0.4);
  }

  async calculate(userId: string): Promise<number> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logCount = await HabitLogRepository.countByUserInRange(userId, thirtyDaysAgo, now);
    const score = Math.min(100, (logCount / 30) * 100);
    return Math.round(score);
  }
}

class ApplicationActivityStrategy extends ScoringStrategy {
  constructor() {
    super(0.3);
  }

  async calculate(userId: string): Promise<number> {
    const stats: any = await InternshipRepository.getConversionStats(userId);
    let score = 0;

    score += (stats.Applied || 0) * 5;
    score += (stats.OA || 0) * 10;
    score += (stats.Interview || 0) * 20;
    score += (stats.Offer || 0) * 50;

    return Math.min(100, score);
  }
}

class FocusTimeStrategy extends ScoringStrategy {
  constructor() {
    super(0.2);
  }

  async calculate(userId: string): Promise<number> {
    const result = await FocusSessionRepository.getTotalFocusTime(userId, 7);
    const totalMinutes = result ? result.totalMinutes : 0;
    const score = Math.min(100, (totalMinutes / 300) * 100);
    return Math.round(score);
  }
}

class StreakBonusStrategy extends ScoringStrategy {
  constructor() {
    super(0.1);
  }

  async calculate(userId: string): Promise<number> {
    const habits: any[] = await HabitRepository.findActiveByUser(userId);
    if (!habits.length) return 0;

    const maxStreak = Math.max(...habits.map((h) => h.streak || 0));
    const score = Math.min(100, (maxStreak / 30) * 100);
    return Math.round(score);
  }
}

class CareerScoreEngine {
  strategies: ScoringStrategy[];

  constructor() {
    this.strategies = [
      new CodingConsistencyStrategy(),
      new ApplicationActivityStrategy(),
      new FocusTimeStrategy(),
      new StreakBonusStrategy(),
    ];
  }

  async calculate(userId: string): Promise<{ total: number; breakdown: Record<string, any> }> {
    const breakdown: Record<string, any> = {};
    let totalScore = 0;

    for (const strategy of this.strategies) {
      const rawScore = await strategy.calculate(userId);
      const contribution = rawScore * strategy.weight;
      totalScore += contribution;

      const label = strategy.constructor.name.replace('Strategy', '');
      breakdown[label] = { score: rawScore, weight: strategy.weight, contribution };
    }

    return {
      total: Math.min(100, Math.round(totalScore)),
      breakdown,
    };
  }
}

export default new CareerScoreEngine();
