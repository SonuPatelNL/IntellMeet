import { z } from 'zod';
import { UserRole } from '../users/user.model';

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(10, 'Password must be at least 10 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/,
    'Password must include uppercase, lowercase, number, and special character'
  );

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: passwordSchema,
  role: z
    .nativeEnum(UserRole)
    .default(UserRole.MEMBER),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
