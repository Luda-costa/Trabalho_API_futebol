import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { currentUser } from '../api/auth';

export function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const user = currentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
