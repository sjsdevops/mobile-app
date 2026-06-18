import {
    ActivityIndicator,
    FlatList,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyWallet, DocumentText } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { usePayrollVM } from './Payroll.vm';
import type { EmployeeSalary } from '../../services/payrollService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMonth(month: string): string {
    const [y, m] = month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function fmt(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Salary Card ──────────────────────────────────────────────────────────────

function SalaryCard({ item, onView }: { item: EmployeeSalary; onView: () => void }) {
    return (
        <View style={s.card}>
            {/* Month header */}
            <View style={s.cardHeader}>
                <View style={s.monthBadge}>
                    <EmptyWallet color={colors.primary[300]} size={18} variant="Bold" />
                    <Text style={s.monthText}>{fmtMonth(item.salary_month)}</Text>
                </View>
                <View style={s.periodPill}>
                    <Text style={s.periodText}>
                        {item.period_start.slice(5).split('-').reverse().join('/')} –{' '}
                        {item.period_end.slice(5).split('-').reverse().join('/')}
                    </Text>
                </View>
            </View>

            <View style={s.divider} />

            {/* Stats row */}
            <View style={s.statsRow}>
                <View style={s.statItem}>
                    <Text style={s.statLabel}>Gross</Text>
                    <Text style={[s.statValue, { color: colors.green[200] }]}>{fmt(item.gross)}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statLabel}>Deductions</Text>
                    <Text style={[s.statValue, { color: colors.secondary[300] }]}>{fmt(item.total_deduct)}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statLabel}>Days Worked</Text>
                    <Text style={s.statValue}>{item.nod}</Text>
                </View>
            </View>

            {/* Net salary + button */}
            <View style={s.netRow}>
                <View>
                    <Text style={s.netLabel}>Net Salary</Text>
                    <Text style={s.netValue}>{fmt(item.net_salary)}</Text>
                </View>
                <TouchableOpacity style={s.viewBtn} onPress={onView} activeOpacity={0.85}>
                    <DocumentText color="#fff" size={16} variant="Bold" />
                    <Text style={s.viewBtnText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function PayrollScreen() {
    const router = useRouter();
    const vm = usePayrollVM();

    function handleViewDetails(salary: EmployeeSalary) {
        router.push({
            pathname: '/payroll-detail',
            params: { salaryData: JSON.stringify(salary) },
        });
    }

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="My Payroll" onBack={() => router.back()} />

            {vm.loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : vm.error ? (
                <View style={s.center}>
                    <Text style={s.errorText}>{vm.error}</Text>
                    <TouchableOpacity style={s.retryBtn} onPress={vm.refresh}>
                        <Text style={s.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={vm.salaries}
                    keyExtractor={(item) => item.employee_salary_id}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={s.center}>
                            <EmptyWallet color={colors.neutral[300]} size={48} variant="Bold" />
                            <Text style={s.emptyText}>No payroll records found</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <SalaryCard item={item} onView={() => handleViewDetails(item)} />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
    list: { padding: 16, gap: 14, paddingBottom: 32 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    monthBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    monthText: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
    periodPill: {
        backgroundColor: colors.primary.alpha ?? '#EEF2FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    periodText: { fontSize: 11, fontWeight: '600', color: colors.primary[300] },

    divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 14 },

    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 11, color: colors.neutral[500], marginBottom: 3 },
    statValue: { fontSize: 14, fontWeight: '700', color: colors.neutral[900] },
    statDivider: { width: 1, height: 32, backgroundColor: '#e5e7eb' },

    netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    netLabel: { fontSize: 12, color: colors.neutral[500] },
    netValue: { fontSize: 20, fontWeight: '800', color: colors.neutral[900] },

    viewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    viewBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

    errorText: { fontSize: 14, color: colors.neutral[500], textAlign: 'center' },
    retryBtn: {
        backgroundColor: colors.primary[300],
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    emptyText: { fontSize: 15, color: colors.neutral[400], marginTop: 12 },
});
