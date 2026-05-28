import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/theme/ThemeContext';

export default function RootLayout() {
  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <ThemeProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false, animation: 'none' }} />
            <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="timetable" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="attendance" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="view-attendance" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="my-attendance" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="attendance-history" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="student-info" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="student-exam-results" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="student-exam-results/[sectionId]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="change-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="lesson-plan" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="add-lesson-plan" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="webview" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="select-section" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="homework" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="add-homework" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
