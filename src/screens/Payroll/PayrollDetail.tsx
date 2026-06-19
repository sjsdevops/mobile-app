import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { DocumentDownload } from 'iconsax-react-nativejs';
import { useMemo, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
    const [downloading, setDownloading] = useState(false);

    const salary: EmployeeSalary | null = useMemo(() => {
        try {
            return salaryData ? JSON.parse(salaryData) : null;
        } catch {
            return null;
        }
    }, [salaryData]);

    const html = useMemo(() => (salary ? generatePayslipHtml(salary) : ''), [salary]);

    async function handleDownloadPDF() {
        if (!salary) return;
        
        setDownloading(true);
        try {
            // Generate PDF from the same HTML template
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            // Format: employeeId_Month-Year.pdf (e.g., EMP001_January-2024.pdf)
            const monthYear = fmtMonth(salary.salary_month); // "January 2024"
            const [month, year] = monthYear.split(' ');
            const fileName = `${salary.staff_name}_${month}-${year}.pdf`;

            // Share/Download the PDF
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Download Payslip - ${monthYear}`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Success', 'PDF generated successfully!');
            }
        } catch (error) {
            console.error('[PayrollDetail] PDF generation failed:', error);
            Alert.alert('Error', 'Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
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
                        <TouchableOpacity 
                            style={[s.actionBtn, downloading && s.actionBtnDisabled]} 
                            onPress={handleDownloadPDF} 
                            activeOpacity={0.8}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <ActivityIndicator size="small" color={colors.primary[300]} />
                            ) : (
                                <DocumentDownload color={colors.primary[300]} size={20} variant="Bold" />
                            )}
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
    actionBtn: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: colors.primary.alpha ?? '#EEF2FF',
        minWidth: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnDisabled: {
        opacity: 0.5,
    },
    errorText: { fontSize: 14, color: colors.neutral[500] },
    backLink: { fontSize: 14, fontWeight: '600', color: colors.primary[300] },
});
