// Simple auth storage utilities (token + user metadata)

const TOKEN_STORAGE_KEY = "authToken";
const USER_STORAGE_KEY = "authUser";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch (err) {
    return "";
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    // ignore storage errors for now
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setUser(user) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    // ignore
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

export function clearAuth() {
  clearToken();
  clearUser();
}

export function isAuthenticated() {
  return Boolean(getToken());
}
