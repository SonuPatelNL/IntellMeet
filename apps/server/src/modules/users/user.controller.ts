import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { User } from './user.model';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { storageService } from '../../storage/storage.service';
import { AuditLogService } from '../auditLogs/auditLogs.service';
import { AuditAction } from '../auditLogs/auditLog.model';

function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

/**
 * Get profile of current authenticated user.
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const user = await UserService.getUserById(userId);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile (e.g. name).
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;
    if (!name) {
      throw createError('Name is required', 400);
    }
    const user = await UserService.updateProfile(userId, { name });
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change current user password.
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }

    const user = await User.findById(userId).select('+passwordHash +salt');
    if (!user) {
      throw createError('User not found', 404);
    }

    const isMatch = user.comparePassword(currentPassword);
    if (!isMatch) {
      throw createError('Incorrect current password', 401);
    }

    user.setPassword(newPassword);
    await user.save();
    await AuditLogService.createAuditLog({
      user: user._id,
      action: AuditAction.PASSWORD_CHANGE,
      ip: req.ip,
      metadata: { email: user.email },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload avatar and save URL in user profile.
 */
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    if (!req.file) {
      throw createError('No image file provided', 400);
    }

    const folder = 'intellmeet/avatars';
    const uploadResult = await storageService.upload(req.file.buffer, {
      folder,
      filename: `user_${userId}`,
      contentType: req.file.mimetype,
    });

    const avatarUrl = uploadResult.url;

    // Update user profile with new avatar URL
    const user = await UserService.updateProfile(userId, { avatarUrl });

    res.status(200).json({
      status: 'success',
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete current user account.
 */
export const deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await UserService.deleteAccount(userId);
    
    // Clear cookies on account deletion
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
