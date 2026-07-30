import type { User } from "../types/auth";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) {
    return null;
  }

  // Hand-edited or half-written localStorage shouldn't crash every page that
  // renders the current user's name.
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
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
  window.location.href = "/login";
};

/** Reads the `exp` claim without verifying the signature — the server still does that. */
const isExpired = (token: string): boolean => {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    // Unparseable token: treat it as unusable rather than trusting it.
    return true;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();

  if (token === null) {
    return false;
  }

  // Checking only for presence meant a day-old token still rendered the whole
  // app, which then failed every request with a 401.
  if (isExpired(token)) {
    removeToken();
    removeUser();
    return false;
  }

  return true;
};
