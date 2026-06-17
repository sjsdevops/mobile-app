import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeSlash } from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useLoginVM } from './LoginScreen.vm';
import { useAuth } from '../../contexts/AuthContext';
import { registerForPushNotifications, sendTokenToBackend } from '../../services/pushNotifications';
import type { UserRole } from '../../types/auth';

const ROLE_TABS: { label: string; value: UserRole }[] = [
  { label: 'Teacher', value: 'teacher' },
  { label: 'Coordinator', value: 'coordinator' },
  { label: 'Student', value: 'student' },
];

export function LoginScreen() {
  const router = useRouter();
  const vm = useLoginVM();

  const { setUser, setPermissions } = useAuth();

  async function onSignIn() {
    const result = await vm.handleLogin();
    if (result.success && result.user) {
      setUser(result.user);
      if (result.permissions) {
        setPermissions(result.permissions);
      }

      // Register for push notifications after successful login
      registerForPushNotifications().then((pushToken) => {
        if (pushToken && result.user) {
          sendTokenToBackend(result.user.id, pushToken);
        }
      });

      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back to Sree Jayam School</Text>
        <Text style={styles.subtitle}>Stay connected with your classes and school updates</Text>

        {/* Role tab switcher */}
        <View style={styles.roleRow}>
          {ROLE_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.roleTab, vm.role === tab.value && styles.roleTabActive]}
              onPress={() => vm.setRole(tab.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.roleTabText, vm.role === tab.value && styles.roleTabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View
            style={[
              styles.inputWrapper,
              vm.emailError ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter Registered Email"
              placeholderTextColor={colors.neutral[400]}
              value={vm.email}
              onChangeText={vm.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {vm.emailError ? <Text style={styles.fieldError}>{vm.emailError}</Text> : null}

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter Password"
              placeholderTextColor={colors.neutral[400]}
              value={vm.password}
              onChangeText={vm.setPassword}
              secureTextEntry={!vm.showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onSignIn}
            />
            <TouchableOpacity
              onPress={() => vm.setShowPassword(!vm.showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.eyeButton}
            >
              {vm.showPassword
                ? <Eye color={colors.primary[300]} size={20} variant="Bold" />
                : <EyeSlash color={colors.primary[300]} size={20} variant="Bold" />}
            </TouchableOpacity>
          </View>

          {/* API error */}
          {vm.error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{vm.error}</Text>
            </View>
          ) : null}

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.signInButton, (!vm.canSubmit || vm.loading) && styles.signInButtonDisabled]}
            onPress={onSignIn}
            disabled={!vm.canSubmit || vm.loading}
            activeOpacity={0.85}
          >
            {vm.loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },

  // Logo
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  logo: {
    width: 80,
    height: 80,
  },

  // Title
  title: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
  },

  // Role tabs
  roleRow: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    padding: 3,
    width: '100%',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: colors.primary[300],
    shadowColor: colors.primary[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  roleTabTextActive: {
    color: colors.neutral[100],
    fontWeight: '600',
  },

  // Form
  form: {
    marginTop: 28,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: colors.secondary[300],
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral[900],
  },
  eyeButton: {
    paddingLeft: 8,
  },

  fieldError: {
    marginTop: 4,
    fontSize: 12,
    color: colors.secondary[300],
  },

  // Forgot password
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary[300],
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // Error banner
  errorBanner: {
    marginTop: 16,
    backgroundColor: colors.secondary.alpha,
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.secondary[300],
    textAlign: 'center',
  },

  // Sign In button
  signInButton: {
    marginTop: 28,
    backgroundColor: colors.primary[300],
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.65,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[100],
    letterSpacing: 0.3,
  },
});
