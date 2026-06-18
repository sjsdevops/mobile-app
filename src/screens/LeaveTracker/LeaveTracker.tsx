import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar1 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useLeaveTrackerVM } from './LeaveTracker.vm';
import type { LeaveBalance, AbsentRecord, UpcomingHoliday, LeaveRequest } from '../../services/leaveService';

const BALANCE_BG = ['#fcecdc', '#dce3fc', '#fcdcee', '#e8dcfc'];

// ─── Leave Balance Card ───────────────────────────────────────────────────────

function LeaveBalanceCard({ item, index }: { item: LeaveBalance; index: number }) {
    const bg = BALANCE_BG[index % BALANCE_BG.length];
    return (
        <View style={s.balanceCard}>
            <View style={[s.balanceIconCircle, { backgroundColor: bg }]}>
                <Text style={s.balanceCode}>{item.code}</Text>
            </View>
            <Text style={s.balanceName}>{item.name}</Text>
            <Text style={s.balanceStat}>{`Available    ${item.available}`}</Text>
            <Text style={s.balanceStat}>{`Booked       ${item.booked}`}</Text>
        </View>
    );
}

// ─── Absent Card ─────────────────────────────────────────────────────────────

function AbsentCard({ item, onApply }: { item: AbsentRecord; onApply: () => void }) {
    const formatted = item.attendance_date.split('-').reverse().join('-');
    return (
        <View style={s.card}>
            <View style={s.cardRow}>
                <Text style={s.cardTitle}>Absent</Text>
                <TouchableOpacity style={s.applyBtn} onPress={onApply} activeOpacity={0.8}>
                    <Text style={s.applyBtnText}>Apply Leave</Text>
                </TouchableOpacity>
            </View>
            <View style={s.divider} />
            <View style={s.cardRow}>
                <View>
                    <Text style={s.dayText}>{item.day_of_week}</Text>
                    <Text style={s.dateText}>{formatted}</Text>
                </View>
                <Text style={s.daysText}>{`${item.days} day`}</Text>
            </View>
        </View>
    );
}

// ─── Holiday Card ─────────────────────────────────────────────────────────────

function HolidayCard({ item }: { item: UpcomingHoliday }) {
    const formatted = item.holiday_date.split('-').reverse().join('-');
    return (
        <View style={s.card}>
            <View style={s.cardRow}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.name}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.cardRow}>
                <View>
                    <Text style={s.dayText}>{item.day_of_week}</Text>
                    <Text style={s.dateText}>{formatted}</Text>
                </View>
                <Text style={s.daysText}>{`${item.days} day`}</Text>
            </View>
        </View>
    );
}

// ─── Leave Request Card ───────────────────────────────────────────────────────

