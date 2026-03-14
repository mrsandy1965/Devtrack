const GitHubService = require('../services/GitHubService');

class GitHubController {
  async connectGithub(req, res, next) {
    try {
      const { githubUsername, token } = req.body;
      if (!githubUsername) {
        return res.status(400).json({ success: false, message: 'GitHub username is required' });
      }
      const result = await GitHubService.connectGithub(req.user.id, githubUsername, token);
      res.status(200).json({ success: true, ...result, message: 'GitHub connected successfully' });
    } catch (err) {
      next(err);
    }
  }

  async syncCommits(req, res, next) {
    try {
      const result = await GitHubService.syncCommits(req.user);
      res.status(200).json({ success: true, ...result, message: 'GitHub commits synced' });
    } catch (err) {
      next(err);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const heatmap = await GitHubService.getContributionHeatmap(req.user.id);
      res.status(200).json({ success: true, heatmap });
    } catch (err) {
      next(err);
    }
  }

  async getGithubProfile(req, res, next) {
    try {
      const { username } = req.params;
      const profile = await GitHubService.getUserGithubInfo(username);
      res.status(200).json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GitHubController();
