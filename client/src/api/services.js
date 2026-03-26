import api from './client';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  remove: (id) => api.delete(`/habits/${id}`),
  log: (id, data) => api.post(`/habits/${id}/log`, data),
  getLogs: (id) => api.get(`/habits/${id}/logs`),
  getHeatmap: () => api.get('/habits/heatmap/data'),
};

export const internshipsAPI = {
  getAll: () => api.get('/internships'),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  updateStatus: (id, status) => api.patch(`/internships/${id}/status`, { status }),
  remove: (id) => api.delete(`/internships/${id}`),
  getStats: () => api.get('/internships/stats'),
};

export const focusAPI = {
  start: (data) => api.post('/focus/start', data),
  end: (id) => api.patch(`/focus/${id}/end`),
  getHistory: () => api.get('/focus/history'),
  getStats: () => api.get('/focus/stats'),
};

export const githubAPI = {
  connect: (data) => api.post('/github/connect', data),
  sync: () => api.get('/github/sync'),
  getHeatmap: () => api.get('/github/heatmap'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};
