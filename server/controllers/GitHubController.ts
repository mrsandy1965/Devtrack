import { Request, Response } from 'express';
import GitHubService from '../services/GitHubService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';

class GitHubController {
  connectGithub = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      githubUsername: ['required', { maxLength: 80 }],
    });

    const { githubUsername, token } = req.body;
    const result = await GitHubService.connectGithub((req.user as any)._id || req.user.id, githubUsername, token);
    res.status(200).json({ success: true, ...result });
  });

  syncCommits = asyncHandler(async (req: Request, res: Response) => {
    const result = await GitHubService.syncCommits(req.user as any);
    res.status(200).json({ success: true, ...result });
  });

  getHeatmap = asyncHandler(async (req: Request, res: Response) => {
    const heatmap = await GitHubService.getContributionHeatmap((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, heatmap });
  });
}

export default new GitHubController();
