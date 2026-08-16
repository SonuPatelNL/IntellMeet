import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  senderId: Types.ObjectId;
  meetingId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  type: 'text' | 'file';
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    type: {
      type: String,
      enum: ['text', 'file'],
      default: 'text',
    },
    fileUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval in specific contexts
MessageSchema.index({ meetingId: 1, createdAt: 1 });
MessageSchema.index({ workspaceId: 1, createdAt: 1 });
MessageSchema.index({ projectId: 1, createdAt: 1 });
MessageSchema.index({ content: 'text' });

export default mongoose.model<IMessage>('Message', MessageSchema);
