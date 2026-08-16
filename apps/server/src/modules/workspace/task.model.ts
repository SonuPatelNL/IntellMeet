import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  workspaceId: Types.ObjectId;
  projectId?: Types.ObjectId;
  columnId: string;
  assigneeId?: Types.ObjectId;
  dueDate?: Date;
  labels: string[];
  comments: {
    userId: Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    columnId: {
      type: String,
      required: true,
      default: 'todo',
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    labels: [{ type: String, trim: true }],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ workspaceId: 1, columnId: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
