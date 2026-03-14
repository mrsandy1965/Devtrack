const express = require('express');
const router = express.Router();
const FocusController = require('../controllers/FocusController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', (req, res, next) => FocusController.startSession(req, res, next));
router.patch('/:id/end', (req, res, next) => FocusController.endSession(req, res, next));
router.get('/history', (req, res, next) => FocusController.getHistory(req, res, next));
router.get('/stats', (req, res, next) => FocusController.getStats(req, res, next));
router.delete('/:id', (req, res, next) => FocusController.deleteSession(req, res, next));

module.exports = router;
