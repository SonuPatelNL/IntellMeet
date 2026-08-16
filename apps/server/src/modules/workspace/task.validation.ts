import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    workspaceId: objectIdSchema,
    projectId: objectIdSchema.optional(),
    columnId: z.string().max(50).optional(),
    assigneeId: objectIdSchema.optional(),
    dueDate: z.string().datetime({ message: 'Valid ISO datetime string is required' }).optional(),
    labels: z.array(z.string()).optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export const taskCommentSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ text: z.string().min(1).max(1000) }),
});
