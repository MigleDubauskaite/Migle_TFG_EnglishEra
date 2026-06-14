import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'https://monetize-marrow-hydroxide.ngrok-free.dev';

const TOKEN_KEY = 'auth_token';

// Registered by AuthContext so client can trigger sign-out on 401/403
let _authFailureHandler: (() => void) | null = null;
export function registerAuthFailureHandler(fn: () => void) {
  _authFailureHandler = fn;
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.setItem(TOKEN_KEY, token); return; }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') { localStorage.removeItem(TOKEN_KEY); return; }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (requireAuth && (res.status === 401 || res.status === 403)) {
      _authFailureHandler?.();
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function apiGet<T>(path: string, requireAuth = true): Promise<T> {
  return request<T>(path, { method: 'GET' }, requireAuth);
}

export function apiPost<T>(path: string, body: unknown, requireAuth = true): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, requireAuth);
}
