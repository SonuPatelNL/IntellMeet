import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  hostId: Types.ObjectId;
  attendees: Types.ObjectId[];
  workspaceId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MeetingSchema.index({ hostId: 1 });
MeetingSchema.index({ workspaceId: 1 });
MeetingSchema.index({ projectId: 1 });
MeetingSchema.index({ startTime: 1 });
MeetingSchema.index({ status: 1 });
MeetingSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
