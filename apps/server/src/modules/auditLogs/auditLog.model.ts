import { Schema, model, Document, Types } from 'mongoose';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  MEETING_CREATE = 'meeting_create',
  MEMBER_INVITE = 'member_invite',
  MEMBER_REMOVE = 'member_remove',
  MEMBER_ROLE_UPDATE = 'member_role_update',
  PERMISSION_UPDATE = 'permission_update',
}

export interface IAuditLog {
  user: Types.ObjectId;
  action: AuditAction;
  timestamp: Date;
  ip?: string;
  metadata?: Record<string, any>;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

AuditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = model<IAuditLogDocument>('AuditLog', AuditLogSchema);
