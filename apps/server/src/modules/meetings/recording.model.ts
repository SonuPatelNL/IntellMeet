import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecording extends Document {
  meetingId: Types.ObjectId;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  storageKey?: string;
  storageUrl?: string;
  signedUrl?: string;
  startedAt?: Date;
  stoppedAt?: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecordingSchema: Schema = new Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['recording', 'processing', 'ready', 'failed'],
      default: 'recording',
    },
    storageKey: {
      type: String,
    },
    storageUrl: {
      type: String,
    },
    signedUrl: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    stoppedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

RecordingSchema.index({ meetingId: 1, status: 1 });

export default mongoose.model<IRecording>('Recording', RecordingSchema);
