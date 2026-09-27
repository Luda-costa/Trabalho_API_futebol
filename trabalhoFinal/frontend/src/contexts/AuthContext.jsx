import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(payload).split('').map((character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`
    ).join('')));
  } catch {
    return null;
  }
}

function readSession() {
  const token = sessionStorage.getItem('token');
  if (!token) return { token: null, user: null };
  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 <= Date.now()) {
    sessionStorage.removeItem('token');
    return { token: null, user: null };
  }
  return { token, user: { id: payload.sub, role: payload.role } };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const value = useMemo(() => ({
    ...session,
    isAuthenticated: Boolean(session.token),
    isAdmin: session.user?.role === 'admin',
    signIn(token) {
      sessionStorage.setItem('token', token);
      setSession({ token, user: decodeToken(token) });
    },
    signOut() {
      sessionStorage.removeItem('token');
      setSession({ token: null, user: null });
    }
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
