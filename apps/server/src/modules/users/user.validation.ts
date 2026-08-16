import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  }),
});

const passwordPolicySchema = z
  .string()
  .min(10, 'New password must be at least 10 characters')
  .max(100, 'New password cannot exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/,
    'New password must include uppercase, lowercase, number, and special character'
  );

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordPolicySchema,
  }),
});
