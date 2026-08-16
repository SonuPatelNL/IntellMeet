import { create } from 'zustand';

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  columnId?: string;
  assigneeId?: { _id: string; name: string; avatarUrl?: string };
  dueDate?: string;
  labels?: string[];
  comments?: any[];
}

interface WorkspaceState {
  workspaces: any[];
  projects: any[];
  tasks: TaskItem[];
  selectedWorkspaceId: string | null;
  setWorkspaces: (workspaces: any[]) => void;
  setProjects: (projects: any[]) => void;
  setTasks: (tasks: TaskItem[]) => void;
  updateTask: (task: TaskItem) => void;
  selectWorkspace: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  projects: [],
  tasks: [],
  selectedWorkspaceId: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  updateTask: (task) => set((state) => ({ tasks: state.tasks.some((item) => item._id === task._id) ? state.tasks.map((item) => item._id === task._id ? task : item) : [...state.tasks, task] })),
  selectWorkspace: (id) => set({ selectedWorkspaceId: id }),
}));
