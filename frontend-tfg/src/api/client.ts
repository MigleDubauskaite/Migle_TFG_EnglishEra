// Empty string = relative URLs → Vite dev proxy handles /api → localhost:8080.
// In production set VITE_API_URL to the actual backend origin.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken');
}

export function setSession(token: string, userJson: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('authToken', token);
  storage.setItem('loggedUser', userJson);
}

export function clearSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('loggedUser');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('loggedUser');
}

function headers(auth: boolean): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (auth) {
    const t = getAuthToken();
    if (t) h.Authorization = `Bearer ${t}`;
  }
  return h;
}

function handleAuthError(status: number, auth: boolean) {
  if (auth && (status === 401 || status === 403)) {
    clearSession();
    window.location.reload();
  }
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(auth) });
  if (!res.ok) {
    handleAuthError(res.status, auth);
    const text = await res.text();
    let message = text || res.statusText;
    try { message = JSON.parse(text)?.message || message; } catch { /* not json */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: headers(auth) });
  if (!res.ok) {
    handleAuthError(res.status, auth);
    const text = await res.text();
    let message = text || res.statusText;
    try { message = JSON.parse(text)?.message || message; } catch { /* not json */ }
    throw new Error(message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export async function apiPost<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...headers(auth), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    handleAuthError(res.status, auth);
    const text = await res.text();
    let message = text || res.statusText;
    try { message = JSON.parse(text)?.message || message; } catch { /* not json */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { ...headers(auth), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    handleAuthError(res.status, auth);
    const text = await res.text();
    let message = text || res.statusText;
    try { message = JSON.parse(text)?.message || message; } catch { /* not json */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
