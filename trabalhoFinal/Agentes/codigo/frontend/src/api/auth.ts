export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  role: 'user' | 'admin';
}

export function saveSession(token: string, user: SessionUser): void {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(user));
}

export function currentUser(): SessionUser | null {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionUser; } catch { return null; }
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
