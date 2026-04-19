import express from 'express';
import GitHubController from '../controllers/GitHubController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/connect', GitHubController.connectGithub);
router.get('/sync', GitHubController.syncCommits);
router.get('/heatmap', GitHubController.getHeatmap);

export default router;
