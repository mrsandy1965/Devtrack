const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res, next) => DashboardController.getDashboard(req, res, next));

module.exports = router;
