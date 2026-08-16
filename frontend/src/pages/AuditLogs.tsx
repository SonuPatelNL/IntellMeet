import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, AuditLogItem } from '@/services/auditLogs.api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function AuditLogs() {
  const { user } = useAuth();
  const [actionFilter, setActionFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', actionFilter],
    queryFn: () => auditLogsApi.list({ action: actionFilter || undefined }).then((res) => res.data.data),
    enabled: user?.role === 'admin',
    retry: false,
  });

  const logs = data?.items || [];

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <h1 className="text-lg font-semibold text-white">Audit Logs</h1>
        <p className="mt-3 text-sm">Only admin users can access enterprise audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-slate-400">Track login, logout, password changes, meeting creation, and member updates.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={actionFilter} onValueChange={(value) => setActionFilter(value)}>
            <option value="">All actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="password_change">Password Change</option>
            <option value="meeting_create">Meeting Create</option>
            <option value="member_invite">Member Invite</option>
            <option value="member_remove">Member Remove</option>
            <option value="member_role_update">Member Role Update</option>
          </Select>
          <Button type="button" onClick={() => refetch()} className="bg-primary text-white">
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-900 text-left text-slate-400 text-xs uppercase tracking-[0.15em]">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading audit records...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log: AuditLogItem) => (
                <tr key={log._id} className="border-t border-slate-800 hover:bg-slate-900/80">
                  <td className="px-4 py-4 text-slate-300">{formatDate(log.timestamp)}</td>
                  <td className="px-4 py-4 text-slate-200">
                    {log.user?.name || 'Unknown'}<span className="text-slate-500"> / {log.user?.email}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-200 capitalize">{log.action.replace('_', ' ')}</td>
                  <td className="px-4 py-4 text-slate-300">{log.ip || '—'}</td>
                  <td className="px-4 py-4 text-slate-300">
                    <pre className="whitespace-pre-wrap break-words text-[11px] text-slate-400">{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
