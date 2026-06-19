import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import {
    getLeaveSummary,
    getLeaveRequests,
    applyLeave,
    type LeaveSummary,
    type LeaveRequest,
} from '../../services/leaveService';

export function useLeaveTrackerVM() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<LeaveSummary | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [sum, requests] = await Promise.all([
                getLeaveSummary(user.id, new Date().getFullYear()),
                getLeaveRequests(user.id),
            ]);
            setSummary(sum);
            setLeaveRequests(requests);
        } catch (err) {
            console.error('[LeaveTracker] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Refresh when screen comes back into focus (e.g., after applying leave)
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Refresh when switching to Leave Request tab
    useEffect(() => {
        if (activeTab === 2) fetchData();
    }, [activeTab]);

    async function onApplyLeave(date: string) {
        if (!user?.id || !summary) return;

        // Use first leave type available, or prompt — simplified: use first balance entry
        const firstLeaveType = summary.leave_balance[0];
        if (!firstLeaveType) {
            Alert.alert('No Leave Types', 'No leave types configured.');
            return;
        }

        Alert.alert(
            'Apply Leave',
            `Apply ${firstLeaveType.name} for ${date}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    onPress: async () => {
                        try {
                            await applyLeave({
                                employee_id: user.id,
                                leave_type_id: firstLeaveType.leave_type_id,
                                from_date: date,
                                to_date: date,
                                created_by: user.id,
                                modified_by: user.id,
                            });
                            Alert.alert('Success', 'Leave applied successfully');
                            fetchData();
                        } catch (err: any) {
                            Alert.alert('Error', err?.response?.data?.detail || 'Failed to apply leave');
                        }
                    },
                },
            ]
        );
    }

    return {
        activeTab,
        setActiveTab,
        loading,
        summary,
        leaveRequests,
        onApplyLeave,
    };
}