function LeaveRequestCard({ item, onPress }: { item: LeaveRequest; onPress: () => void }) {
    const from = item.from_date.split('T')[0].split('-').reverse().join('-');
    const to = item.to_date.split('T')[0].split('-').reverse().join('-');
    const statusColor =
        item.approval_status === 'approved' ? colors.green[200] :
            item.approval_status === 'rejected' ? colors.secondary[300] :
                '#F59E0B';

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
            <View style={s.cardRow}>
                <Text style={s.cardTitle}>{item.leave_type_name || item.leave_type || 'Leave'}</Text>
                <View style={[s.statusPill, { backgroundColor: statusColor + '22' }]}>
                    <Text style={[s.statusText, { color: statusColor }]}>{item.approval_status}</Text>
                </View>
            </View>
            <View style={s.divider} />
            <View style={s.cardRow}>
                <Text style={s.dateText}>{from === to ? from : `${from} – ${to}`}</Text>
                <Text style={s.daysText}>{item.leave_mode}</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function LeaveTrackerScreen() {
    const router = useRouter();
    const vm = useLeaveTrackerVM();

    const TABS = ['Leave Summary', 'Leave Balance', 'Leave Request'];

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Leave Tracker" onBack={() => router.back()} />

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={s.tabContent}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={tab}
                        style={[s.tab, vm.activeTab === i && s.tabActive]}
                        onPress={() => vm.setActiveTab(i)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.tabText, vm.activeTab === i && s.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {vm.loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={colors.primary[300]} /></View>
            ) : (

                /* ─── Tab 0: Leave Summary ─── */
                vm.activeTab === 0 ? (
                    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                        {/* My Workspace (leave balance grid) */}
                        <Text style={s.sectionTitle}>My Workspace</Text>
                        <View style={s.balanceGrid}>
                            {vm.summary?.leave_balance.map((item, i) => (
                                <LeaveBalanceCard key={item.leave_type_id} item={item} index={i} />
                            ))}
                        </View>

                        {/* No. of Absent */}
                        <Text style={s.sectionTitle}>No. of Absent</Text>
                        {vm.summary?.absent_without_leave.length === 0 && (
                            <Text style={s.empty}>No absent records</Text>
                        )}
                        {vm.summary?.absent_without_leave.map((item) => (
                            <AbsentCard
                                key={item.attendance_date}
                                item={item}
                                onApply={() => router.push({ pathname: '/apply-leave', params: { date: item.attendance_date } })}
                            />
                        ))}

                        {/* Upcoming Leaves & Holidays */}
                        <Text style={s.sectionTitle}>Upcoming Leaves & Holidays</Text>
                        {vm.summary?.upcoming_holidays.length === 0 && (
                            <Text style={s.empty}>No upcoming holidays</Text>
                        )}
                        {vm.summary?.upcoming_holidays.map((item) => (
                            <HolidayCard key={item.holiday_id} item={item} />
                        ))}

                        <View style={{ height: 32 }} />
                    </ScrollView>

                    /* ─── Tab 1: Leave Balance ─── */
                ) : vm.activeTab === 1 ? (
                    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                        <Text style={s.sectionTitle}>My Workspace</Text>
                        <View style={s.balanceGrid}>
                            {vm.summary?.leave_balance.map((item, i) => (
                                <LeaveBalanceCard key={item.leave_type_id} item={item} index={i} />
                            ))}
                        </View>
                        <View style={{ height: 32 }} />
                    </ScrollView>

                    /* ─── Tab 2: Leave Request ─── */
                ) : (
                    <>
                        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: colors.primary[300], borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
                                onPress={() => router.push('/apply-leave')}
                                activeOpacity={0.85}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>+ Request Leave</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={vm.leaveRequests}
                            keyExtractor={(item) => item.leave_request_id}
                            contentContainerStyle={s.scroll}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<Text style={s.empty}>No leave requests yet</Text>}
                            renderItem={({ item }) => (
                                <LeaveRequestCard
                                    item={item}
                                    onPress={() => router.push({ pathname: '/leave-details', params: { leaveId: item.leave_request_id } })}
                                />
                            )}
                        />
                    </>
                )
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
    tabRow: { maxHeight: 52 },
    tabContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 12, alignItems: 'center' },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(20,79,204,0.1)' },
    tabActive: { backgroundColor: colors.primary[300], borderColor: colors.primary[300] },
    tabText: { fontSize: 14, fontWeight: '500', color: colors.neutral[500] },
    tabTextActive: { color: '#fff' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12, marginTop: 8 },
    balanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    balanceCard: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 17,
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 7.5,
        elevation: 2,
    },
    balanceIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    balanceCode: { fontSize: 13, fontWeight: '700', color: colors.neutral[800] },
    balanceName: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
    balanceStat: { fontSize: 12, color: '#6b7280', alignSelf: 'flex-start' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 17,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 7.5,
        elevation: 1,
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
    applyBtn: { backgroundColor: colors.primary[200], borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    applyBtnText: { fontSize: 12, fontWeight: '500', color: '#fff' },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 10 },
    dayText: { fontSize: 12, color: '#555', textAlign: 'center' },
    dateText: { fontSize: 12, fontWeight: '600', color: '#393939' },
    daysText: { fontSize: 12, fontWeight: '600', color: '#393939' },
    statusPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    statusText: { fontSize: 12, fontWeight: '600' },
    empty: { fontSize: 14, color: colors.neutral[400], textAlign: 'center', paddingVertical: 24 },
});
