const InternshipService = require('../services/InternshipService');

class InternshipController {
  async getApplications(req, res, next) {
    try {
      const apps = await InternshipService.getApplications(req.user.id);
      res.status(200).json({ success: true, count: apps.length, applications: apps });
    } catch (err) {
      next(err);
    }
  }

  async addApplication(req, res, next) {
    try {
      const app = await InternshipService.addApplication(req.user.id, req.body);
      res.status(201).json({ success: true, application: app });
    } catch (err) {
      next(err);
    }
  }

  async updateApplication(req, res, next) {
    try {
      const app = await InternshipService.updateApplication(req.params.id, req.body);
      res.status(200).json({ success: true, application: app });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }
      const app = await InternshipService.updateStatus(req.params.id, req.user.id, status);
      res.status(200).json({ success: true, application: app });
    } catch (err) {
      next(err);
    }
  }

  async deleteApplication(req, res, next) {
    try {
      await InternshipService.deleteApplication(req.params.id);
      res.status(200).json({ success: true, message: 'Application deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await InternshipService.getStats(req.user.id);
      res.status(200).json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InternshipController();
