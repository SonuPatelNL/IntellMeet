import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const notificationPreferencesSchema = z.object({
  body: z.object({
    meetingInvite: z.boolean().optional(),
    meetingReminder: z.boolean().optional(),
    taskAssigned: z.boolean().optional(),
    mention: z.boolean().optional(),
    aiTaskAssigned: z.boolean().optional(),
  }),
});
