const express = require('express');
const router  = express.Router({ mergeParams: true }); // needed for :projectId
const { protect } = require('../middleware/auth');
const CycleController = require('../controllers/CycleController');

router.use(protect);

router.get ('/',                  CycleController.getCycles);
router.post('/',                  CycleController.createCycle);
router.get ('/:id',               CycleController.getCycleDetail);
router.put ('/:id',               CycleController.updateCycle);
router.delete('/:id',             CycleController.deleteCycle);
router.post ('/:id/tasks',        CycleController.addTask);
router.delete('/:id/tasks/:taskId', CycleController.removeTask);

module.exports = router;
