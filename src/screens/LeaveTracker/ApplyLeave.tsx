import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ModalDropdown } from '../../components/ui/ModalDropdown';
import { DatePickerField } from '../../components/ui/DatePickerField';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { applyLeave, getLeaveRequests, type LeaveRequest } from '../../services/leaveService';

interface LeaveType {
    leave_type_id: string;
    name: string;
    code: string;
}

export function ApplyLeaveScreen() {
    const router = useRouter();
    const { user } = useAuth();
    // Optional pre-filled date from absent card
    const { date: prefillDate } = useLocalSearchParams<{ date?: string }>();

    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [existingLeaveRequests, setExistingLeaveRequests] = useState<LeaveRequest[]>([]);
    const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
    const [fromDate, setFromDate] = useState(prefillDate || '');
    const [toDate, setToDate] = useState(prefillDate || '');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            if (!user?.id) return;
            try {
                const [leaveTypesResponse, leaveRequestsData] = await Promise.all([
                    api.get('/leave-types?status=true&limit=50'),
                    getLeaveRequests(user.id),
                ]);
                
                const data = leaveTypesResponse.data?.data ?? leaveTypesResponse.data;
                const items: LeaveType[] = data?.items ?? [];
                setLeaveTypes(items);
                setExistingLeaveRequests(leaveRequestsData);
                
                if (items.length > 0) setSelectedLeaveTypeId(items[0].leave_type_id);
            } catch (err) {
                console.error('[ApplyLeave] Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    const leaveTypeOptions = useMemo(() =>
        leaveTypes.map((lt) => ({ id: lt.leave_type_id, label: `${lt.name} (${lt.code})` })),
        [leaveTypes]
    );

    const handleSubmit = async () => {
        if (!user?.id) return;
        if (!selectedLeaveTypeId) { Alert.alert('Error', 'Please select a leave type'); return; }
        if (!fromDate) { Alert.alert('Error', 'Please select a from date'); return; }
        if (!toDate) { Alert.alert('Error', 'Please select a to date'); return; }
        if (toDate < fromDate) { Alert.alert('Error', 'To date cannot be before from date'); return; }

        // Check if the leave date is today, tomorrow, or day after tomorrow
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const selectedFromDate = new Date(fromDate);
        selectedFromDate.setHours(0, 0, 0, 0);
        
        const selectedToDate = new Date(toDate);
        selectedToDate.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        // If from date is today or within the next 2 days, show HR contact message
        if (selectedFromDate >= today && selectedFromDate <= dayAfterTomorrow) {
            Alert.alert(
                'Contact HR Required',
                'You cannot apply leave for today, tomorrow, or the day after tomorrow through the app. Please contact HR directly.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Check if a leave request already exists for the selected date range
        const hasOverlap = existingLeaveRequests.some((request) => {
            const requestFrom = new Date(request.from_date.split('T')[0]);
            requestFrom.setHours(0, 0, 0, 0);
            
            const requestTo = new Date(request.to_date.split('T')[0]);
            requestTo.setHours(0, 0, 0, 0);

            // Check if there's any overlap between the selected dates and existing request dates
            return (
                (selectedFromDate >= requestFrom && selectedFromDate <= requestTo) ||
                (selectedToDate >= requestFrom && selectedToDate <= requestTo) ||
                (selectedFromDate <= requestFrom && selectedToDate >= requestTo)
            );
        });

        if (hasOverlap) {
            Alert.alert(
                'Duplicate Leave Request',
                'A leave request already exists for the selected date range. Please check your existing leave requests.',
                [{ text: 'OK' }]
            );
            return;
        }

        setSaving(true);
        try {
            await applyLeave({
                employee_id: user.id,
                leave_type_id: selectedLeaveTypeId,
                from_date: fromDate,
                to_date: toDate,
                reason: reason.trim() || undefined,
                created_by: user.id,
                modified_by: user.id,
            });
            Alert.alert('Success', 'Leave request submitted successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to submit leave request');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Apply Leave" onBack={() => router.back()} />

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={colors.primary[300]} /></View>
            ) : (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
                    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        <Text style={s.label}>Leave Type</Text>
                        <ModalDropdown
                            label="Select Leave Type"
                            value={selectedLeaveTypeId}
                            options={leaveTypeOptions}
                            onSelect={setSelectedLeaveTypeId}
                        />

                        <Text style={s.label}>From Date</Text>
                        <DatePickerField value={fromDate} onChange={setFromDate} placeholder="Select from date" />

                        <Text style={s.label}>To Date</Text>
                        <DatePickerField value={toDate} onChange={setToDate} placeholder="Select to date" />

                        <Text style={s.label}>Reason (optional)</Text>
                        <TextInput
                            style={[s.input, s.textArea]}
                            placeholder="Enter reason for leave..."
                            placeholderTextColor={colors.neutral[400]}
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={4}
                        />

                        <TouchableOpacity
                            style={[s.submitBtn, saving && s.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={saving}
                            activeOpacity={0.85}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={s.submitBtnText}>Submit Leave Request</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 16, paddingBottom: 40 },
    label: { fontSize: 14, fontWeight: '600', color: colors.neutral[900], marginBottom: 8, marginTop: 12 },
    input: {
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.neutral[900],
        backgroundColor: colors.neutral[100],
        marginBottom: 12,
    },
    textArea: { textAlignVertical: 'top', minHeight: 100 },
    submitBtn: {
        backgroundColor: colors.primary[300],
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnDisabled: { opacity: 0.65 },
    submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
