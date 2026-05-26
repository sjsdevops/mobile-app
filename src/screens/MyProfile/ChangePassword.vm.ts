import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';

export function useChangePasswordVM() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const hasMinLength = newPassword.length >= 6;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const matchesConfirm = newPassword === confirmPassword && newPassword.length > 0;

  const passwordRules = useMemo(
    () => [
      { label: 'Minimum 6 characters', valid: hasMinLength },
      { label: 'At least one number or symbol', valid: hasNumberOrSymbol },
      { label: 'At least one uppercase', valid: hasUpperCase },
    ],
    [hasMinLength, hasNumberOrSymbol, hasUpperCase],
  );

  async function onUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill out all password fields.');
      return;
    }

    if (!hasMinLength) {
      Alert.alert('Invalid password', 'New password must be at least 6 characters.');
      return;
    }

    if (!matchesConfirm) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to change password';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    passwordRules,
    onUpdatePassword,
    saving,
  };
}
