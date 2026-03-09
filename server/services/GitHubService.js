const GitHubAdapter = require('../utils/GitHubAdapter');
const HabitLogRepository = require('../repositories/HabitLogRepository');
const UserRepository = require('../repositories/UserRepository');
const CareerScoreEngine = require('../utils/CareerScoreEngine');

class GitHubService {
  async syncCommits(user) {
    if (!user.githubUsername) {
      throw new Error('No GitHub username linked. Please connect GitHub first.');
    }

    const token = user.githubToken || null;
    const { totalCommits, dailyCounts } = await GitHubAdapter.getCommitCountLastNDays(
      user.githubUsername,
      token,
      30
    );

    // Save each day's commit count as a github-sourced habit log
    let saved = 0;
    for (const [dateStr, count] of Object.entries(dailyCounts)) {
      const habits = await require('../repositories/HabitRepository').findByUser(user._id);
      const githubHabit = habits.find((h) => h.githubLinked) || habits[0];
      if (!githubHabit) continue;

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
    // Verify the username exists
    const info = await GitHubAdapter.getUserInfo(githubUsername, token);

    await UserRepository.saveGithubToken(userId, token, githubUsername);
    return { githubUsername: info.login, avatarUrl: info.avatar_url };
  }
}

module.exports = new GitHubService();
