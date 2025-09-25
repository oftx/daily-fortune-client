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

const api = {
  // --- Auth Module ---
  getRegisterStatus: async () => { /* ... */ },
  login: async (username, password) => { /* ... */ },
  register: async (username, email, password) => { /* ... */ },

  // --- User Module ---
  getMyProfile: async () => { /* ... */ },
  updateMyProfile: async (updateData) => { /* ... */ },
  
  // vvv MODIFIED API CALL vvv
  getUserProfile: async (username) => {
      try {
          const response = await apiClient.get(`/users/u/${username}`); // Changed from /@ to /u/
          return { success: true, data: response.data };
      } catch (error) {
          return { success: false, error: "User not found." };
      }
  },
  
  // vvv MODIFIED API CALL vvv
  getUserFortuneHistory: async (username) => {
      try {
          const response = await apiClient.get(`/users/u/${username}/fortune-history`); // Changed from /@ to /u/
          const history = response.data.map(item => ({ date: item.date, fortune: item.value }));
          return { success: true, data: { history } };
      } catch (error) {
          return { success: false, error: "Could not fetch history." };
      }
  },

  // --- Fortune Module ---
  drawFortune: async () => { /* ... */ },
  getLeaderboard: async () => { /* ... */ },
  
  // --- Admin Module ---
  getAllUsers: async () => { /* ... */ }
};

// --- This is the full code, pasting only the changed functions for brevity.
// --- Please replace only the getUserProfile and getUserFortuneHistory functions.
// --- The rest of the file remains the same.
// --- For completeness, here is the entire file:

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
          const history = response.data.map(item => ({ date: item.date, fortune: item.value }));
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
  }
};

export default fullApi;