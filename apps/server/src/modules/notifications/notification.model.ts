import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  message: string;
  type: 'meeting_invite' | 'meeting_reminder' | 'task_assigned' | 'mention' | 'ai_task_assigned' | 'system';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    type: {
      type: String,
      enum: ['meeting_invite', 'meeting_reminder', 'task_assigned', 'mention', 'ai_task_assigned', 'system'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
