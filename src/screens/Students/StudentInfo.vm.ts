import { useEffect, useState } from 'react';
import { getStudentProfile, type StudentProfile } from '../../services/profileService';

export interface StudentDetail {
  id: string;
  name: string;
  roll: string;
  className: string;
  bloodGroup: string;
  dob: string;
  gender: string;
  email: string;
  parentName: string;
  phone: string;
  joined: string;
  nationality: string;
  motherTongue: string;
  address: string;
  attendancePercentage: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
}

export function useStudentInfoVM(studentId: string | undefined) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      setLoading(true);
      try {
        const data = await getStudentProfile(studentId);
        setStudent({
          id: data.student_id,
          name: `${data.first_name} ${data.last_name}`.trim(),
          roll: data.academic_info?.roll_no ?? '-',
          className: data.academic_info
            ? `${data.academic_info.class_name} - ${data.academic_info.section_name}`
            : '-',
          bloodGroup: data.blood_group || '-',
          dob: formatDate(data.date_of_birth),
          gender: data.gender || '-',
          email: data.personal_details?.email || '-',
          parentName: data.personal_details?.father_name || data.personal_details?.mother_name || '-',
          phone: data.personal_details?.primary_contact || '-',
          joined: formatDate(data.academic_info?.admission_date ?? null),
          nationality: data.nationality || '-',
          motherTongue: data.mother_toung || '-',
          address: data.personal_details?.address || '-',
          attendancePercentage: data.attendance_percentage ?? 0,
        });
      } catch (error) {
        console.error('[StudentInfo] Failed to fetch:', error);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  return { student, loading };
}
