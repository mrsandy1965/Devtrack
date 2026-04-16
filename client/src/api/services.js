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

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll:   ()         => api.get('/projects'),
  create:   (data)     => api.post('/projects', data),
  get:      (id)       => api.get(`/projects/${id}`),
  update:   (id, data) => api.put(`/projects/${id}`, data),
  archive:  (id)       => api.patch(`/projects/${id}/archive`),
  delete:   (id)       => api.delete(`/projects/${id}`),
  getTasks: (id, params) => api.get(`/projects/${id}/tasks`, { params }),
  getBoard: (id)       => api.get(`/projects/${id}/board`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  create:        (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  get:           (id)              => api.get(`/tasks/${id}`),
  update:        (id, data)        => api.patch(`/tasks/${id}`, data),
  delete:        (id)              => api.delete(`/tasks/${id}`),
  reorder:       (updates)         => api.post('/tasks/reorder', { updates }),
  addComment:    (id, content)     => api.post(`/tasks/${id}/comments`, { content }),
  deleteComment: (id, commentId)   => api.delete(`/tasks/${id}/comments/${commentId}`),
  search:        (q)               => api.get('/tasks/search', { params: { q } }),
};

// ── Cycles ────────────────────────────────────────────────────────────────────
export const cyclesAPI = {
  getAll:     (projectId)       => api.get(`/projects/${projectId}/cycles`),
  create:     (projectId, data) => api.post(`/projects/${projectId}/cycles`, data),
  get:        (projectId, id)   => api.get(`/projects/${projectId}/cycles/${id}`),
  update:     (projectId, id, data) => api.put(`/projects/${projectId}/cycles/${id}`, data),
  delete:     (projectId, id)   => api.delete(`/projects/${projectId}/cycles/${id}`),
  addTask:    (projectId, id, taskId) => api.post(`/projects/${projectId}/cycles/${id}/tasks`, { taskId }),
  removeTask: (projectId, id, taskId) => api.delete(`/projects/${projectId}/cycles/${id}/tasks/${taskId}`),
};

