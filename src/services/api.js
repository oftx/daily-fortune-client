// src/services/api.js

import axios from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from '../utils/tokenManager';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(response => {
  return response;
}, async error => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return apiClient(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // HttpOnly cookie strategy:
      // 1. No body required for refresh token (cookie sent automatically).
      // 2. Must set withCredentials: true if cross-origin (though usually same-origin for auth).
      //    Note: If SameSite=Strict/Lax, browser sends it.

      const baseURL = apiClient.defaults.baseURL || '';
      const url = baseURL.endsWith('/') ? `${baseURL}auth/refresh` : `${baseURL}/auth/refresh`;

      const response = await axios.post(url, {}, {
        withCredentials: true
      });

      const { access_token } = response.data; // Response no longer returns refresh_token in body

      setAccessToken(access_token);
      // setRefreshToken is not needed as cookie is set by Set-Cookie header

      processQueue(null, access_token);

      originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
      return apiClient(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      // Use api.logout() here? Or just window redirect. 
      // api.logout() calls backend, which might be useful to ensure cookie clearing on server side too,
      // but if refresh failed, cookie is likely invalid anyway.
      // Better to just redirect.
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
});

// --- NEW: Centralized API Error Parsing Function ---
const parseApiError = (error) => {
  const defaultError = "An unknown error occurred.";

  // Check for FastAPI validation errors (HTTP 422)
  if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
    // Return the message from the first validation error object
    return error.response.data.detail[0]?.msg || defaultError;
  }

  // Check for other structured errors (e.g., detail: "string")
  if (error.response?.data?.detail && typeof error.response.data.detail === 'string') {
    return error.response.data.detail;
  }

  // Fallback for network errors or other unexpected structures
  return error.message || defaultError;
};


const fullApi = {
  getRegisterStatus: async () => {
    try {
      const response = await apiClient.get('/config/registration-status');
      return { success: true, data: { isOpen: response.data.is_open } };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      // withCredentials needed if backend sets cookie on login response
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true
      });
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: parseApiError(error) };
    }
  },

  refreshToken: async () => {
    try {
      // Manually trigger the refresh endpoint logic (similar to interceptor but direct)
      const baseURL = apiClient.defaults.baseURL || '';
      const url = baseURL.endsWith('/') ? `${baseURL}auth/refresh` : `${baseURL}/auth/refresh`;

      const response = await axios.post(url, {}, { withCredentials: true });
      const { access_token } = response.data;

      setAccessToken(access_token);
      return { success: true, data: { access_token } };
    } catch (error) {
      // If 401/403, means session invalid
      return { success: false, error: parseApiError(error) };
    }
  },

  register: async (username, email, password) => {
    try {
      // withCredentials needed if backend sets cookie on register response (auto-login)
      const response = await apiClient.post('/auth/register', { username, email, password }, { withCredentials: true });
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  updateMyProfile: async (updateData) => {
    try {
      const response = await apiClient.patch('/users/me', updateData);
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  changePassword: async (current_password, new_password) => {
    try {
      const response = await apiClient.patch('/users/me/password', { current_password, new_password });
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  getUserProfile: async (username) => {
    try {
      const response = await apiClient.get(`/users/u/${username}`);
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  getUserFortuneHistory: async (username) => {
    try {
      const response = await apiClient.get(`/users/u/${username}/fortune-history`);
      const history = response.data.map(item => ({ date: item.created_at, fortune: item.value }));
      return { success: true, data: { history } };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  drawFortune: async () => {
    try {
      const response = await apiClient.post('/fortune/draw');
      return { success: true, data: { fortune: response.data.fortune } };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  getLeaderboard: async () => {
    try {
      const response = await apiClient.get('/fortune/leaderboard');
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      await apiClient.post(`/admin/users/${userId}/status`, { status });
      return { success: true };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  updateUserVisibility: async (userId, is_hidden) => {
    try {
      await apiClient.post(`/admin/users/${userId}/visibility`, { is_hidden });
      return { success: true };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  updateUserTags: async (userId, tags) => {
    try {
      await apiClient.post(`/admin/users/${userId}/tags`, { tags });
      return { success: true };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  checkUserQqPublicity: async (username) => {
    try {
      const response = await apiClient.get(`/users/u/${username}/qq-public-status`);
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  }
};

export default fullApi;