const GitHubService = require('../services/GitHubService');
const asyncHandler = require('../utils/asyncHandler');
const Validator = require('../utils/Validator');

class GitHubController {
  connectGithub = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      githubUsername: ['required', { maxLength: 80 }],
    });

    const { githubUsername, token } = req.body;
    const result = await GitHubService.connectGithub(req.user.id, githubUsername, token);
    res.status(200).json({ success: true, ...result });
  });

  syncCommits = asyncHandler(async (req, res) => {
    const result = await GitHubService.syncCommits(req.user);
    res.status(200).json({ success: true, ...result });
  });

  getHeatmap = asyncHandler(async (req, res) => {
    const heatmap = await GitHubService.getContributionHeatmap(req.user.id);
    res.status(200).json({ success: true, heatmap });
  });
}

module.exports = new GitHubController();
