import express from 'express';
import DashboardController from '../controllers/DashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, (req, res, next) => DashboardController.getDashboard(req, res, next));

export default router;
