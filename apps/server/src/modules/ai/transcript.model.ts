import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITranscript extends Document {
  meetingId: Types.ObjectId;
  content: {
    speakerId?: Types.ObjectId; // Optional, might be unidentified speaker
    speakerName?: string;
    timestamp: number; // Offset in seconds from start
    text: string;
  }[];
  summary?: string;
  actionItemIds: Types.ObjectId[]; // References to created Tasks based on transcript
  metadata?: {
    keyPoints?: string[];
    decisions?: Array<{ title: string; detail?: string }>;
    sentiment?: { label: 'positive' | 'neutral' | 'negative'; score: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema: Schema = new Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true, // One transcript per meeting (could also be 1-to-N if we split them)
    },
    content: [
      {
        speakerId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        speakerName: {
          type: String,
        },
        timestamp: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    summary: {
      type: String,
    },
    actionItemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    metadata: {
      keyPoints: [String],
      decisions: [
        {
          title: String,
          detail: String,
        },
      ],
      sentiment: {
        label: String,
        score: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TranscriptSchema.index({ meetingId: 1 });

export default mongoose.model<ITranscript>('Transcript', TranscriptSchema);
