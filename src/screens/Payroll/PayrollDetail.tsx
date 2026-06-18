import {
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Share as ShareIcon } from 'iconsax-react-nativejs';
import { useMemo } from 'react';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { generatePayslipHtml } from './payslipHtml';
import type { EmployeeSalary } from '../../services/payrollService';

function fmtMonth(month: string): string {
    const [y, m] = month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function PayrollDetailScreen() {
    const router = useRouter();
    const { salaryData } = useLocalSearchParams<{ salaryData: string }>();

    const salary: EmployeeSalary | null = useMemo(() => {
        try {
            return salaryData ? JSON.parse(salaryData) : null;
        } catch {
            return null;
        }
    }, [salaryData]);

    const html = useMemo(() => (salary ? generatePayslipHtml(salary) : ''), [salary]);

    async function handleShare() {
        if (!salary) return;
        try {
            await Share.share({
                title: `Payslip - ${fmtMonth(salary.salary_month)}`,
                message:
                    `Payslip for ${salary.staff_name} — ${fmtMonth(salary.salary_month)}\n` +
                    `Gross: ₹${salary.gross}\n` +
                    `Deductions: ₹${salary.total_deduct}\n` +
                    `Net Salary: ₹${salary.net_salary}`,
            });
        } catch {
            // user cancelled
        }
    }

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader
                title={salary ? `Payslip — ${fmtMonth(salary.salary_month)}` : 'Payslip'}
                onBack={() => router.back()}
                rightElement={
                    salary ? (
                        <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                            <ShareIcon color={colors.primary[300]} size={20} variant="Bold" />
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            {!salary ? (
                <View style={s.center}>
                    <Text style={s.errorText}>Payslip not found.</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={s.backLink}>← Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <WebView
                    source={{ html }}
                    style={s.webview}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    originWhitelist={['*']}
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    webview: { flex: 1, backgroundColor: '#f4f6fb' },
    shareBtn: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: colors.primary.alpha ?? '#EEF2FF',
    },
    errorText: { fontSize: 14, color: colors.neutral[500] },
    backLink: { fontSize: 14, fontWeight: '600', color: colors.primary[300] },
});
