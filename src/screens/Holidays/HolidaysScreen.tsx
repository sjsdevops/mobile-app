import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar1, Sun1, Clock } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useHolidaysVM, type HolidayFilter } from './Holidays.vm';
import type { Holiday } from '../../services/leaveService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function parseMonthKey(key: string): string {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function fmtDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d} ${MONTH_NAMES[parseInt(m) - 1].slice(0, 3)} ${y}`;
}

function getDayOfWeek(dateStr: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
}

function isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().slice(0, 10);
}

function isUpcoming(dateStr: string): boolean {
    return dateStr >= new Date().toISOString().slice(0, 10);
}

// ─── Holiday Card ─────────────────────────────────────────────────────────────

function HolidayCard({ item }: { item: Holiday }) {
    const upcoming = isUpcoming(item.holiday_date);
    const today = isToday(item.holiday_date);
    const dayOfWeek = getDayOfWeek(item.holiday_date);

    return (
        <View style={[s.card, today && s.cardToday]}>
            {/* Date badge */}
            <View style={[s.dateBadge, upcoming ? s.dateBadgeUpcoming : s.dateBadgePast]}>
                <Text style={[s.dateBadgeDay, upcoming ? s.dateBadgeDayUpcoming : s.dateBadgeDayPast]}>
                    {item.holiday_date.split('-')[2]}
                </Text>
                <Text style={[s.dateBadgeMonth, upcoming ? s.dateBadgeMonthUpcoming : s.dateBadgeMonthPast]}>
                    {MONTH_NAMES[parseInt(item.holiday_date.split('-')[1]) - 1].slice(0, 3).toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View style={s.cardInfo}>
                <View style={s.cardTitleRow}>
                    <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
                    {today && (
                        <View style={s.todayBadge}>
                            <Text style={s.todayBadgeText}>Today</Text>
                        </View>
                    )}
                </View>
                <View style={s.cardMeta}>
                    <Calendar1 color={colors.neutral[500]} size={13} variant="Linear" />
                    <Text style={s.cardMetaText}>{dayOfWeek}, {fmtDate(item.holiday_date)}</Text>
                </View>
                {item.description ? (
                    <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
            </View>

            {/* Status dot */}
            <View style={[s.statusDot, upcoming ? s.statusDotUpcoming : s.statusDotPast]} />
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function HolidaysScreen() {
    const router = useRouter();
    const vm = useHolidaysVM();

    const FILTERS: { key: HolidayFilter; label: string }[] = [
        { key: 'upcoming', label: `Upcoming (${vm.upcomingCount})` },
        { key: 'all', label: `All (${vm.totalCount})` },
    ];

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Holidays" onBack={() => router.back()} />

            {/* Summary strip */}
            <View style={s.summaryStrip}>
                <View style={s.summaryItem}>
                    <View style={[s.summaryIcon, { backgroundColor: colors.primary.alpha }]}>
                        <Sun1 color={colors.primary[300]} size={18} variant="Bold" />
                    </View>
                    <View>
                        <Text style={s.summaryValue}>{vm.totalCount}</Text>
                        <Text style={s.summaryLabel}>Holidays</Text>
                    </View>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryItem}>
                    <View style={[s.summaryIcon, { backgroundColor: colors.green.alpha }]}>
                        <Calendar1 color={colors.green[200]} size={18} variant="Bold" />
                    </View>
                    <View>
                        <Text style={s.summaryValue}>{vm.upcomingCount}</Text>
                        <Text style={s.summaryLabel}>Upcoming</Text>
                    </View>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryItem}>
                    <View style={[s.summaryIcon, { backgroundColor: colors.neutral.alpha }]}>
                        <Clock color={colors.neutral[500]} size={18} variant="Bold" />
                    </View>
                    <View>
                        <Text style={s.summaryValue}>{vm.pastCount}</Text>
                        <Text style={s.summaryLabel}>Past</Text>
                    </View>
                </View>
            </View>

            {/* Filter tabs */}
            <View style={s.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[s.filterTab, vm.filter === f.key && s.filterTabActive]}
                        onPress={() => vm.setFilter(f.key)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.filterTabText, vm.filter === f.key && s.filterTabTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {vm.loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : vm.error ? (
                <View style={s.center}>
                    <Text style={s.errText}>{vm.error}</Text>
                    <TouchableOpacity style={s.retryBtn} onPress={vm.refresh}>
                        <Text style={s.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : vm.grouped.length === 0 ? (
                <View style={s.center}>
                    <Sun1 color={colors.neutral[300]} size={52} variant="Bold" />
                    <Text style={s.emptyText}>
                        {vm.filter === 'upcoming' ? 'No upcoming holidays' : 'No holidays found'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {vm.grouped.map(({ monthKey, items }) => (
                        <View key={monthKey}>
                            {/* Month header */}
                            <View style={s.monthHeader}>
                                <Text style={s.monthTitle}>{parseMonthKey(monthKey)}</Text>
                                <View style={s.monthLine} />
                                <View style={s.monthCountBadge}>
                                    <Text style={s.monthCount}>{items.length}</Text>
                                </View>
                            </View>

                            {items.map((h) => (
                                <HolidayCard key={h.holiday_id} item={h} />
                            ))}
                        </View>
                    ))}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
    scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

    // Summary strip
    summaryStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 14,
        marginTop: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryValue: { fontSize: 18, fontWeight: '800', color: colors.neutral[900] },
    summaryLabel: { fontSize: 11, color: colors.neutral[500] },
    summaryDivider: { width: 1, height: 36, backgroundColor: colors.neutral[200], marginHorizontal: 4 },

    // Filter tabs
    filterRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: '#f0f2f8',
        borderRadius: 12,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    filterTabText: { fontSize: 13, fontWeight: '600', color: colors.neutral[500] },
    filterTabTextActive: { color: colors.primary[300] },

    // Month header
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 16,
        gap: 10,
    },
    monthTitle: { fontSize: 14, fontWeight: '700', color: colors.neutral[700] },
    monthLine: { flex: 1, height: 1, backgroundColor: colors.neutral[200] },
    monthCountBadge: {
        backgroundColor: colors.primary.alpha,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    monthCount: { fontSize: 12, fontWeight: '700', color: colors.primary[300] },

    // Holiday card
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
        gap: 12,
    },
    cardToday: {
        borderWidth: 1.5,
        borderColor: colors.primary[300],
        backgroundColor: colors.primary.alpha,
    },

    // Date badge
    dateBadge: {
        width: 48,
        borderRadius: 12,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    dateBadgeUpcoming: { backgroundColor: colors.primary[300] },
    dateBadgePast: { backgroundColor: colors.neutral[200] },
    dateBadgeDay: { fontSize: 20, fontWeight: '800' },
    dateBadgeDayUpcoming: { color: '#fff' },
    dateBadgeDayPast: { color: colors.neutral[600] },
    dateBadgeMonth: { fontSize: 10, fontWeight: '700', marginTop: 1 },
    dateBadgeMonthUpcoming: { color: 'rgba(255,255,255,0.8)' },
    dateBadgeMonthPast: { color: colors.neutral[500] },

    // Card body
    cardInfo: { flex: 1 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cardMetaText: { fontSize: 12, color: colors.neutral[500] },
    cardDesc: { fontSize: 12, color: colors.neutral[500], marginTop: 4 },

    // Today badge
    todayBadge: {
        backgroundColor: colors.primary[300],
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    todayBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

    // Status dot
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        flexShrink: 0,
    },
    statusDotUpcoming: { backgroundColor: colors.green[200] },
    statusDotPast: { backgroundColor: colors.neutral[300] },

    // States
    errText: { fontSize: 14, color: colors.neutral[500], textAlign: 'center' },
    retryBtn: {
        backgroundColor: colors.primary[300],
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    emptyText: { fontSize: 15, color: colors.neutral[400], marginTop: 12, textAlign: 'center' },
});
