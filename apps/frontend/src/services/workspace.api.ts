import { api } from './api';

export const workspaceApi = {
  list: () => api.get('/workspaces'),
  create: (payload: { name: string; description?: string }) => api.post('/workspaces', payload),
  get: (id: string) => api.get(`/workspaces/${id}`),
  inviteMember: (id: string, payload: { userId: string; role?: string }) => api.post(`/workspaces/${id}/members`, payload),
  removeMember: (id: string, userId: string) => api.delete(`/workspaces/${id}/members/${userId}`),
  updateRole: (id: string, userId: string, role: string) => api.patch(`/workspaces/${id}/members/${userId}/role`, { role }),
  updateSettings: (id: string, payload: { name?: string; description?: string }) => api.patch(`/workspaces/${id}/settings`, payload),
  createProject: (id: string, payload: { name: string; description?: string }) => api.post(`/workspaces/${id}/projects`, payload),
  listProjects: (id: string) => api.get(`/workspaces/${id}/projects`),
};

export const taskApi = {
  create: (payload: any) => api.post('/tasks', payload),
  list: (workspaceId: string) => api.get(`/tasks/workspace/${workspaceId}`),
  get: (id: string) => api.get(`/tasks/${id}`),
  update: (id: string, payload: any) => api.patch(`/tasks/${id}`, payload),
  addComment: (id: string, text: string) => api.post(`/tasks/${id}/comments`, { text }),
};
