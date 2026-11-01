import type { User } from "../types/auth";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";
const TEST_MODE_KEY = "test_mode";

export const setTestMode = (enabled: boolean): void => {
  if (enabled) {
    localStorage.setItem(TEST_MODE_KEY, 'true');
  } else {
    localStorage.removeItem(TEST_MODE_KEY);
  }
};

export const isTestMode = (): boolean => {
  return localStorage.getItem(TEST_MODE_KEY) === 'true';
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  // In test mode, bypass all validation
  if (isTestMode()) {
    return localStorage.getItem(TOKEN_KEY);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (exp && Date.now() >= exp * 1000) {
      // Token expired, remove it
      removeToken();
      removeUser();
      return null;
    }
  } catch (e) {
    // Invalid token format
    removeToken();
    removeUser();
    return null;
  }
  
  return token;
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const logout = (): void => {
  removeToken();
  removeUser();
  // Also clear test mode on logout
  localStorage.removeItem(TEST_MODE_KEY);
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  // In test mode, check if token exists (bypass validation)
  if (isTestMode()) {
    return localStorage.getItem(TOKEN_KEY) !== null;
  }
  return getToken() !== null;
};