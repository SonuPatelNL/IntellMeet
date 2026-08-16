import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'x-xsrf-token';

const sanitizeString = (value: string) => {
  return value
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/[\$\{\}]/g, '') // Remove structural injection characters
    .replace(/\.{2,}/g, '.') // Collapse repeated dots
    .trim();
};

const sanitizeObject = (value: any): any => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, nestedValue]) => {
      const sanitizedKey = key.replace(/[\$\.]/g, '');
      result[sanitizedKey] = sanitizeObject(nestedValue);
      return result;
    }, {} as Record<string, unknown>);
  }

  return value;
};

export const sanitizationMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};

const generateCsrfToken = () => crypto.randomBytes(24).toString('hex');

export const csrfProtection = (req: Request, _res: Response, next: NextFunction) => {
  const csrfToken = req.cookies?.[XSRF_COOKIE_NAME];

  if (!csrfToken) {
    return next();
  }

  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const headerToken = String(req.headers[XSRF_HEADER_NAME] || req.headers[XSRF_HEADER_NAME.toUpperCase()] || '');
  if (!headerToken || headerToken !== csrfToken) {
    const error = new Error('Invalid CSRF token') as any;
    error.statusCode = 403;
    error.isOperational = true;
    return next(error);
  }

  return next();
};

export const getCsrfToken = (req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.cookie(XSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
  res.json({ status: 'success', data: { csrfToken: token } });
};
