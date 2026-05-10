import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('traveloop_token');
      // Only redirect if not on auth page to avoid loops
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
};

export const tripApi = {
  list: () => api.get('/trips'),
  get: (id: string) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
  addStop: (tripId: string, stopData: any) => api.post(`/trips/${tripId}/stops`, stopData),
  addActivity: (stopId: string, activityData: any) => api.post(`/stops/${stopId}/activities`, activityData),
  addPackingItem: (tripId: string, data: any) => api.post(`/trips/${tripId}/packing`, data),
  addNote: (tripId: string, data: any) => api.post(`/trips/${tripId}/notes`, data),
  addExpense: (tripId: string, data: any) => api.post(`/trips/${tripId}/expenses`, data),
  clone: (id: string) => api.post(`/trips/${id}/clone`),
  getPublic: (id: string) => api.get(`/public/trips/${id}`),
  getStats: () => api.get('/admin/stats'),
};
