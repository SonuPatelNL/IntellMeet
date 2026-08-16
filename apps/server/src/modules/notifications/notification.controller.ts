import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotificationService } from './notification.service';

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const [result, unreadCount] = await Promise.all([
      NotificationService.getNotificationsForUser(userId, { page, limit }),
      NotificationService.getUnreadCount(userId),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        notifications: result.notifications,
        unreadCount,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const updatedCount = await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      status: 'success',
      data: { updatedCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const preferences = await NotificationService.getPreferences(userId);

    res.status(200).json({
      status: 'success',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const preferences = await NotificationService.updatePreferences(userId, req.body);

    res.status(200).json({
      status: 'success',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};
