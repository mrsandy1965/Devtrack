const CycleService = require('../services/CycleService');
const asyncHandler = require('../utils/asyncHandler');
const Validator    = require('../utils/Validator');

class CycleController {
  getCycles = asyncHandler(async (req, res) => {
    const cycles = await CycleService.getCycles(req.params.projectId, req.user.id);
    res.json({ success: true, cycles });
  });

  createCycle = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      name:      ['required', { maxLength: 100 }],
      startDate: ['required'],
      endDate:   ['required'],
    });
    const cycle = await CycleService.createCycle(req.params.projectId, req.user.id, req.body);
    res.status(201).json({ success: true, cycle });
  });

  getCycleDetail = asyncHandler(async (req, res) => {
    const data = await CycleService.getCycleWithStats(req.params.id);
    res.json({ success: true, ...data });
  });

  updateCycle = asyncHandler(async (req, res) => {
    const cycle = await CycleService.updateCycle(req.params.id, req.user.id, req.body);
    res.json({ success: true, cycle });
  });

  deleteCycle = asyncHandler(async (req, res) => {
    await CycleService.deleteCycle(req.params.id, req.user.id);
    res.json({ success: true, message: 'Cycle deleted' });
  });

  addTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const task = await CycleService.addTaskToCycle(req.params.id, taskId, req.user.id);
    res.json({ success: true, task });
  });

  removeTask = asyncHandler(async (req, res) => {
    const task = await CycleService.removeTaskFromCycle(req.params.taskId, req.user.id);
    res.json({ success: true, task });
  });
}

module.exports = new CycleController();
