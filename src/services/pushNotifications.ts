import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and return the FCM/Expo push token.
 * Call this after login to get the device token and send it to your backend.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('[Push] Must use physical device for push notifications');
        return null;
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] Permission not granted');
        return null;
    }

    // Get the Expo push token (works with FCM under the hood)
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
            console.log('[Push] No EAS projectId found — skipping token registration (Expo Go?)');
            return null;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        const token = tokenData.data;
        console.log('[Push] Expo push token:', token);

        // Android: set notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#144FCC',
            });
        }

        return token;
    } catch (error) {
        console.warn('[Push] Error getting push token (expected in Expo Go):', error);
        return null;
    }
}

/**
 * Send the device push token to your backend so it can send notifications.
 * Call this after login with the user's ID.
 */
export async function sendTokenToBackend(userId: string, pushToken: string): Promise<void> {
    try {
        await api.post('/devices/register', {
            user_id: userId,
            push_token: pushToken,
            platform: Platform.OS,
        });
        console.log('[Push] Token registered with backend');
    } catch (error) {
        console.error('[Push] Failed to register token with backend:', error);
    }
}

/**
 * Invalidate the device push token on logout.
 *
 * This is the Expo equivalent of Flutter's FirebaseMessaging.instance.deleteToken().
 * It works entirely client-side — no backend endpoint needed.
 *
 * After this call FCM/APNs marks the token as invalid. Any future send attempt
 * to the old token will return NotRegistered / BadDeviceToken from FCM/APNs,
 * so the Expo push service will stop delivering to it automatically.
 *
 * A fresh token is issued the next time the user logs in and
 * registerForPushNotifications() is called.
 */
export async function unregisterPushNotifications(): Promise<void> {
    try {
        await Notifications.unregisterForNotificationsAsync();
        console.log('[Push] Device push token invalidated (FCM/APNs side)');
    } catch (error) {
        // Non-fatal — only fails on simulators or when notifications were
        // never granted, same as Flutter's deleteToken() in those cases.
        console.warn('[Push] Could not invalidate push token:', error);
    }
}

/**
 * Add a listener for when a notification is received while app is foregrounded.
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void,
) {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when user taps on a notification.
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void,
) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}
