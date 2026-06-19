import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeProfile, type EmployeeProfile } from '../../services/profileService';

/**
 * Maps dashboard card IDs to their corresponding mobile permission keys.
 */
const CARD_PERMISSION_MAP: Record<string, string> = {
    timetable: 'mobile_class_time_table',
    lesson: 'mobile_lession_plan',
    attendance: 'mobile_class_attendance',
    homework: 'mobile_home_work',
    exams: 'mobile_exams',
    case: 'mobile_student_case_study',
    myattendance: 'mobile_my_attendance',
    payroll: 'mobile_payroll',
    leave: 'mobile_leave_tracker',
    holidays: 'mobile_holidays',
};

export interface AssignedClassCard {
    classId: string;
    className: string;
    sectionName: string;
    classType: string;
    totalStudents: number;
    todayAttendancePercentage: number;
}

export function useDashboardVM() {
    const { user, permissions, hasPermission } = useAuth();
    const [assignedClasses, setAssignedClasses] = useState<AssignedClassCard[]>([]);
    const [profileLoading, setProfileLoading] = useState(false);
    const [attendancePercentage, setAttendancePercentage] = useState<number | null>(null);

    // Fetch employee profile for assigned classes
    useEffect(() => {
        if (!user || user.role === 'student') return;

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const data = await getEmployeeProfile(user.id);
                const cards: AssignedClassCard[] = [];
                for (const cls of data.assigned_classes ?? []) {
                    for (const section of cls.sections ?? []) {
                        cards.push({
                            classId: cls.class_id,
                            className: cls.class_name,
                            sectionName: section.section_name,
                            classType: cls.class_type,
                            totalStudents: section.total_students ?? 0,
                            todayAttendancePercentage: section.today_attendance_percentage ?? 0,
                        });
                    }
                }
                setAssignedClasses(cards);
                setAttendancePercentage(data.attendance_percentage);
            } catch (error) {
                console.error('[Dashboard] Failed to fetch profile:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Filter class management cards based on permissions
    const visibleClassManagementIds = useMemo(() => {
        const allIds = ['timetable', 'lesson', 'attendance', 'homework', 'exams', 'case'];

        if (permissions.length === 0) return [];

        return allIds.filter((id) => {
            const permKey = CARD_PERMISSION_MAP[id];
            if (!permKey) return true;
            return hasPermission(permKey);
        });
    }, [permissions, hasPermission]);

    // Workspace cards always shown for employees
    const visibleWorkspaceIds = useMemo(() => {
        if (user?.role === 'student') return [];
        return ['myattendance', 'payroll', 'leave'];
    }, [user]);

    return {
        user,
        permissions,
        visibleClassManagementIds,
        visibleWorkspaceIds,
        hasPermission,
        assignedClasses,
        attendancePercentage,
        profileLoading,
    };
}
