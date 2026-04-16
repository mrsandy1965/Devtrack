const GitHubAdapter = require('../utils/GitHubAdapter');
const HabitLogRepository = require('../repositories/HabitLogRepository');
const HabitRepository = require('../repositories/HabitRepository');
const UserRepository = require('../repositories/UserRepository');
const CareerScoreEngine = require('../utils/CareerScoreEngine');
const Habit = require('../models/Habit');

class GitHubService {
  async syncCommits(user) {
    if (!user.githubUsername) {
      throw new Error('No GitHub username linked. Please connect GitHub first.');
    }

    // Fetch full user record including the hidden githubToken field
    const fullUser = await UserRepository.findByIdWithToken(user._id);
    const token = fullUser.githubToken || null;

    const { totalCommits, dailyCounts } = await GitHubAdapter.getCommitCountLastNDays(
      user.githubUsername,
      token,
      30
    );

    // Find or create a GitHub-linked habit to attach logs to
    let habits = await HabitRepository.findByUser(user._id);
    let githubHabit = habits.find((h) => h.githubLinked) || habits[0];

    // Auto-create a "GitHub Activity" habit if the user has none
    if (!githubHabit) {
      githubHabit = await Habit.create({
        userId: user._id,
        title: 'GitHub Activity',
        type: 'project',
        recurrence: 'daily',
        githubLinked: true,
        isActive: true,
      });
    }

    // Upsert each day's commit count as a github-sourced habit log
    let saved = 0;
    for (const [dateStr, count] of Object.entries(dailyCounts)) {
      const logDate = new Date(dateStr);

      // Check if a github log already exists for this day to avoid duplicates
      const existing = await HabitLogRepository.findByHabitAndDateRange(
        githubHabit._id,
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
        });
        saved++;
      }
    }

    // Recalculate career score
    const { total } = await CareerScoreEngine.calculate(user._id);
    await UserRepository.updateCareerScore(user._id, total);

    return { totalCommits, daysWithCommits: Object.keys(dailyCounts).length, saved };
  }

  async getContributionHeatmap(userId) {
    return HabitLogRepository.getHeatmapData(userId, 90);
  }

  async getUserGithubInfo(username) {
    return GitHubAdapter.getUserInfo(username);
  }

  async connectGithub(userId, githubUsername, token = null) {
    // Verify the username exists on GitHub
    const info = await GitHubAdapter.getUserInfo(githubUsername, token);
    await UserRepository.saveGithubToken(userId, token, githubUsername);
    return { githubUsername: info.login, avatarUrl: info.avatar_url, name: info.name, publicRepos: info.public_repos };
  }
}

module.exports = new GitHubService();
