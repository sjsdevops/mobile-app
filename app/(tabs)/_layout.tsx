import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  HomeTabIcon,
  StudentsTabIcon,
  RoutineTabIcon,
  ExamsTabIcon,
  ProfileTabIcon,
} from '../../src/components/icons/TabIcons';

export default function TabLayout() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary[300],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: Math.max(insets.bottom, 12) + 6 }],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color }) => <StudentsTabIcon color={color} />,
          href: isStudent ? null : '/students',
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color }) => <RoutineTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color }) => <ExamsTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral[100],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
