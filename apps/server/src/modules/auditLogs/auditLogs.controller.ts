import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AuditLogService } from './auditLogs.service';
import { AuditAction } from './auditLog.model';

export const listAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { action, userId, limit, page } = req.query as Record<string, string>;

    const result = await AuditLogService.listAuditLogs({
      action: action as AuditAction | undefined,
      userId,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
