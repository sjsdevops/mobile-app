import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Maps dashboard card IDs to their corresponding mobile permission keys.
 * Cards are shown if the user has the matching permission_key enabled.
 */
const CARD_PERMISSION_MAP: Record<string, string> = {
    timetable: 'mobile_class_time_table',
    lesson: 'mobile_lesson_plan',
    attendance: 'mobile_attendance',
    homework: 'mobile_homework',
    exams: 'mobile_exams',
    case: 'mobile_student_case_study',
    myattendance: 'mobile_my_attendance',
    payroll: 'mobile_payroll',
    leave: 'mobile_leave_tracker',
};

export function useDashboardVM() {
    const { user, permissions, hasPermission } = useAuth();

    // Filter class management cards based on permissions
    const visibleClassManagementIds = useMemo(() => {
        const allIds = ['timetable', 'lesson', 'attendance', 'homework', 'exams', 'case'];

        // If no permissions loaded yet (empty array), show nothing until loaded
        // But if permissions were fetched and user has some, filter accordingly
        if (permissions.length === 0) return [];

        return allIds.filter((id) => {
            const permKey = CARD_PERMISSION_MAP[id];
            if (!permKey) return true; // No mapping = always show
            return hasPermission(permKey);
        });
    }, [permissions, hasPermission]);

    // Filter workspace cards based on permissions
    const visibleWorkspaceIds = useMemo(() => {
        // Workspace cards are always shown for all employee roles (not permission-gated)
        if (user?.role === 'student') return [];
        return ['myattendance', 'payroll', 'leave'];
    }, [user]);

    return {
        user,
        permissions,
        visibleClassManagementIds,
        visibleWorkspaceIds,
        hasPermission,
    };
}
