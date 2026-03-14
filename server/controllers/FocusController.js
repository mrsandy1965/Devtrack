const FocusService = require('../services/FocusService');

class FocusController {
  async startSession(req, res, next) {
    try {
      const session = await FocusService.startSession(req.user.id, req.body);
      res.status(201).json({ success: true, session });
    } catch (err) {
      next(err);
    }
  }

  async endSession(req, res, next) {
    try {
      const session = await FocusService.endSession(req.params.id, req.user.id);
      res.status(200).json({ success: true, session });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const sessions = await FocusService.getHistory(req.user.id);
      res.status(200).json({ success: true, sessions });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await FocusService.getStats(req.user.id);
      res.status(200).json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  }

  async deleteSession(req, res, next) {
    try {
      await FocusService.deleteSession(req.params.id);
      res.status(200).json({ success: true, message: 'Session deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FocusController();
