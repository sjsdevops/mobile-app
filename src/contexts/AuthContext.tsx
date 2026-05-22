'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UserRole } from '../types/auth';

export type AuthUser = {
  role: UserRole;
  userId?: string | number;
  name?: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  resetUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const value = useMemo(
    () => ({ user, setUser, resetUser: () => setUser(null) }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
