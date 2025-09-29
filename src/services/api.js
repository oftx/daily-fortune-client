// src/services/api.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
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
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      // --- MODIFIED: Use the parser ---
      return { success: false, error: parseApiError(error) };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
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
    } catch(error) {
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