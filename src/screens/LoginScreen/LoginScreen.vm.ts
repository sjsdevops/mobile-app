import { useState } from 'react';
import { login } from '../../services/authService';
import type { UserRole } from '../../types/auth';

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

  async function handleLogin(): Promise<{ success: boolean; userId?: string | number }> {
    if (!canSubmit) return { success: false };
    setLoading(true);
    setError(null);
    try {
      const result = await login(role, { email: email.trim(), password });
      return { success: true, userId: result.user_id };
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
