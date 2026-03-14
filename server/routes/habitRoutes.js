const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/HabitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res, next) => HabitController.getHabits(req, res, next));
router.post('/', (req, res, next) => HabitController.createHabit(req, res, next));
router.put('/:id', (req, res, next) => HabitController.updateHabit(req, res, next));
router.delete('/:id', (req, res, next) => HabitController.deleteHabit(req, res, next));
router.post('/:id/log', (req, res, next) => HabitController.logActivity(req, res, next));
router.get('/:id/logs', (req, res, next) => HabitController.getLogs(req, res, next));
router.get('/heatmap/data', (req, res, next) => HabitController.getHeatmap(req, res, next));

module.exports = router;
