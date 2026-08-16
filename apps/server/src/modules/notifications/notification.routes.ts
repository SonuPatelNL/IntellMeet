import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from './notification.controller';
import { notificationIdParamSchema, notificationPreferencesSchema } from './notification.validation';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema), markNotificationAsRead);
router.get('/preferences', getNotificationPreferences);
router.patch('/preferences', validate(notificationPreferencesSchema), updateNotificationPreferences);

export default router;
