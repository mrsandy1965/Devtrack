import { Request, Response, NextFunction } from 'express';
import DashboardService from '../services/DashboardService';

class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardData((req.user as any)._id || req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new DashboardController();
