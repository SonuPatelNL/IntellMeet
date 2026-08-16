import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: Types.ObjectId;
  meetingInvite: boolean;
  meetingReminder: boolean;
  taskAssigned: boolean;
  mention: boolean;
  aiTaskAssigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    meetingInvite: {
      type: Boolean,
      default: true,
    },
    meetingReminder: {
      type: Boolean,
      default: true,
    },
    taskAssigned: {
      type: Boolean,
      default: true,
    },
    mention: {
      type: Boolean,
      default: true,
    },
    aiTaskAssigned: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);
