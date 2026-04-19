import { Request, Response } from 'express';
import FocusService from '../services/FocusService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';

class FocusController {
  startSession = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      duration: [{ min: 1, max: 120 }],
    });

    const session = await FocusService.startSession((req.user as any)._id || req.user.id, req.body);
    res.status(201).json({ success: true, session });
  });

  endSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await FocusService.endSession(req.params.id, (req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, session });
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await FocusService.getHistory((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, sessions });
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await FocusService.getStats((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, stats });
  });

  deleteSession = asyncHandler(async (req: Request, res: Response) => {
    await FocusService.deleteSession(req.params.id);
    res.status(200).json({ success: true, message: 'Session deleted' });
  });
}

export default new FocusController();
