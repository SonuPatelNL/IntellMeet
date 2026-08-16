import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, workspaceApi } from '@/services/workspace.api';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { getSocket } from '@/services/socket.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const columns = [
  { id: 'todo', label: 'To Do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
];

export const WorkspaceBoard = () => {
  const queryClient = useQueryClient();
  const { selectedWorkspaceId, tasks, setTasks, updateTask } = useWorkspaceStore();
  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState('todo');

  const { data: workspaceResponse } = useQuery({
    queryKey: ['workspace-detail', selectedWorkspaceId],
    queryFn: () => workspaceApi.get(selectedWorkspaceId!),
    enabled: Boolean(selectedWorkspaceId),
  });

  const { data: tasksResponse } = useQuery({
    queryKey: ['workspace-tasks', selectedWorkspaceId],
    queryFn: () => taskApi.list(selectedWorkspaceId!),
    enabled: Boolean(selectedWorkspaceId),
  });

  useEffect(() => {
    if (tasksResponse?.data?.data?.tasks) {
      setTasks(tasksResponse.data.data.tasks);
    }
  }, [tasksResponse, setTasks]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;

    const socket = getSocket();
    socket.emit('workspace:join', { workspaceId: selectedWorkspaceId });
    socket.on('task:created', ({ task }) => updateTask(task));
    socket.on('task:updated', ({ task }) => updateTask(task));
    socket.on('task:comment-added', ({ task }) => updateTask(task));

    return () => {
      socket.emit('workspace:leave', { workspaceId: selectedWorkspaceId });
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:comment-added');
    };
  }, [selectedWorkspaceId, updateTask]);

  const createTaskMutation = useMutation({
    mutationFn: (payload: any) => taskApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', selectedWorkspaceId] });
      setTitle('');
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !title.trim()) return;
    createTaskMutation.mutate({ title: title.trim(), workspaceId: selectedWorkspaceId, columnId });
  };

  const grouped = useMemo(() => {
    const groupedTasks = columns.reduce((acc, col) => ({ ...acc, [col.id]: [] as any[] }), {} as Record<string, any[]>);
    tasks.forEach((task) => {
      const key = task.columnId || 'todo';
      if (groupedTasks[key]) groupedTasks[key].push(task);
    });
    return groupedTasks;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-lg font-semibold text-white">{workspaceResponse?.data?.data?.workspace?.name || 'Workspace'}</h3>
        <p className="text-sm text-slate-400">Create tasks and track progress in real time.</p>
        <form onSubmit={handleCreateTask} className="mt-4 flex flex-wrap gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="max-w-xs" />
          <select value={columnId} onChange={(e) => setColumnId(e.target.value)} className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white">
            {columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
          </select>
          <Button type="submit" className="bg-primary">Add Task</Button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <h4 className="mb-3 font-semibold text-white">{column.label}</h4>
            <div className="space-y-2">
              {grouped[column.id].map((task) => (
                <div key={task._id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                  <div className="font-medium">{task.title}</div>
                  {task.description ? <p className="mt-1 text-xs text-slate-400">{task.description}</p> : null}
                  {task.assigneeId ? <p className="mt-2 text-xs text-primary">Assigned to {task.assigneeId.name}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
