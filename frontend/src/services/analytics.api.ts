import { api } from './api';

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
};
