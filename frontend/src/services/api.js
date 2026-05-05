import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const profileAPI = {
  get: (userId) => api.get(`/profile/${userId}`),
  update: (userId, data) => api.put(`/profile/${userId}`, data),
};

export const matchAPI = {
  listInterviewers: () => api.get('/match/interviewers'),
  autoMatch: () => api.post('/match/auto'),
  sendRequest: (data) => api.post('/match/request', data),
  getRequests: (userId) => api.get(`/match/requests/${userId}`),
  updateStatus: (requestId, data) => api.put(`/match/requests/${requestId}/status`, data),
  submitFeedback: (data) => api.post('/match/feedback', data),
  checkFeedback: (matchRequestId) => api.get(`/match/feedback/check?matchRequestId=${matchRequestId}`),
};

export default api;
