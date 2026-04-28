import { create } from 'zustand';
import { fetchClient } from '../api/fetchClient';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      const data = await fetchClient('/auth/me/');
      if (data && data.status === 'success') {
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (username, password) => {
    try {
      const data = await fetchClient('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (data && data.status === 'success') {
        set({ user: data.data, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: data?.message || 'Login failed' };
    } catch (error) {
      let errorMessage = error.message || 'Login failed';
      if (error.data && typeof error.data === 'object' && Object.keys(error.data).length > 0) {
        const firstKey = Object.keys(error.data)[0];
        errorMessage = error.data[firstKey][0] || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  },

  register: async (username, email, password) => {
    try {
      const data = await fetchClient('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      if (data && data.status === 'success') {
        set({ user: data.data, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: data?.message || 'Registration failed' };
    } catch (error) {
      let errorMessage = error.message || 'Registration failed';
      if (error.data && typeof error.data === 'object' && Object.keys(error.data).length > 0) {
        const firstKey = Object.keys(error.data)[0];
        errorMessage = error.data[firstKey][0] || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await fetchClient('/auth/logout/', { method: 'POST' });
    } catch (e) {
      // Ignore errors on logout
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const data = await fetchClient('/auth/update-profile/', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
      if (data && data.status === 'success') {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false, error: data?.message || 'Update failed' };
    } catch (error) {
      let errorMessage = error.message || 'Update failed';
      if (error.data && typeof error.data === 'object' && Object.keys(error.data).length > 0) {
        const firstKey = Object.keys(error.data)[0];
        errorMessage = error.data[firstKey][0] || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const data = await fetchClient('/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
      if (data && data.status === 'success') {
        return { success: true };
      }
      return { success: false, error: data?.message || 'Password change failed' };
    } catch (error) {
      let errorMessage = error.message || 'Password change failed';
      if (error.data && typeof error.data === 'object' && Object.keys(error.data).length > 0) {
        const firstKey = Object.keys(error.data)[0];
        errorMessage = error.data[firstKey][0] || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  }

}));
