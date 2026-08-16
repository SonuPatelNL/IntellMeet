import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  creatorId: Types.ObjectId;
  meetingId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  workspaceId: Types.ObjectId;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ workspaceId: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ meetingId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ITask>('Task', TaskSchema);
