import { api } from './api';

export interface AuditLogItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  timestamp: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export const auditLogsApi = {
  list: (params?: { action?: string; userId?: string; limit?: number; page?: number }) =>
    api.get<{ status: string; data: AuditLogsResponse }>('/audit-logs', { params }),
};
