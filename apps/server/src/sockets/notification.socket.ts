import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.server';
import { NotificationService } from '../modules/notifications/notification.service';

export const setupNotificationHandlers = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user!.userId;

  socket.on('notifications:mark-read', async (payload: { notificationId: string }, callback?: Function) => {
    try {
      const notification = await NotificationService.markAsRead(payload.notificationId, userId);
      socket.emit('notifications:read', { notification });
      callback?.({ status: 'success', notification });
    } catch (error: any) {
      callback?.({ status: 'error', message: error.message });
    }
  });

  socket.on('notifications:mark-all-read', async (_payload: unknown, callback?: Function) => {
    try {
      const updatedCount = await NotificationService.markAllAsRead(userId);
      socket.emit('notifications:all-read', { updatedCount });
      callback?.({ status: 'success', updatedCount });
    } catch (error: any) {
      callback?.({ status: 'error', message: error.message });
    }
  });

  socket.on('notifications:preferences:update', async (payload: Record<string, boolean>, callback?: Function) => {
    try {
      const preferences = await NotificationService.updatePreferences(userId, payload);
      socket.emit('notifications:preferences:updated', { preferences });
      callback?.({ status: 'success', preferences });
    } catch (error: any) {
      callback?.({ status: 'error', message: error.message });
    }
  });

  socket.on('notifications:history:request', async (payload: { page?: number; limit?: number }, callback?: Function) => {
    try {
      const page = payload?.page ?? 1;
      const limit = payload?.limit ?? 20;
      const notifications = await NotificationService.getNotificationsForUser(userId, { page, limit });
      callback?.({ status: 'success', ...notifications });
    } catch (error: any) {
      callback?.({ status: 'error', message: error.message });
    }
  });
};
