import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  workspaceId: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ProjectSchema.index({ workspaceId: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
