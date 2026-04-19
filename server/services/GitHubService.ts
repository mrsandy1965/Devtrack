// import GitHubAdapter from '../utils/GitHubAdapter'; // Let's mock or skip the TS adapter if not done
// For now, since GitHubAdapter.js isn't fully TS yet, we can require it.
const GitHubAdapter = require('../utils/GitHubAdapter');
import HabitLogRepository from '../repositories/HabitLogRepository';
import HabitRepository from '../repositories/HabitRepository';
import UserRepository from '../repositories/UserRepository';
import CareerScoreEngine from '../utils/CareerScoreEngine';
import Habit from '../models/Habit';
import { IUserDocument } from '../models/User';

class GitHubService {
  async syncCommits(user: IUserDocument): Promise<any> {
    if (!user.githubUsername) {
      throw new Error('No GitHub username linked. Please connect GitHub first.');
    }

    const fullUser = await UserRepository.findByIdWithToken(user._id as string);
    const token = fullUser?.githubToken || null;

    const { totalCommits, dailyCounts } = await GitHubAdapter.getCommitCountLastNDays(
      user.githubUsername,
      token,
      30
    );

    let habits = await HabitRepository.findByUser(user._id as string);
    let githubHabit = habits.find((h: any) => h.githubLinked) || habits[0];

    if (!githubHabit) {
      githubHabit = await Habit.create({
        userId: user._id,
        title: 'GitHub Activity',
        type: 'project',
        recurrence: 'daily',
        githubLinked: true,
        isActive: true,
      } as any);
    }

    let saved = 0;
    for (const [dateStr, count] of Object.entries(dailyCounts)) {
      const logDate = new Date(dateStr);

      const existing = await HabitLogRepository.findByHabitAndDateRange(
        githubHabit._id as string,
        new Date(logDate.setHours(0, 0, 0, 0)),
        new Date(logDate.setHours(23, 59, 59, 999))
      );

      if (existing.length === 0) {
        await HabitLogRepository.create({
          habitId: githubHabit._id,
          userId: user._id,
          logDate: new Date(dateStr),
          commitCount: count,
          source: 'github',
          completed: true,
        } as any);
        saved++;
      }
    }

    const { total } = await CareerScoreEngine.calculate(user._id as string);
    await UserRepository.updateCareerScore(user._id as string, total);

    return { totalCommits, daysWithCommits: Object.keys(dailyCounts).length, saved };
  }

  async getContributionHeatmap(userId: string): Promise<any> {
    return HabitLogRepository.getHeatmapData(userId, 90);
  }

  async getUserGithubInfo(username: string): Promise<any> {
    return GitHubAdapter.getUserInfo(username);
  }

  async connectGithub(userId: string, githubUsername: string, token: string | null = null): Promise<any> {
    const info = await GitHubAdapter.getUserInfo(githubUsername, token);
    await UserRepository.saveGithubToken(userId, token || '', githubUsername);
    return { githubUsername: info.login, avatarUrl: info.avatar_url, name: info.name, publicRepos: info.public_repos };
  }
}

export default new GitHubService();
