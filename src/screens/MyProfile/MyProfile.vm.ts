import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getEmployeeProfile,
  getStudentProfile,
  type EmployeeProfile,
  type StudentProfile,
} from '../../services/profileService';

export type ProfileInfo = {
  label: string;
  value: string;
};

export type ProfileSummary = {
  name: string;
  role: string;
  experience: string;
  classTeacher: string;
  personalInfo: ProfileInfo[];
};

export type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
}

export function useMyProfileVM() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState<EmployeeProfile | null>(null);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'student') {
        const data = await getStudentProfile(user.id);
        setStudentData(data);
      } else {
        const data = await getEmployeeProfile(user.id);
        setEmployeeData(data);
      }
    } catch (error) {
      console.error('[Profile] Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, refreshKey]);

  const refreshProfile = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const profile = useMemo<ProfileSummary>(() => {
    if (user?.role === 'student' && studentData) {
      return {
        name: `${studentData.first_name} ${studentData.last_name}`.trim(),
        role: 'Student',
        experience: `${studentData.attendance_percentage ?? 0}%`,
        classTeacher: studentData.academic_info
          ? `${studentData.academic_info.class_name} - ${studentData.academic_info.section_name}`
          : '-',
        personalInfo: [
          { label: 'Roll No', value: studentData.academic_info?.roll_no ?? '-' },
          { label: 'Class', value: studentData.academic_info ? `${studentData.academic_info.class_name} - ${studentData.academic_info.section_name}` : '-' },
          { label: 'Blood Group', value: studentData.blood_group || '-' },
          { label: 'Gender', value: studentData.gender || '-' },
          { label: 'Date of Birth', value: formatDate(studentData.date_of_birth) },
          { label: 'Contact', value: studentData.personal_details?.primary_contact ?? '-' },
        ],
      };
    }

    if (employeeData) {
      const assignedCount = employeeData.assigned_classes?.reduce(
        (acc, cls) => acc + (cls.sections?.length ?? 0), 0
      ) ?? 0;

      return {
        name: `${employeeData.first_name} ${employeeData.last_name}`.trim(),
        role: employeeData.role?.role_name ?? 'Employee',
        experience: `${employeeData.attendance_percentage ?? 0}%`,
        classTeacher: String(assignedCount),
        personalInfo: [
          { label: 'Employee Code', value: employeeData.work_details?.employee_code ?? '-' },
          { label: 'Email Address', value: employeeData.email || '-' },
          { label: 'Phone Number', value: employeeData.mobile_number || '-' },
          { label: 'Date of Joining', value: formatDate(employeeData.joining_date) },
          { label: 'Blood Group', value: employeeData.blood_group || '-' },
          { label: 'Gender', value: employeeData.gender || '-' },
          { label: 'Subject', value: employeeData.work_details?.subject_handline ?? '-' },
          { label: 'Shift', value: employeeData.work_details?.shift_time ?? '-' },
        ],
      };
    }

    // Fallback while loading
    return {
      name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      role: user?.role ?? '',
      experience: '-',
      classTeacher: '-',
      personalInfo: [],
    };
  }, [user, employeeData, studentData]);

  const settings = useMemo<SettingItem[]>(
    () => [
      {
        id: 'edit',
        title: 'Edit Personal Details',
        subtitle: 'Update your profile information',
        route: '/edit-profile',
      },
      {
        id: 'password',
        title: 'Change Password',
        subtitle: 'Update your login password',
        route: '/change-password',
      },
      {
        id: 'notifications',
        title: 'Notification Preferences',
        subtitle: 'Manage app notifications',
      },
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get assistance and FAQs',
      },
      {
        id: 'policies',
        title: 'Terms & Policies',
        subtitle: 'Read school policies',
      },
    ],
    [],
  );

  return { profile, settings, loading, employeeData, studentData, refreshProfile };
}
