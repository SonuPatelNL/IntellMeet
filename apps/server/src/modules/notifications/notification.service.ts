import { Server } from 'socket.io';
import { Types } from 'mongoose';
import Notification, { INotification } from './notification.model';
import NotificationPreferences, { INotificationPreferences } from './preferences.model';
import { AppError } from '../../middleware/error.middleware';

function makeError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

type NotificationType = INotification['type'];

interface CreateNotificationInput {
  recipientId: string | Types.ObjectId;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export class NotificationService {
  static async getNotificationsForUser(
    userId: string | Types.ObjectId,
    options: NotificationQueryOptions = {}
  ) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));

    const filter: { recipientId: string | Types.ObjectId; isRead?: boolean } = {
      recipientId: userId,
    };

    if (options.unreadOnly) {
      filter.isRead = false;
    }

    const query = Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate('recipientId', 'name avatarUrl');

    const [notifications, total] = await Promise.all([
      query.skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    };
  }

  static async getUnreadCount(userId: string | Types.ObjectId): Promise<number> {
    return Notification.countDocuments({ recipientId: userId, isRead: false });
  }

  static async markAsRead(notificationId: string, userId: string | Types.ObjectId): Promise<INotification> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw makeError('Notification not found', 404);
    }

    return notification;
  }

  static async markAllAsRead(userId: string | Types.ObjectId): Promise<number> {
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    return result.modifiedCount;
  }

  static async getPreferences(userId: string | Types.ObjectId): Promise<INotificationPreferences> {
    let preferences = await NotificationPreferences.findOne({ userId });

    if (!preferences) {
      preferences = await NotificationPreferences.create({ userId });
    }

    return preferences;
  }

  static async updatePreferences(
    userId: string | Types.ObjectId,
    updates: Partial<Pick<INotificationPreferences, 'meetingInvite' | 'meetingReminder' | 'taskAssigned' | 'mention' | 'aiTaskAssigned'>>
  ): Promise<INotificationPreferences> {
    const preferences = await this.getPreferences(userId);
    Object.assign(preferences, updates);
    await preferences.save();
    return preferences;
  }

  static async createNotification(
    input: CreateNotificationInput,
    io?: Server
  ): Promise<INotification | null> {
    const recipientId = input.recipientId.toString();
    const preferences = await this.getPreferences(recipientId);
    const type = input.type ?? 'system';

    if (!this.isTypeEnabled(preferences, type)) {
      return null;
    }

    const notification = await Notification.create({
      recipientId: input.recipientId,
      message: input.message,
      type,
      link: input.link,
      metadata: input.metadata ?? {},
    });

    if (io) {
      io.to(`user:${recipientId}`).emit('notification:new', { notification });
    }

    return notification;
  }

  static async createMeetingInvitationNotification(
    recipientId: string | Types.ObjectId,
    message: string,
    link?: string,
    io?: Server
  ): Promise<INotification | null> {
    return this.createNotification({ recipientId, message, type: 'meeting_invite', link }, io);
  }

  static async createMeetingReminderNotification(
    recipientId: string | Types.ObjectId,
    message: string,
    link?: string,
    io?: Server
  ): Promise<INotification | null> {
    return this.createNotification({ recipientId, message, type: 'meeting_reminder', link }, io);
  }

  static async createTaskAssignmentNotification(
    recipientId: string | Types.ObjectId,
    message: string,
    link?: string,
    io?: Server
  ): Promise<INotification | null> {
    return this.createNotification({ recipientId, message, type: 'task_assigned', link }, io);
  }

  static async createMentionNotification(
    recipientId: string | Types.ObjectId,
    message: string,
    link?: string,
    io?: Server
  ): Promise<INotification | null> {
    return this.createNotification({ recipientId, message, type: 'mention', link }, io);
  }

  static async createAIAssignmentNotification(
    recipientId: string | Types.ObjectId,
    message: string,
    link?: string,
    io?: Server
  ): Promise<INotification | null> {
    return this.createNotification({ recipientId, message, type: 'ai_task_assigned', link }, io);
  }

  private static isTypeEnabled(
    preferences: INotificationPreferences,
    type: NotificationType
  ): boolean {
    switch (type) {
      case 'meeting_invite':
        return preferences.meetingInvite;
      case 'meeting_reminder':
        return preferences.meetingReminder;
      case 'task_assigned':
        return preferences.taskAssigned;
      case 'mention':
        return preferences.mention;
      case 'ai_task_assigned':
        return preferences.aiTaskAssigned;
      default:
        return true;
    }
  }
}
