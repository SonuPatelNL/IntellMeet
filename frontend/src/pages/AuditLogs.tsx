import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

const getAuditLogs = async (params: {user?: string, action?: string}) => {
  const query = new URLSearchParams(params as any).toString()
  const res = await fetch(`/api/audit-logs?${query}`)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

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
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px'}}>Audit Logs</h1>
      
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <input
          placeholder="Search by user..."
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
        />
        
        <select 
          value={actionFilter} 
          onChange={(e) => setActionFilter(e.target.value)}
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
        >
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="password_change">Password Change</option>
          <option value="meeting_create">Meeting Create</option>
          <option value="member_invite">Member Invite</option>
        </select>

        <button onClick={() => refetch()} style={{padding: '8px 16px', background: 'black', color: 'white', border: 'none', borderRadius: '4px'}}>
          Refresh
        </button>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Date</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>User</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logsData.map((log: any) => (
              <tr key={log.id}>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{formatDate(log.createdAt)}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{log.user?.email || 'System'}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
