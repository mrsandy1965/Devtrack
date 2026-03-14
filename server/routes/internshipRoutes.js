const express = require('express');
const router = express.Router();
const InternshipController = require('../controllers/InternshipController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res, next) => InternshipController.getApplications(req, res, next));
router.post('/', (req, res, next) => InternshipController.addApplication(req, res, next));
router.get('/stats', (req, res, next) => InternshipController.getStats(req, res, next));
router.put('/:id', (req, res, next) => InternshipController.updateApplication(req, res, next));
router.patch('/:id/status', (req, res, next) => InternshipController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => InternshipController.deleteApplication(req, res, next));

module.exports = router;
