import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { AppError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  workspaceRole?: string;
}

export const requireAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    const error = new Error('Not authenticated') as AppError;
    error.statusCode = 401;
    error.isOperational = true;
    return next(error);
  }

  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (e) {
    const error = new Error('Invalid or expired token') as AppError;
    error.statusCode = 401;
    error.isOperational = true;
    return next(error);
  }
};

export const requireRole = (roles: Array<'admin' | 'manager' | 'user'>) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as any)) {
      const error = new Error('Forbidden: Insufficient permissions') as AppError;
      error.statusCode = 403;
      error.isOperational = true;
      return next(error);
    }
    next();
  };
};
