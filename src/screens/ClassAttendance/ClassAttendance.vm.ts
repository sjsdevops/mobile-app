import { useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent';

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  avatarInitials: string;
  status: AttendanceStatus;
};

export type AttendanceStep = 1 | 2 | 3 | 4;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_STUDENTS: Student[] = [
  { id: '1',  name: 'Rajesh Sharma',   rollNo: '1001', avatarInitials: 'RS', status: 'present' },
  { id: '2',  name: 'Priya Nair',      rollNo: '1002', avatarInitials: 'PN', status: 'absent'  },
  { id: '3',  name: 'Arjun Menon',     rollNo: '1003', avatarInitials: 'AM', status: 'present' },
  { id: '4',  name: 'Sneha Pillai',    rollNo: '1004', avatarInitials: 'SP', status: 'present' },
  { id: '5',  name: 'Vikram Iyer',     rollNo: '1005', avatarInitials: 'VI', status: 'present' },
  { id: '6',  name: 'Deepa Krishnan',  rollNo: '1006', avatarInitials: 'DK', status: 'present' },
  { id: '7',  name: 'Arun Kumar',      rollNo: '1007', avatarInitials: 'AK', status: 'present' },
  { id: '8',  name: 'Meena Suresh',    rollNo: '1008', avatarInitials: 'MS', status: 'absent'  },
  { id: '9',  name: 'Rahul Joshi',     rollNo: '1009', avatarInitials: 'RJ', status: 'present' },
  { id: '10', name: 'Kavya Reddy',     rollNo: '1010', avatarInitials: 'KR', status: 'absent'  },
  { id: '11', name: 'Sanjay Gupta',    rollNo: '1011', avatarInitials: 'SG', status: 'present' },
  { id: '12', name: 'Lakshmi Devi',    rollNo: '1012', avatarInitials: 'LD', status: 'present' },
  { id: '13', name: 'Mohan Das',       rollNo: '1013', avatarInitials: 'MD', status: 'present' },
  { id: '14', name: 'Ananya Singh',    rollNo: '1014', avatarInitials: 'AS', status: 'absent'  },
  { id: '15', name: 'Kiran Patel',     rollNo: '1015', avatarInitials: 'KP', status: 'present' },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useAttendanceVM() {
  const [step, setStep] = useState<AttendanceStep>(1);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  const totalCount   = students.length;
  const presentCount = useMemo(() => students.filter((s) => s.status === 'present').length, [students]);
  const absentCount  = useMemo(() => students.filter((s) => s.status === 'absent').length,  [students]);

  const presentStudents = useMemo(() => students.filter((s) => s.status === 'present'), [students]);
  const absentStudents  = useMemo(() => students.filter((s) => s.status === 'absent'),  [students]);

  function mark(id: string, status: AttendanceStatus) {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  }

  function markAllPresent() {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  }

  function goToReview() { setStep(2); }
  function goBackToMark() { setStep(1); }
  function submitAttendance() { setStep(4); }

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
  };
}
