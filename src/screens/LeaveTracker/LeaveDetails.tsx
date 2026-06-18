import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import type { LeaveRequest } from '../../services/leaveService';

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.value}>{value}</Text>
        </View>
    );
}

export function LeaveDetailsScreen() {
    const router = useRouter();
    const { leaveId } = useLocalSearchParams<{ leaveId: string }>();
    const [leave, setLeave] = useState<LeaveRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!leaveId) return;
        (async () => {
            try {
                const response = await api.get(`/leave-requests/${leaveId}`);
                setLeave(response.data?.data ?? response.data);
            } catch (err) {
                console.error('[LeaveDetails] Fetch error:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [leaveId]);

    const formatDate = (d: string | null) => {
        if (!d) return '-';
        return d.split('T')[0].split('-').reverse().join('-');
    };

    const calcDays = () => {
        if (!leave) return '-';
        const from = new Date(leave.from_date);
        const to = new Date(leave.to_date);
        const diff = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
        return `${diff}.0 Day${diff !== 1 ? 's' : ''}`;
    };

    const statusColor =
        leave?.approval_status === 'approved' ? colors.green[200] :
            leave?.approval_status === 'rejected' ? colors.secondary[300] :
                '#F59E0B';

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Leave Details" onBack={() => router.back()} />

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={colors.primary[300]} /></View>
            ) : !leave ? (
                <View style={s.center}><Text style={s.empty}>Leave not found</Text></View>
            ) : (
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                    <View style={s.card}>
                        <InfoRow label="Employee ID" value={leave.employee_name || leave.employee_id} />
                        <InfoRow label="Leave type" value={leave.leave_type_name || leave.leave_type || '-'} />
                        <InfoRow label="Total" value={calcDays()} />
                        <InfoRow label="Date of request" value={formatDate(leave.from_date)} />
                        {leave.from_date !== leave.to_date && (
                            <InfoRow label="To date" value={formatDate(leave.to_date)} />
                        )}
                        <InfoRow label="Reason for leave" value={leave.reason || '-'} />
                        <InfoRow label="Status" value={leave.approval_status} />
                        {leave.remarks && <InfoRow label="Remarks" value={leave.remarks} />}
                    </View>

                    {/* Status badge */}
                    <View style={[s.statusBadge, { backgroundColor: statusColor + '18' }]}>
                        <Text style={[s.statusText, { color: statusColor }]}>
                            {leave.approval_status.toUpperCase()}
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f7f8fb' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 16, paddingBottom: 40 },
    empty: { fontSize: 15, color: colors.neutral[400] },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(20,79,204,0.15)',
        padding: 20,
        gap: 16,
    },
    row: { gap: 4 },
    label: { fontSize: 13, color: colors.neutral[600] },
    value: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
    statusBadge: {
        marginTop: 16,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    statusText: { fontSize: 15, fontWeight: '700' },
});
