import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '@/services/workspace.api';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { connectSocket } from '@/services/socket.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WorkspaceBoard } from '@/components/workspace/WorkspaceBoard';

export default function WorkspacesPage() {
  const queryClient = useQueryClient();
  const { workspaces, setWorkspaces, selectedWorkspaceId, selectWorkspace } = useWorkspaceStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    connectSocket();
  }, []);

  const { data: response } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.list(),
  });

  useEffect(() => {
    if (response?.data?.data?.workspaces) {
      setWorkspaces(response.data.data.workspaces);
      if (!selectedWorkspaceId && response.data.data.workspaces[0]) {
        selectWorkspace(response.data.data.workspaces[0]._id);
      }
    }
  }, [response, selectedWorkspaceId, selectWorkspace, setWorkspaces]);

  const createWorkspaceMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => workspaceApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setName('');
      setDescription('');
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-semibold text-white">Enterprise Workspaces</h1>
          <p className="mt-1 text-sm text-slate-400">Create workspaces, manage members, and run projects with live Kanban updates.</p>
          <form onSubmit={(e) => { e.preventDefault(); createWorkspaceMutation.mutate({ name, description }); }} className="mt-4 flex flex-wrap gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" className="max-w-xs" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="max-w-sm" />
            <Button type="submit" className="bg-primary">Create Workspace</Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {workspaces.map((workspace) => (
            <button key={workspace._id} onClick={() => selectWorkspace(workspace._id)} className={`rounded-full border px-3 py-1.5 text-sm ${selectedWorkspaceId === workspace._id ? 'border-primary bg-primary/15 text-primary' : 'border-slate-800 text-slate-300'}`}>
              {workspace.name}
            </button>
          ))}
        </div>

        {selectedWorkspaceId ? <WorkspaceBoard /> : <p className="text-slate-400">Create or select a workspace to view projects and tasks.</p>}
      </div>
    </div>
  );
}
