import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AnalyticsService } from './analytics.service';

export const getAnalyticsOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const overview = await AnalyticsService.getOverview();
    res.status(200).json({ status: 'success', data: { overview } });
  } catch (error) {
    next(error);
  }
};
