const InternshipService = require('../services/InternshipService');
const asyncHandler = require('../utils/asyncHandler');
const Validator = require('../utils/Validator');
const AppError = require('../utils/AppError');

const VALID_STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'];

class InternshipController {
  getApplications = asyncHandler(async (req, res) => {
    const apps = await InternshipService.getApplications(req.user.id);
    res.status(200).json({ success: true, count: apps.length, applications: apps });
  });

  addApplication = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      companyName: ['required', { maxLength: 120 }],
      role:        ['required', { maxLength: 120 }],
      status:      [{ enum: VALID_STATUSES }],
    });

    const app = await InternshipService.addApplication(req.user.id, req.body);
    res.status(201).json({ success: true, application: app });
  });

  updateApplication = asyncHandler(async (req, res) => {
    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== req.user.id.toString()) throw new AppError('Not authorized', 403);

    const updated = await InternshipService.updateApplication(req.params.id, req.body);
    res.status(200).json({ success: true, application: updated });
  });

  updateStatus = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      status: ['required', { enum: VALID_STATUSES }],
    });

    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== req.user.id.toString()) throw new AppError('Not authorized', 403);

    const updated = await InternshipService.updateStatus(req.params.id, req.user.id, req.body.status);
    res.status(200).json({ success: true, application: updated });
  });

  deleteApplication = asyncHandler(async (req, res) => {
    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== req.user.id.toString()) throw new AppError('Not authorized', 403);

    await InternshipService.deleteApplication(req.params.id);
    res.status(200).json({ success: true, message: 'Application deleted' });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await InternshipService.getStats(req.user.id);
    res.status(200).json({ success: true, stats });
  });
}

module.exports = new InternshipController();
