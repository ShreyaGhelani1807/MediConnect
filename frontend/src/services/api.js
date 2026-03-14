import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediconnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mediconnect_token');
      localStorage.removeItem('mediconnect_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ─── Patient ─────────────────────────────────────────────
export const patientAPI = {
  getProfile:      ()     => api.get('/patient/profile'),
  updateProfile:   (data) => api.put('/patient/profile', data),
  getAppointments: ()     => api.get('/patient/appointments'),
};

// ─── Doctor (private) ────────────────────────────────────
export const doctorAPI = {
  getProfile:           ()     => api.get('/doctor/profile'),
  updateProfile:        (data) => api.put('/doctor/profile', data),
  updateSlots:          (data) => api.put('/doctor/slots', data),
  getTodayAppointments: ()     => api.get('/doctor/appointments/today'),
  getAllAppointments:   ()     => api.get('/doctor/appointments/all'),
  getPatientById:       (id)   => api.get(`/doctor/patients/${id}`),
  getAnalytics:         ()     => api.get('/doctor/analytics'),
};

// ─── Doctors (public) ────────────────────────────────────
export const doctorsAPI = {
  search:  (params) => api.get('/doctors/search', { params }),
  getById: (id)     => api.get(`/doctors/${id}`),
  getSlots:(id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
};

// ─── AI ──────────────────────────────────────────────────
export const aiAPI = {
  analyzeSymptoms:   (data) => api.post('/ai/analyze-symptoms', data),
  generateChecklist: (data) => api.post('/ai/generate-checklist', data),
};

// ─── Appointments ────────────────────────────────────────
export const appointmentAPI = {
  book:         (data)       => api.post('/appointments/book', data),
  updateStatus: (id, data)   => api.put(`/appointments/${id}/status`, data),
  rate:         (id, data)   => api.post(`/appointments/${id}/rating`, data),
};

export default api;

// ─── Admin ────────────────────────────────────────────────
export const adminAPI = {
  login:         (data)         => adminApi.post('/admin/login', data),
  getMe:         ()             => adminApi.get('/admin/me'),
  getStats:      ()             => adminApi.get('/admin/stats'),
  getDoctors:    (status)       => adminApi.get(`/admin/doctors${status ? `?status=${status}` : ''}`),
  getDoctorById: (id)           => adminApi.get(`/admin/doctors/${id}`),
  approveDoctor: (id)           => adminApi.patch(`/admin/doctors/${id}/approve`, {}),
  rejectDoctor:  (id, reason)   => adminApi.patch(`/admin/doctors/${id}/reject`, { reason }),
};
// ─── Separate Admin Axios Instance (bypasses mediconnect_token interceptor) ──
const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach admin_token (not mediconnect_token)
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 for admin
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);