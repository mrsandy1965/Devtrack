const CareerScoreEngine = require('../utils/CareerScoreEngine');
const HabitRepository = require('../repositories/HabitRepository');
const InternshipRepository = require('../repositories/InternshipRepository');
const FocusSessionRepository = require('../repositories/FocusSessionRepository');
const HabitLogRepository = require('../repositories/HabitLogRepository');

class DashboardService {
  async getDashboardData(userId) {
    const [
      habits,
      internshipStats,
      weeklyFocus,
      careerScoreResult,
      recentLogs,
      heatmap,
    ] = await Promise.all([
      HabitRepository.findActiveByUser(userId),
      InternshipRepository.getConversionStats(userId),
      FocusSessionRepository.getTotalFocusTime(userId, 7),
      CareerScoreEngine.calculate(userId),
      HabitLogRepository.findByUserAndDateRange(
        userId,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      ),
      HabitLogRepository.getHeatmapData(userId, 90),
    ]);

    const topStreak = habits.length
      ? Math.max(...habits.map((h) => h.streak))
      : 0;

    return {
      careerScore: careerScoreResult.total,
      scoreBreakdown: careerScoreResult.breakdown,
      habits: {
        total: habits.length,
        topStreak,
        list: habits.slice(0, 5),
      },
      internships: internshipStats,
      focus: weeklyFocus,
      recentActivity: recentLogs.slice(0, 10),
      heatmap,
    };
  }
}

module.exports = new DashboardService();
