import React, { useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight2,
  InfoCircle,
  Lock,
  Notification1,
  Profile2User,
  Shield,
} from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../theme/colors';
import { useThemeColors } from '../../theme/ThemeContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useMyProfileVM } from './MyProfile.vm';
import { useAuth } from '../../contexts/AuthContext';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  title,
  subtitle,
  icon,
  onPress,
  iconBg,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  iconBg?: string;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.settingIcon, iconBg ? { backgroundColor: iconBg } : undefined]}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <ArrowRight2 color={colors.neutral[500]} size={18} variant="Linear" />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { profile, settings, loading, refreshProfile } = useMyProfileVM();
  const { logout } = useAuth();
  const themeColors = useThemeColors();

  // Refresh profile data when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  function handleSettingPress(id: string, route?: string) {
    if (route) {
      router.push(route);
      return;
    }

    switch (id) {
      case 'notifications':
        Alert.alert('Notification Preferences', 'Notification settings will be available soon.');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Support content will be available soon.');
        break;
      case 'policies':
        router.push({
          pathname: '/webview',
          params: { url: 'https://sreejayamschool.edu.in/legal/privacy-policy', title: 'Terms & Policies' },
        });
        break;
      default:
        break;
    }
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader title="My Profile" onBack={() => router.navigate('/(tabs)')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: themeColors.primary[300] }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.primary[100] }]}>
            <Profile2User color={colors.neutral[100]} size={40} variant="Bold" />
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileRole}>{profile.role}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{profile.experience}</Text>
              <Text style={styles.summaryLabel}>Attendance</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{profile.classTeacher}</Text>
              <Text style={styles.summaryLabel}>Assigned Sections</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
        <View style={styles.infoCard}>
          {profile.personalInfo.map((item, index) => (
            <React.Fragment key={item.label}>
              <InfoRow label={item.label} value={item.value} />
              {index < profile.personalInfo.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            title={settings[0].title}
            subtitle={settings[0].subtitle}
            icon={<Profile2User color={themeColors.primary[300]} size={20} variant="Bold" />}
            iconBg={themeColors.primary[50]}
            onPress={() => handleSettingPress(settings[0].id, settings[0].route)}
          />
          <SettingRow
            title={settings[1].title}
            subtitle={settings[1].subtitle}
            icon={<Lock color={themeColors.primary[300]} size={20} variant="Bold" />}
            iconBg={themeColors.primary[50]}
            onPress={() => handleSettingPress(settings[1].id, settings[1].route)}
          />
          <SettingRow
            title={settings[2].title}
            subtitle={settings[2].subtitle}
            icon={<Notification1 color={themeColors.primary[300]} size={20} variant="Bold" />}
            iconBg={themeColors.primary[50]}
            onPress={() => handleSettingPress(settings[2].id, settings[2].route)}
          />
        </View>

        <View style={styles.settingsCard}>
          <SettingRow
            title={settings[3].title}
            subtitle={settings[3].subtitle}
            icon={<InfoCircle color={themeColors.primary[300]} size={20} variant="Bold" />}
            iconBg={themeColors.primary[50]}
            onPress={() => handleSettingPress(settings[3].id, settings[3].route)}
          />
          <SettingRow
            title={settings[4].title}
            subtitle={settings[4].subtitle}
            icon={<Shield color={themeColors.primary[300]} size={20} variant="Bold" />}
            iconBg={themeColors.primary[50]}
            onPress={() => handleSettingPress(settings[4].id, settings[4].route)}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
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
  profileCard: {
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: colors.primary[300],
    padding: 24,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[100],
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[100],
    textAlign: 'center',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.neutral[600],
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  settingsCard: {
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingVertical: 4,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  settingSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.neutral[500],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginHorizontal: 2,
  },
  logoutButton: {
    marginTop: 12,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: colors.secondary[300],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
