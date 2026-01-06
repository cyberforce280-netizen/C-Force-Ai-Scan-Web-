
import { UserData } from '../types';

// Re-export UserData so components can import it directly from this service module as expected
export type { UserData };

// The URL of your backend API that connects to PostgreSQL
const API_BASE_URL = '/api/auth';

export const authService = {
  init: () => {
    console.log("C-Force AI: Switching to PostgreSQL Backend Engine...");
  },

  login: async (username: string, password: string): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Authentication Failed' };
    } catch (err) {
      console.error("DB Connection Error:", err);
      return { success: false, error: 'Database Connection Timeout' };
    }
  },

  loginViaFace: async (capturedImage: string): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage })
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Biometric Mismatch' };
    } catch (err) {
      return { success: false, error: 'Biometric Engine Offline' };
    }
  },

  register: async (newUser: any, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      }
      return { success: false, error: data.message || 'Registration Denied' };
    } catch (err) {
      return { success: false, error: 'Identity Storage Error' };
    }
  },

  /**
   * Fetches all registered operatives from the backend
   */
  getUsers: async (): Promise<UserData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) return await response.json();
      return [];
    } catch (err) {
      return [];
    }
  },

  deleteUser: async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, { method: 'DELETE' });
      return response.ok;
    } catch (err) {
      return false;
    }
  }
};
