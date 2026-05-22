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
        console.error('[Push] Error getting push token:', error);
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
