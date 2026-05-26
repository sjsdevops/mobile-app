import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import '../global.css';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/theme/ThemeContext';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Dynamically import to avoid crashing in Expo Go
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        const { addNotificationReceivedListener, addNotificationResponseListener } =
          await import('../src/services/pushNotifications');

        notificationListener.current = addNotificationReceivedListener((notification) => {
          console.log('[Notification Received]', notification.request.content);
        });

        responseListener.current = addNotificationResponseListener((response) => {
          console.log('[Notification Tapped]', response.notification.request.content.data);
        });

        cleanup = () => {
          if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
          }
          if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
          }
        };
      } catch (e) {
        console.log('[Push] Notification listeners not available (Expo Go)');
      }
    })();

    return () => cleanup?.();
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <ThemeProvider>
          <Stack>
            {/* Splash — no header, no gesture */}
            <Stack.Screen
              name="index"
              options={{ headerShown: false, gestureEnabled: false, animation: 'none' }}
            />
            {/* Login */}
            <Stack.Screen
              name="login"
              options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
            />
            {/* Main tabs */}
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            {/* Class Time Table */}
            <Stack.Screen
              name="timetable"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Class Attendance */}
            <Stack.Screen
              name="attendance"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Attendance Report */}
            <Stack.Screen
              name="view-attendance"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* My Attendance (punch-in with maps) */}
            <Stack.Screen
              name="my-attendance"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Attendance History */}
            <Stack.Screen
              name="attendance-history"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Student Detail */}
            <Stack.Screen
              name="student-info"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Student Exam Results */}
            <Stack.Screen
              name="student-exam-results"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="student-exam-results/[sectionId]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Edit Profile */}
            <Stack.Screen
              name="edit-profile"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Change Password */}
            <Stack.Screen
              name="change-password"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Lesson Plan */}
            <Stack.Screen
              name="lesson-plan"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Add Lesson Plan */}
            <Stack.Screen
              name="add-lesson-plan"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* WebView */}
            <Stack.Screen
              name="webview"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Section Select for Attendance */}
            <Stack.Screen
              name="select-section"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Homework */}
            <Stack.Screen
              name="homework"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="add-homework"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            {/* Notifications */}
            <Stack.Screen
              name="notifications"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
