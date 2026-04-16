const FocusService = require('../services/FocusService');
const asyncHandler = require('../utils/asyncHandler');
const Validator = require('../utils/Validator');
const AppError = require('../utils/AppError');

class FocusController {
  startSession = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      duration: [{ min: 1, max: 120 }],
    });

    const session = await FocusService.startSession(req.user.id, req.body);
    res.status(201).json({ success: true, session });
  });

  endSession = asyncHandler(async (req, res) => {
    const session = await FocusService.endSession(req.params.id, req.user.id);
    res.status(200).json({ success: true, session });
  });

  getHistory = asyncHandler(async (req, res) => {
    const sessions = await FocusService.getHistory(req.user.id);
    res.status(200).json({ success: true, sessions });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await FocusService.getStats(req.user.id);
    res.status(200).json({ success: true, stats });
  });

  deleteSession = asyncHandler(async (req, res) => {
    await FocusService.deleteSession(req.params.id);
    res.status(200).json({ success: true, message: 'Session deleted' });
  });
}

module.exports = new FocusController();
