import CareerScoreEngine from '../utils/CareerScoreEngine';
import HabitRepository from '../repositories/HabitRepository';
import InternshipRepository from '../repositories/InternshipRepository';
import FocusSessionRepository from '../repositories/FocusSessionRepository';
import HabitLogRepository from '../repositories/HabitLogRepository';

class DashboardService {
  async getDashboardData(userId: string): Promise<any> {
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
      ? Math.max(...habits.map((h: any) => h.currentStreak || 0))
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

export default new DashboardService();
