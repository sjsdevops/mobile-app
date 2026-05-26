import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser, RolePermission } from '../types/auth';
import { logout as logoutService } from '../services/authService';
import { getAuthToken, getUser, getPermissions } from '../services/storage';
import { setAuthToken } from '../services/api';

type AuthContextValue = {
  user: AuthUser | null;
  permissions: RolePermission[];
  isReady: boolean;
  setUser: (user: AuthUser | null) => void;
  setPermissions: (permissions: RolePermission[]) => void;
  resetUser: () => void;
  logout: () => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  restoreSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isReady, setIsReady] = useState(false);

  const resetUser = useCallback(() => {
    setUser(null);
    setPermissions([]);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback(
    (permissionKey: string) => {
      return permissions.some((p) => p.permission_key === permissionKey && p.is_enabled);
    },
    [permissions],
  );

  /**
   * Attempt to restore a previous session from storage.
   * Returns true if session was restored, false if user needs to login.
   */
  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setIsReady(true);
        return false;
      }

      // Token is valid, restore user and permissions
      setAuthToken(token);
      const savedUser = await getUser();
      const savedPermissions = await getPermissions();

      if (savedUser) {
        setUser(savedUser);
        setPermissions(savedPermissions);
        setIsReady(true);

        // Re-fetch fresh permissions from API in background
        if (savedUser.roleId) {
          try {
            const { getRolePermissions } = await import('../services/authService');
            const freshPermissions = await getRolePermissions(savedUser.roleId);
            setPermissions(freshPermissions);
          } catch {
            // Keep cached permissions if fetch fails
          }
        }

        return true;
      }

      // Token exists but no user data — clear and require login
      setIsReady(true);
      return false;
    } catch {
      setIsReady(true);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      isReady,
      setUser,
      setPermissions,
      resetUser,
      logout,
      hasPermission,
      restoreSession,
    }),
    [user, permissions, isReady, resetUser, logout, hasPermission, restoreSession],
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
