const HabitLogRepository = require('../repositories/HabitLogRepository');
const InternshipRepository = require('../repositories/InternshipRepository');
const FocusSessionRepository = require('../repositories/FocusSessionRepository');
const HabitRepository = require('../repositories/HabitRepository');

// ─── Strategy Interface (base class) ───────────────────────────────────────
class ScoringStrategy {
  constructor(weight) {
    if (new.target === ScoringStrategy) {
      throw new Error('ScoringStrategy is abstract');
    }
    this.weight = weight; // 0..1, sum of all weights = 1
  }

  // Must be overridden
  async calculate(userId) {
    throw new Error('calculate() must be implemented by subclass');
  }
}

// ─── Concrete Strategy 1: Coding Consistency (40%) ──────────────────────────
class CodingConsistencyStrategy extends ScoringStrategy {
  constructor() {
    super(0.4);
  }

  async calculate(userId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logCount = await HabitLogRepository.countByUserInRange(userId, thirtyDaysAgo, now);
    // Max expected: 30 logs in 30 days → score 0-100
    const score = Math.min(100, (logCount / 30) * 100);
    return Math.round(score);
  }
}

// ─── Concrete Strategy 2: Application Activity (30%) ────────────────────────
class ApplicationActivityStrategy extends ScoringStrategy {
  constructor() {
    super(0.3);
  }

  async calculate(userId) {
    const stats = await InternshipRepository.getConversionStats(userId);
    let score = 0;

    // Points: just applied = 5 pts each, OA = 10, Interview = 20, Offer = 50
    score += (stats.Applied || 0) * 5;
    score += (stats.OA || 0) * 10;
    score += (stats.Interview || 0) * 20;
    score += (stats.Offer || 0) * 50;

    // Cap at 100
    return Math.min(100, score);
  }
}

// ─── Concrete Strategy 3: Focus Time (20%) ───────────────────────────────────
class FocusTimeStrategy extends ScoringStrategy {
  constructor() {
    super(0.2);
  }

  async calculate(userId) {
    const { totalMinutes } = await FocusSessionRepository.getTotalFocusTime(userId, 7);
    // Target: 300 mins/week (5hrs) = 100 score
    const score = Math.min(100, (totalMinutes / 300) * 100);
    return Math.round(score);
  }
}

// ─── Concrete Strategy 4: Streak Bonus (10%) ─────────────────────────────────
class StreakBonusStrategy extends ScoringStrategy {
  constructor() {
    super(0.1);
  }

  async calculate(userId) {
    const habits = await HabitRepository.findActiveByUser(userId);
    if (!habits.length) return 0;

    const maxStreak = Math.max(...habits.map((h) => h.streak));
    // 30 day streak = 100 score
    const score = Math.min(100, (maxStreak / 30) * 100);
    return Math.round(score);
  }
}

// ─── CareerScoreEngine (Context class) ───────────────────────────────────────
class CareerScoreEngine {
  constructor() {
    // Inject strategies
    this.strategies = [
      new CodingConsistencyStrategy(),
      new ApplicationActivityStrategy(),
      new FocusTimeStrategy(),
      new StreakBonusStrategy(),
    ];
  }

  /**
   * Calculate career score for a user.
   * Each strategy returns 0-100; final score = weighted sum.
   */
  async calculate(userId) {
    const breakdown = {};
    let totalScore = 0;

    for (const strategy of this.strategies) {
      const rawScore = await strategy.calculate(userId);
      const contribution = rawScore * strategy.weight;
      totalScore += contribution;

      // Label for breakdown (constructor name without "Strategy")
      const label = strategy.constructor.name.replace('Strategy', '');
      breakdown[label] = { score: rawScore, weight: strategy.weight, contribution };
    }

    return {
      total: Math.min(100, Math.round(totalScore)),
      breakdown,
    };
  }
}

// Singleton export
module.exports = new CareerScoreEngine();
