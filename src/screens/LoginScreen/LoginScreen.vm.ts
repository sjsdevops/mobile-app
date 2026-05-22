import { useState } from 'react';
import { login, getRolePermissions } from '../../services/authService';
import type { UserRole, AuthUser, RolePermission } from '../../types/auth';

export function useLoginVM() {
  const [role, setRole] = useState<UserRole>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address'
      : null;

  const canSubmit = email.trim().length > 0 && password.length > 0 && !emailError;

  async function handleLogin(): Promise<{
    success: boolean;
    user?: AuthUser;
    permissions?: RolePermission[];
  }> {
    if (!canSubmit) return { success: false };
    setLoading(true);
    setError(null);
    try {
      const user = await login(role, { email: email.trim(), password });

      // Fetch permissions using role_id
      let permissions: RolePermission[] = [];
      if (user.roleId) {
        try {
          permissions = await getRolePermissions(user.roleId);
        } catch (err) {
          console.warn('Failed to fetch permissions:', err);
        }
      }

      return { success: true, user, permissions };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.';
      setError(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }

  return {
    role,
    setRole,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    emailError,
    canSubmit,
    handleLogin,
  };
}
