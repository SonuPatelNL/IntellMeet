import { User, IUser } from './user.model';
import { Types } from 'mongoose';
import { AppError } from '../../middleware/error.middleware';

function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export class UserService {
  static async getUserById(userId: string | Types.ObjectId): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  }

  static async updateProfile(
    userId: string | Types.ObjectId,
    updates: { name?: string; avatarUrl?: string }
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  }

  static async deleteAccount(userId: string | Types.ObjectId): Promise<void> {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw createError('User not found', 404);
    }
  }
}
