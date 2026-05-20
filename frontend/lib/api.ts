import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Prefer in-memory Zustand store token to avoid race with persist writing to localStorage
      try {
        const stateToken = useAuthStore.getState?.().token;
        const cleaned = stateToken ? (typeof stateToken === 'string' ? stateToken.replace(/\s+/g, '') : stateToken) : null;
        if (cleaned) {
          config.headers.Authorization = `Bearer ${cleaned}`;
          return config;
        }
      } catch {}

    const stored = sessionStorage.getItem('visaflow-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          const cleaned = typeof parsed.state.token === 'string' ? parsed.state.token.replace(/\s+/g, '') : parsed.state.token;
          config.headers.Authorization = `Bearer ${cleaned}`;
        }
      } catch {}
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage) {
          sessionStorage.removeItem('visaflow-auth');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const organizationsApi = {
  list: (params?: any) => api.get('/organizations', { params }),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  toggle: (id: string) => api.patch(`/organizations/${id}/toggle`),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  stats: (id: string) => api.get(`/organizations/${id}/stats`),
};

export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggle: (id: string) => api.patch(`/users/${id}/toggle`),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const groupsApi = {
  list: (params?: any) => api.get('/groups', { params }),
  listActive: () => api.get('/groups/active'),
  get: (id: string) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.put(`/groups/${id}`, data),
  assign: (id: string, employeeId: string) => api.post(`/groups/${id}/assign`, { employeeId }),
  archive: (id: string) => api.patch(`/groups/${id}/archive`),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

export const applicantsApi = {
  list: (params?: any) => api.get('/applicants', { params }),
  listGrouped: () => api.get('/applicants/grouped'),
  listByGroup: (groupId: string) => api.get(`/applicants/group/${groupId}`),
  get: (id: string) => api.get(`/applicants/${id}`),
  create: (data: any) => api.post('/applicants', data),
  update: (id: string, data: any) => api.put(`/applicants/${id}`, data),
  delete: (id: string) => api.delete(`/applicants/${id}`),
};

export const applicationsApi = {
  list: (params?: any) => api.get('/applications', { params }),
  listByStatus: (status: string) => api.get(`/applications/status/${status}`),
  get: (id: string) => api.get(`/applications/${id}`),
  create: (data: any) => api.post('/applications', data),
  update: (id: string, data: any) => api.put(`/applications/${id}`, data),
  submit: (id: string) => api.post(`/applications/${id}/submit`),
  approve: (id: string) => api.post(`/applications/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/applications/${id}/reject`, { reason }),
  deliver: (id: string) => api.post(`/applications/${id}/deliver`),
};

export const visaFormsApi = {
  create: (data: any) => api.post('/visa-forms', data),
  list: (params?: any) => api.get('/visa-forms', { params }),
  get: (id: string) => api.get(`/visa-forms/${id}`),
  update: (id: string, data: any) => api.patch(`/visa-forms/${id}`, data),
  submit: (id: string) => api.post(`/visa-forms/${id}/submit`),
  delete: (id: string) => api.delete(`/visa-forms/${id}`),
};

export const templatesApi = {
  list: (params?: any) => api.get('/templates', { params }),
  listByCountry: (country: string) => api.get(`/templates/country/${country}`),
  get: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  toggle: (id: string) => api.patch(`/templates/${id}/toggle`),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

export const importsApi = {
  list: (params?: any) => api.get('/imports', { params }),
  get: (id: string) => api.get(`/imports/${id}`),
  upload: (formData: FormData) => api.post('/imports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  process: (id: string) => api.post(`/imports/${id}/process`),
  results: (id: string) => api.get(`/imports/${id}/results`),
  delete: (id: string) => api.delete(`/imports/${id}`),
  getApplicants: (id: string) => api.get(`/imports/${id}/applicants`),
  getFields: () => api.get('/imports/fields'),
};

export const auditApi = {
  list: (params?: any) => api.get('/audit', { params }),
  byEntity: (type: string, id: string) => api.get(`/audit/entity/${type}/${id}`),
  byUser: (userId: string, params?: any) => api.get(`/audit/user/${userId}`, { params }),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  recent: (limit?: number) => api.get('/dashboard/recent', { params: { limit } }),
  chart: (period?: string) => api.get('/dashboard/chart', { params: { period } }),
  superAdmin: () => api.get('/dashboard/super-admin'),
};
