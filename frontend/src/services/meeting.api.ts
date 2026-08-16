// @ts-nocheck
import { api } from './api';

export const meetingApi = {
  createInstant: (data: { title: string; description?: string }) =>
    api.post('/meetings/instant', data),

  schedule: (data: { title: string; description?: string; startTime: string }) =>
    api.post('/meetings/schedule', data),

  getById: (id: string) => api.get(`/meetings/${id}`),

  join: (id: string) => api.post(`/meetings/${id}/join`),

  leave: (id: string) => api.post(`/meetings/${id}/leave`),

  cancel: (id: string) => api.post(`/meetings/${id}/cancel`),

  history: () => api.get('/meetings/history'),
};
