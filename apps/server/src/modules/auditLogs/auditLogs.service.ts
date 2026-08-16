import { AuditLog, AuditAction, IAuditLog } from './auditLog.model';
import { Types } from 'mongoose';

export class AuditLogService {
  static async createAuditLog(entry: {
    user: string | Types.ObjectId;
    action: AuditAction;
    ip?: string;
    metadata?: Record<string, any>;
  }) {
    return AuditLog.create({
      user: entry.user,
      action: entry.action,
      timestamp: new Date(),
      ip: entry.ip,
      metadata: entry.metadata || {},
    });
  }

  static async listAuditLogs(query: {
    action?: AuditAction;
    userId?: string;
    limit?: number;
    page?: number;
  }) {
    const filter: Record<string, any> = {};

    if (query.action) {
      filter.action = query.action;
    }
    if (query.userId) {
      filter.user = query.userId;
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 25));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role'),
      AuditLog.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
