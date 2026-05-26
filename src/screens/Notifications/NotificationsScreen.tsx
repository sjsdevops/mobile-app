import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Notification1 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAuth } from '../../contexts/AuthContext';
import {
    getNotifications,
    markAllAsRead,
    type NotificationItem,
} from '../../services/notificationService';

function timeAgo(dateStr: string): string {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function NotificationCard({ item }: { item: NotificationItem }) {
    return (
        <View style={[s.card, !item.is_read && s.cardUnread]}>
            <View style={[s.iconCircle, !item.is_read && s.iconCircleUnread]}>
                <Notification1 color={!item.is_read ? colors.primary[300] : colors.neutral[400]} size={20} variant="Bold" />
            </View>
            <View style={s.cardContent}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={s.cardTime}>{timeAgo(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={s.unreadDot} />}
        </View>
    );
}

export function NotificationsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getNotifications(user.id);
                setNotifications(data.items);

                // Mark all as read once loaded
                if (data.unread_count > 0) {
                    await markAllAsRead(user.id);
                }
            } catch (err) {
                console.error('[Notifications] Failed to fetch:', err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [user?.id]);

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Notifications" onBack={() => router.back()} />

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : notifications.length === 0 ? (
                <View style={s.center}>
                    <Notification1 color={colors.neutral[300]} size={48} variant="Linear" />
                    <Text style={s.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.notification_id}
                    renderItem={({ item }) => <NotificationCard item={item} />}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 15, color: colors.neutral[400] },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.neutral[100],
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    cardUnread: {
        backgroundColor: 'rgba(20, 79, 204, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(20, 79, 204, 0.1)',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleUnread: {
        backgroundColor: 'rgba(20, 79, 204, 0.1)',
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: colors.neutral[900], marginBottom: 4 },
    cardDesc: { fontSize: 13, color: colors.neutral[600], lineHeight: 18, marginBottom: 6 },
    cardTime: { fontSize: 11, color: colors.neutral[400] },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary[300],
        marginTop: 6,
    },
});
