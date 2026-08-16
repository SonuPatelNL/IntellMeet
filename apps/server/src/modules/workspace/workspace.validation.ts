import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    userId: objectIdSchema,
    role: z.enum(['owner', 'admin', 'member', 'guest']).optional(),
  }),
});

export const memberRoleSchema = z.object({
  params: z.object({ id: objectIdSchema, userId: objectIdSchema }),
  body: z.object({ role: z.enum(['owner', 'admin', 'member', 'guest']) }),
});

export const createProjectSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }),
});
