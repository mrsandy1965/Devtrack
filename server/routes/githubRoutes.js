const express = require('express');
const router = express.Router();
const GitHubController = require('../controllers/GitHubController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/connect', (req, res, next) => GitHubController.connectGithub(req, res, next));
router.get('/sync', (req, res, next) => GitHubController.syncCommits(req, res, next));
router.get('/heatmap', (req, res, next) => GitHubController.getHeatmap(req, res, next));
router.get('/profile/:username', (req, res, next) => GitHubController.getGithubProfile(req, res, next));

module.exports = router;
