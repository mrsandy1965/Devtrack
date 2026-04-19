import api from './client';

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data: any) => api.post('/habits', data),
  update: (id: string, data: any) => api.put(`/habits/${id}`, data),
  remove: (id: string) => api.delete(`/habits/${id}`),
  log: (id: string, data: any) => api.post(`/habits/${id}/log`, data),
  getLogs: (id: string) => api.get(`/habits/${id}/logs`),
  getHeatmap: () => api.get('/habits/heatmap/data'),
};

export const internshipsAPI = {
  getAll: () => api.get('/internships'),
  create: (data: any) => api.post('/internships', data),
  update: (id: string, data: any) => api.put(`/internships/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/internships/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/internships/${id}`),
  getStats: () => api.get('/internships/stats'),
};

export const focusAPI = {
  start: (data: any) => api.post('/focus/start', data),
  end: (id: string) => api.patch(`/focus/${id}/end`),
  getHistory: () => api.get('/focus/history'),
  getStats: () => api.get('/focus/stats'),
};

export const githubAPI = {
  connect: (data: any) => api.post('/github/connect', data),
  sync: () => api.get('/github/sync'),
  getHeatmap: () => api.get('/github/heatmap'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll:   () => api.get('/projects'),
  create:   (data: any) => api.post('/projects', data),
  get:      (id: string) => api.get(`/projects/${id}`),
  update:   (id: string, data: any) => api.put(`/projects/${id}`, data),
  archive:  (id: string) => api.patch(`/projects/${id}/archive`),
  delete:   (id: string) => api.delete(`/projects/${id}`),
  getTasks: (id: string, params: any) => api.get(`/projects/${id}/tasks`, { params }),
  getBoard: (id: string) => api.get(`/projects/${id}/board`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  create:        (projectId: string, data: any) => api.post(`/projects/${projectId}/tasks`, data),
  get:           (id: string) => api.get(`/tasks/${id}`),
  update:        (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  delete:        (id: string) => api.delete(`/tasks/${id}`),
  reorder:       (updates: any[]) => api.post('/tasks/reorder', { updates }),
  addComment:    (id: string, content: string) => api.post(`/tasks/${id}/comments`, { content }),
  deleteComment: (id: string, commentId: string) => api.delete(`/tasks/${id}/comments/${commentId}`),
  search:        (q: string) => api.get('/tasks/search', { params: { q } }),
};

// ── Cycles ────────────────────────────────────────────────────────────────────
export const cyclesAPI = {
  getAll:     (projectId: string) => api.get(`/projects/${projectId}/cycles`),
  create:     (projectId: string, data: any) => api.post(`/projects/${projectId}/cycles`, data),
  get:        (projectId: string, id: string) => api.get(`/projects/${projectId}/cycles/${id}`),
  update:     (projectId: string, id: string, data: any) => api.put(`/projects/${projectId}/cycles/${id}`, data),
  delete:     (projectId: string, id: string) => api.delete(`/projects/${projectId}/cycles/${id}`),
  addTask:    (projectId: string, id: string, taskId: string) => api.post(`/projects/${projectId}/cycles/${id}/tasks`, { taskId }),
  removeTask: (projectId: string, id: string, taskId: string) => api.delete(`/projects/${projectId}/cycles/${id}/tasks/${taskId}`),
};
