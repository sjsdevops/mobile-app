import { api } from './api';

export interface NotificationItem {
    notification_id: string;
    title: string;
    description: string;
    is_read: boolean;
    created_at: string;
}

export interface NotificationsResponse {
    items: NotificationItem[];
    unread_count: number;
}

export async function getNotifications(userId: string): Promise<NotificationsResponse> {
    const response = await api.get(`/mobile/notifications`);
    const data = response.data?.data ?? response.data;
    return { items: data?.items ?? [], unread_count: data?.unread_count ?? 0 };
}

export async function markAllAsRead(userId: string): Promise<void> {
    await api.put(`/mobile/notifications/${userId}/read-all`);
}

export async function markAsRead(notificationId: string): Promise<void> {
    await api.put(`/mobile/notifications/${notificationId}/read`);
}
