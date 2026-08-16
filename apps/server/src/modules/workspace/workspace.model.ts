import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'guest';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'guest'],
          default: 'member',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
