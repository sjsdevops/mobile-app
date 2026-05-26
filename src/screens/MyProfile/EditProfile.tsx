import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useEditProfileVM } from './EditProfile.vm';

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

export function EditProfileScreen() {
  const router = useRouter();
  const vm = useEditProfileVM();
  const insets = useSafeAreaInsets();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  }

  if (vm.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
        <ScreenHeader title="Edit Profile" onBack={handleBack} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[300]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScreenHeader title="Edit Profile" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarPlaceholderLarge}>
          <Text style={styles.avatarText}>
            {(vm.firstName[0] || '').toUpperCase()}{(vm.lastName[0] || '').toUpperCase()}
          </Text>
        </View>

        <Field label="First Name" value={vm.firstName} placeholder="First Name" onChangeText={vm.setFirstName} />
        <Field label="Last Name" value={vm.lastName} placeholder="Last Name" onChangeText={vm.setLastName} />
        <Field
          label={vm.isStudent ? 'Roll No' : 'Employee Code'}
          value={vm.employeeCode}
          placeholder={vm.isStudent ? 'Roll No' : 'EMP-001'}
          onChangeText={vm.setEmployeeCode}
        />
        <Field label="Email" value={vm.email} placeholder="email@school.com" onChangeText={vm.setEmail} />
        <Field label="Phone Number" value={vm.phone} placeholder="+91 98764 12345" onChangeText={vm.setPhone} />
        <Field label="Date of Birth" value={vm.dob} placeholder="YYYY-MM-DD" onChangeText={vm.setDob} />
        <Field label="Gender" value={vm.gender} placeholder="Male / Female" onChangeText={vm.setGender} />
        <Field label="Blood Group" value={vm.bloodGroup} placeholder="O+" onChangeText={vm.setBloodGroup} />
        <Field
          label="Address"
          value={vm.address}
          placeholder="Enter your address"
          onChangeText={vm.setAddress}
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, vm.saving && styles.saveButtonDisabled]}
          onPress={vm.onSave}
          activeOpacity={0.85}
          disabled={vm.saving}
        >
          {vm.saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarPlaceholderLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[300],
    alignSelf: 'center',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
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
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 16,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 32,
    backgroundColor: colors.primary[300],
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
