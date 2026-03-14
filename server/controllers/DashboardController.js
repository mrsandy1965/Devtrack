const DashboardService = require('../services/DashboardService');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
