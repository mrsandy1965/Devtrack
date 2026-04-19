import { Request, Response } from 'express';
import InternshipService from '../services/InternshipService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';
import AppError from '../utils/AppError';

const VALID_STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'];

class InternshipController {
  getApplications = asyncHandler(async (req: Request, res: Response) => {
    const apps = await InternshipService.getApplications((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, count: apps.length, applications: apps });
  });

  addApplication = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      companyName: ['required', { maxLength: 120 }],
      role:        ['required', { maxLength: 120 }],
      status:      [{ enum: VALID_STATUSES }],
    });

    const app = await InternshipService.addApplication((req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, application: app });
  });

  updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== ((req.user as any)._id || req.user.id).toString()) throw new AppError('Not authorized', 403);

    const updated = await InternshipService.updateApplication(req.params.id, req.body);
    res.status(200).json({ success: true, application: updated });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      status: ['required', { enum: VALID_STATUSES }],
    });

    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== ((req.user as any)._id || req.user.id).toString()) throw new AppError('Not authorized', 403);

    const updated = await InternshipService.updateStatus(req.params.id, (req.user as any)._id || req.user.id, req.body.status);
    res.status(200).json({ success: true, application: updated });
  });

  deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const app = await InternshipService.getApplicationById(req.params.id);
    if (!app) throw new AppError('Application not found', 404);
    if (app.userId.toString() !== ((req.user as any)._id || req.user.id).toString()) throw new AppError('Not authorized', 403);

    await InternshipService.deleteApplication(req.params.id);
    res.status(200).json({ success: true, message: 'Application deleted' });
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await InternshipService.getStats((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, stats });
  });
}

export default new InternshipController();
