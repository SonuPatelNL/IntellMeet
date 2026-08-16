import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getAnalyticsOverview } from './analytics.controller';

const router = Router();
router.use(requireAuth);
router.get('/overview', getAnalyticsOverview);

export default router;
