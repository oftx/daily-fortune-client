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

const fullApi = {
  getRegisterStatus: async () => {
    try {
      const response = await apiClient.get('/config/registration-status');
      return { success: true, data: { isOpen: response.data.is_open } };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Could not connect to server." };
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
      return { success: false, error: error.response?.data?.detail || "Login failed." };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Registration failed." };
    }
  },

  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Could not fetch profile." };
    }
  },
  
  updateMyProfile: async (updateData) => {
    try {
      const response = await apiClient.patch('/users/me', updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Failed to update profile." };
    }
  },
  
  getUserProfile: async (username) => {
      try {
          const response = await apiClient.get(`/users/u/${username}`);
          return { success: true, data: response.data };
      } catch (error) {
          return { success: false, error: "User not found." };
      }
  },
  
  getUserFortuneHistory: async (username) => {
      try {
          const response = await apiClient.get(`/users/u/${username}/fortune-history`);
          const history = response.data.map(item => ({ date: item.created_at, fortune: item.value }));
          return { success: true, data: { history } };
      } catch (error) {
          return { success: false, error: "Could not fetch history." };
      }
  },

  drawFortune: async () => {
    try {
      const response = await apiClient.post('/fortune/draw');
      return { success: true, data: { fortune: response.data.fortune } };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Could not draw fortune." };
    }
  },
  
  getLeaderboard: async () => {
    try {
        const response = await apiClient.get('/fortune/leaderboard');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: "Could not fetch leaderboard." };
    }
  },
  
  getAllUsers: async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return { success: true, data: response.data };
    } catch(error) {
        return { success: false, error: "Could not fetch users." };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      await apiClient.post(`/admin/users/${userId}/status`, { status });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Failed to update status." };
    }
  },

  updateUserVisibility: async (userId, is_hidden) => {
    try {
      await apiClient.post(`/admin/users/${userId}/visibility`, { is_hidden });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Failed to update visibility." };
    }
  },
  
  updateUserTags: async (userId, tags) => {
    try {
      await apiClient.post(`/admin/users/${userId}/tags`, { tags });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Failed to update tags." };
    }
  },

  // --- NEW API FUNCTION ---
  checkUserQqPublicity: async (username) => {
    try {
      const response = await apiClient.get(`/users/u/${username}/qq-public-status`);
      return { success: true, data: response.data }; // Expected: { is_qq_public: boolean }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || "Failed to check QQ status." };
    }
  }
};

export default fullApi;