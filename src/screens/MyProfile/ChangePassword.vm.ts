import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

export function useChangePasswordVM() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const matchesConfirm = newPassword === confirmPassword && newPassword.length > 0;

  const passwordRules = useMemo(
    () => [
      { label: 'Minimum 8 characters', valid: hasMinLength },
      { label: 'At least one number or symbol', valid: hasNumberOrSymbol },
      { label: 'At least one uppercase', valid: hasUpperCase },
    ],
    [hasMinLength, hasNumberOrSymbol, hasUpperCase],
  );

  function onUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill out all password fields.');
      return;
    }

    if (!hasMinLength || !hasNumberOrSymbol || !hasUpperCase) {
      Alert.alert('Invalid password', 'Your new password does not meet the requirements.');
      return;
    }

    if (!matchesConfirm) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    Alert.alert('Success', 'Your password has been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
  };
}
