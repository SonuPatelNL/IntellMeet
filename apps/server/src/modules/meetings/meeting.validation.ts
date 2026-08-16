import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate MongoDB ObjectId strings
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(1000).optional(),
    workspaceId: objectIdSchema.optional(),
    projectId: objectIdSchema.optional(),
  }),
});

export const scheduleMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(1000).optional(),
    startTime: z.string().datetime({ message: 'Valid ISO datetime string is required' }),
    workspaceId: objectIdSchema.optional(),
    projectId: objectIdSchema.optional(),
  }),
});

export const meetingIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
