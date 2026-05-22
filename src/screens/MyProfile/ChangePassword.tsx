import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock } from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useChangePasswordVM } from './ChangePassword.vm';

function RequirementRow({ label, valid }: { label: string; valid: boolean }) {
  return (
    <View style={styles.requirementRow}>
      <View style={[styles.requirementDot, valid && styles.requirementDotActive]} />
      <Text style={[styles.requirementText, valid && styles.requirementTextActive]}>
        {label}
      </Text>
    </View>
  );
}

export function ChangePasswordScreen() {
  const router = useRouter();
  const vm = useChangePasswordVM();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScreenHeader title="Change Password" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.noteText}>Your new password must be different from previously used passwords.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            secureTextEntry
            value={vm.currentPassword}
            onChangeText={vm.setCurrentPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry
            value={vm.newPassword}
            onChangeText={vm.setNewPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            secureTextEntry
            value={vm.confirmPassword}
            onChangeText={vm.setConfirmPassword}
          />
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Password Requirement</Text>
          {vm.passwordRules.map((rule) => (
            <RequirementRow key={rule.label} label={rule.label} valid={rule.valid} />
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={vm.onUpdatePassword} activeOpacity={0.85}>
          <Lock color="#fff" size={18} variant="Bold" />
          <Text style={styles.saveButtonText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  noteText: {
    fontSize: 14,
    color: colors.neutral[500],
    marginHorizontal: 4,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 16,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  requirementsCard: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 3,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[300],
    marginRight: 10,
  },
  requirementDotActive: {
    backgroundColor: colors.primary[300],
  },
  requirementText: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  requirementTextActive: {
    color: colors.neutral[900],
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: colors.primary[300],
    paddingVertical: 16,
    borderRadius: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
