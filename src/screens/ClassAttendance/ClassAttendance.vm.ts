import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  getClassAttendance,
  markStudentAttendance,
  approveStudentAttendance,
  type ClassAttendanceItem,
} from '../../services/attendanceService';
import { getAllClasses } from '../../services/classService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'not_marked';

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  avatarInitials: string;
  status: AttendanceStatus;
};

export type AttendanceStep = 1 | 2 | 3 | 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useAttendanceVM() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    classId: string;
    sectionId: string;
    className: string;
    sectionName: string;
  }>();

  const classId = params.classId || '';
  const sectionId = params.sectionId || '';
  const className = params.className || '';
  const sectionName = params.sectionName || '';

  const [step, setStep] = useState<AttendanceStep>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [approving, setApproving] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  // Set once on load — true only when attendance was already submitted to the server
  const [attendanceAlreadySubmitted, setAttendanceAlreadySubmitted] = useState(false);

  // Check if user is coordinator for this section
  useEffect(() => {
    if (!user || !classId || !sectionId) return;
    (async () => {
      try {
        const classes = await getAllClasses(user.id);
        const cls = classes.find((c) => c.class_id === classId);
        const sec = cls?.sections.find((s) => s.section_id === sectionId);
        const coordMatch = sec?.coordinator?.employee_id === user.id;
        console.log('[Attendance] Coordinator check:', { coordinatorId: sec?.coordinator?.employee_id, userId: user.id, match: coordMatch, attendanceMarked });
        setIsCoordinator(coordMatch);
        setIsClassTeacher(sec?.class_teacher?.employee_id === user.id);
      } catch { }
    })();
  }, [user, classId, sectionId]);

  // Fetch students list AND existing attendance
  useEffect(() => {
    if (!classId || !sectionId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const studentsResponse = await api.get(
          `/users/${user.id}/students?class=${classId}&section=${sectionId}`
        );
        const studentsData = studentsResponse.data?.data ?? studentsResponse.data;
        const studentsList: Array<{
          student_id: string;
          first_name: string;
          last_name: string;
          roll_number?: string;
        }> = studentsData?.items ?? studentsData ?? [];

        let attendanceMap = new Map<string, ClassAttendanceItem>();
        try {
          const attendanceData = await getClassAttendance(classId, sectionId, getTodayDate());
          if (attendanceData.items && attendanceData.items.length > 0) {
            for (const item of attendanceData.items) {
              attendanceMap.set(item.student_id, item);
            }
            setAttendanceMarked(true);
            // Check if all are already approved — guard against empty array
            // and missing is_approved field (treat undefined as not approved)
            const allApproved =
              attendanceData.items.length > 0 &&
              attendanceData.items.every((item: any) => item.is_approved === true);
            const allSubmitted =
              attendanceData.items.length > 0 &&
              attendanceData.items.every((item: any) => item.status == "present" || item.status == "absent");
              setAttendanceAlreadySubmitted(allSubmitted)
            setAlreadyApproved(allApproved);
            // If not yet approved, coordinator needs to approve — treat as having edits
            if (!allApproved) {
              setHasUnsavedEdits(true);
            }
          }
        } catch {
          // Not yet marked
        }

        const merged: Student[] = studentsList.map((s, index) => {
          const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim();
          const attendanceRecord = attendanceMap.get(s.student_id);

          let status: AttendanceStatus = 'not_marked';
          if (attendanceRecord) {
            if (attendanceRecord.is_present) status = 'present';
            else if (attendanceRecord.is_absent) status = 'absent';
          }

          return {
            id: s.student_id,
            name: fullName || `Student ${index + 1}`,
            rollNo: s.roll_number || String(index + 1).padStart(4, '0'),
            avatarInitials: getInitials(fullName || 'ST'),
            status,
          };
        });

        setStudents(merged);
      } catch (error) {
        console.error('[Attendance] Failed to fetch data:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, sectionId, user]);

  const totalCount = students.length;
  const presentCount = useMemo(() => students.filter((s) => s.status === 'present').length, [students]);
  const absentCount = useMemo(() => students.filter((s) => s.status === 'absent').length, [students]);
  const presentStudents = useMemo(() => students.filter((s) => s.status === 'present'), [students]);
  const absentStudents = useMemo(() => students.filter((s) => s.status === 'absent'), [students]);

  // True when every student has been explicitly marked (no 'not_marked' remaining)
  const allStudentsMarked = useMemo(
    () => students.length > 0 && students.every((s) => s.status !== 'not_marked'),
    [students],
  );

  // Teacher role: class teacher who is NOT a coordinator
  const isTeacher = isClassTeacher && !isCoordinator;

  function mark(id: string, status: AttendanceStatus) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    // If coordinator edits after approving, reset approval state so they can re-approve
    if (isCoordinator && alreadyApproved) {
      setAlreadyApproved(false);
    }
    if (isCoordinator) {
      setHasUnsavedEdits(true);
    }
  }

  function markAllPresent() {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' as const })));
  }

  function goToReview() { setStep(2); }
  function goBackToMark() { setStep(1); }

  async function submitAttendance() {
    if (!user || !classId || !sectionId) return;
    setSubmitting(true);
    try {
      await markStudentAttendance({
        class_id: classId,
        section_id: sectionId,
        date: getTodayDate(),
        attendance: students.map((s) => ({
          student_id: s.id,
          is_present: s.status === 'present',
          is_absent: s.status === 'absent',
        })),
        created_by: user.id,
        modified_by: user.id,
      });
      setAttendanceMarked(true);
      setStep(4);
    } catch (error) {
      console.error('[Attendance] Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // Approve attendance: coordinator only, when attendance API returned non-empty list
  const canApproveAttendance = isCoordinator && attendanceMarked;
  console.log('[Attendance] canApprove:', { isCoordinator, attendanceMarked, canApproveAttendance });

  async function approveAttendance() {
    if (!user || !classId || !sectionId) return;
    if (!hasUnsavedEdits) return; // block if nothing was edited
    setApproving(true);
    try {
      const markedStudents = students.filter((s) => s.status !== 'not_marked');
      if (markedStudents.length === 0) {
        Alert.alert('No attendance to approve', 'There are no marked students to approve.');
        return;
      }
      await approveStudentAttendance({
        class_id: classId,
        section_id: sectionId,
        date: getTodayDate(),
        attendance: markedStudents.map((s) => ({
          student_id: s.id,
          is_present: s.status === 'present',
          is_absent: s.status === 'absent',
          is_approved: true,
        })),
        modified_by: user.id,
      });
      setAlreadyApproved(true);
      setHasUnsavedEdits(false);
      Alert.alert('Success', 'Attendance approved successfully');
    } catch (error: any) {
      console.error('[Attendance] Approve failed:', error);
      const msg = error?.response?.data?.detail || error?.message || 'Failed to approve attendance';
      Alert.alert('Error', msg);
    } finally {
      setApproving(false);
    }
  }

  return {
    step,
    students,
    totalCount,
    presentCount,
    absentCount,
    presentStudents,
    absentStudents,
    mark,
    markAllPresent,
    goToReview,
    goBackToMark,
    submitAttendance,
    loading,
    submitting,
    className,
    sectionName,
    canApproveAttendance,
    approveAttendance,
    approving,
    attendanceMarked,
    alreadyApproved,
    attendanceAlreadySubmitted,
    isTeacher,
    hasUnsavedEdits,
  };
}
