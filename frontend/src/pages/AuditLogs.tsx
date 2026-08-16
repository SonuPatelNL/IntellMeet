import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAuditLogs } from "@/services/auditLogs.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AuditLogs() {
  const [user, setUser] = useState<string>("")
  const [actionFilter, setActionFilter] = useState<string>("")

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["auditLogs", user, actionFilter],
    queryFn: () => getAuditLogs({ 
      user: user || undefined, 
      action: actionFilter || undefined // Fixed: no.filter here
    }),
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const logsData = logs?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-slate-400">Track login, logout, password changes, meeting creation, and member updates</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by user..."
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-[250px]"
        />
        
        <Select value={actionFilter} onValueChange={(value) => setActionFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="password_change">Password Change</SelectItem>
            <SelectItem value="meeting_create">Meeting Create</SelectItem>
            <SelectItem value="member_invite">Member Invite</SelectItem>
            <SelectItem value="member_remove">Member Remove</SelectItem>
            <SelectItem value="member_role_update">Member Role Update</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" onClick={() => refetch()} className="bg-primary text-white">
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Action</th>
              <th className="text-left p-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-500">
                  Loading logs...
                </td>
              </tr>
            ) : logsData.length === 0? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logsData.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-3">{formatDate(log.createdAt)}</td>
                  <td className="p-3">{log.user?.email || 'System'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

