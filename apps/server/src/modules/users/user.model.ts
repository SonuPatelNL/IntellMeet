import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';
import { env } from '../../config/env';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  lastSeenAt?: Date;
  settings: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    desktopNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  lastSeenAt?: Date;
  settings: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    desktopNotifications: boolean;
  };
  setPassword(password: string): void;
  comparePassword(password: string): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      desktopNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.salt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Instance Methods for password security ────────────
UserSchema.methods.setPassword = function (password: string): void {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
    .pbkdf2Sync(password, this.salt, env.passwordHashIterations, 64, 'sha512')
    .toString('hex');
};

UserSchema.methods.comparePassword = function (password: string): boolean {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.passwordHash === hash;
};

// ── Indexes ───────────────────────────────────────────
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ name: 'text', email: 'text' });

export const User = model<IUserDocument>('User', UserSchema);
