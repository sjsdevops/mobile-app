import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import '../global.css';
import { AuthProvider } from '../src/contexts/AuthContext';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../src/services/pushNotifications';

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listen for incoming notifications (foreground)
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('[Notification Received]', notification.request.content);
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('[Notification Tapped]', response.notification.request.content.data);
      // You can navigate based on response.notification.request.content.data here
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
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
        </Stack>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
