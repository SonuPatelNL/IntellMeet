import { Request, Response, NextFunction } from 'express';
import { User } from '../users/user.model';
import { AuthService } from './auth.service';
import { AppError } from '../../middleware/error.middleware';
import { AuditLogService } from '../auditLogs/auditLogs.service';
import { AuditAction } from '../auditLogs/auditLog.model';

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already in use') as AppError;
      error.statusCode = 409;
      error.isOperational = true;
      return next(error);
    }

    const passwordHash = await AuthService.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const accessToken = AuthService.generateAccessToken(user._id, user.role);
    const refreshToken = AuthService.generateRefreshToken(user._id, user.role);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      status: 'success',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }

    const isMatch = await AuthService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }

    const accessToken = AuthService.generateAccessToken(user._id, user.role);
    const refreshToken = AuthService.generateRefreshToken(user._id, user.role);

    setCookies(res, accessToken, refreshToken);
    await AuditLogService.createAuditLog({
      user: user._id,
      action: AuditAction.LOGIN,
      ip: req.ip,
      metadata: { email: user.email },
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  await AuditLogService.createAuditLog({
    user: (req as any).user?.userId ?? null,
    action: AuditAction.LOGOUT,
    ip: req.ip,
  });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      const error = new Error('No refresh token provided') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }

    try {
      const payload = AuthService.verifyRefreshToken(refreshToken);
      const newAccessToken = AuthService.generateAccessToken(payload.userId, payload.role);
      const newRefreshToken = AuthService.generateRefreshToken(payload.userId, payload.role);

      setCookies(res, newAccessToken, newRefreshToken);

      res.status(200).json({ status: 'success' });
    } catch (e) {
      const error = new Error('Invalid or expired refresh token') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};
