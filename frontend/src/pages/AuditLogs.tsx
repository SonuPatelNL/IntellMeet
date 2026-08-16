import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAuditLogs } from "@/services/auditLogs.api"

export default function AuditLogs() {
  const [user, setUser] = useState<string>("")
  const [actionFilter, setActionFilter] = useState<string>("")

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["auditLogs", user, actionFilter],
    queryFn: () => getAuditLogs({ 
      user: user || undefined, 
      action: actionFilter || undefined
    }),
  })

  const formatDate = (date: string) => new Date(date).toLocaleString()
  const logsData = logs?.data || []

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      
      <div className="flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search by user..."
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-[250px] h-10 px-3 rounded-md border bg-background"
        />
        
        <select 
          value={actionFilter} 
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-[200px] h-10 px-3 rounded-md border bg-background"
        >
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="password_change">Password Change</option>
          <option value="meeting_create">Meeting Create</option>
          <option value="member_invite">Member Invite</option>
          <option value="member_remove">Member Remove</option>
          <option value="member_role_update">Member Role Update</option>
        </select>

        <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-black text-white rounded-md">
          Refresh
        </button>
      </div>

      <table className="w-full text-sm">
        <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>
          {isLoading? <tr><td colSpan={4}>Loading...</td></tr> : 
          logsData.map((log: any) => (
            <tr key={log.id}>
              <td>{formatDate(log.createdAt)}</td>
              <td>{log.user?.email || 'System'}</td>
              <td>{log.action}</td>
              <td>{log.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
