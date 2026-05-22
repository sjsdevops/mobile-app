import { useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExamStatus = 'in-progress' | 'not-started' | 'submitted' | 'verified';
export type ExamFilter = 'all' | 'pending' | 'submitted' | 'verified';
export type ExamView   = 'list' | 'enter' | 'preview' | 'done';

export type ExamItem = {
  id: string;
  name: string;
  className: string;   // e.g. '10-A'
  section: string;     // e.g. 'A'
  studentCount: number;
  maxMarks: number;
  status: ExamStatus;
  gradedCount: number; // pre-existing graded count (for list UI)
};

export type ExamStudent = {
  id: string;
  name: string;
  rollNo: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EXAMS: ExamItem[] = [
  {
    id: '1',
    name: 'Unit Test - Mathematics',
    className: '10-A',
    section: 'A',
    studentCount: 32,
    maxMarks: 100,
    status: 'in-progress',
    gradedCount: 12,
  },
  {
    id: '2',
    name: 'Unit Test - Mathematics',
    className: '10-C',
    section: 'C',
    studentCount: 32,
    maxMarks: 100,
    status: 'not-started',
    gradedCount: 0,
  },
  {
    id: '3',
    name: 'Unit Test - Mathematics',
    className: '10-C',
    section: 'C',
    studentCount: 32,
    maxMarks: 100,
    status: 'submitted',
    gradedCount: 32,
  },
  {
    id: '4',
    name: 'Unit Test - Mathematics',
    className: '10-C',
    section: 'C',
    studentCount: 32,
    maxMarks: 100,
    status: 'verified',
    gradedCount: 32,
  },
];

export const MOCK_STUDENTS: ExamStudent[] = [
  { id: '1',  name: 'Rajesh Sharma', rollNo: '001' },
  { id: '2',  name: 'Sneha Patel',   rollNo: '002' },
  { id: '3',  name: 'Amit Verma',    rollNo: '003' },
  { id: '4',  name: 'Priya Singh',   rollNo: '004' },
  { id: '5',  name: 'Ravi Kumar',    rollNo: '005' },
  { id: '6',  name: 'Arjun Mehta',   rollNo: '006' },
  { id: '7',  name: 'Riya Sharma',   rollNo: '007' },
  { id: '8',  name: 'Kavya Reddy',   rollNo: '008' },
  { id: '9',  name: 'Rahul Joshi',   rollNo: '009' },
  { id: '10', name: 'Meena Suresh',  rollNo: '010' },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useExamVM() {
  const [view,          setView]          = useState<ExamView>('list');
  const [activeFilter,  setActiveFilter]  = useState<ExamFilter>('all');
  const [selectedExam,  setSelectedExam]  = useState<ExamItem | null>(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [marks,         setMarksState]    = useState<Record<string, string>>({
    '1': '77',
    '2': '85',
    '3': '92',
  });
  const [comments,      setCommentsState] = useState<Record<string, string>>({});

  const students = MOCK_STUDENTS;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNo.includes(q),
    );
  }, [students, searchQuery]);

  const gradedStudents = useMemo(
    () => students.filter((s) => marks[s.id] !== undefined && marks[s.id] !== ''),
    [students, marks],
  );

  const pendingStudents = useMemo(
    () => students.filter((s) => !marks[s.id] || marks[s.id] === ''),
    [students, marks],
  );

  const avgMark = useMemo(() => {
    if (gradedStudents.length === 0) return 0;
    const sum = gradedStudents.reduce((acc, s) => acc + Number(marks[s.id] ?? 0), 0);
    return Math.round((sum / gradedStudents.length) * 10) / 10;
  }, [gradedStudents, marks]);

  const filteredExams = useMemo(() => {
    switch (activeFilter) {
      case 'pending':   return MOCK_EXAMS.filter((e) => e.status === 'in-progress' || e.status === 'not-started');
      case 'submitted': return MOCK_EXAMS.filter((e) => e.status === 'submitted');
      case 'verified':  return MOCK_EXAMS.filter((e) => e.status === 'verified');
      default:          return MOCK_EXAMS;
    }
  }, [activeFilter]);

  function setMark(studentId: string, value: string) {
    setMarksState((prev) => ({ ...prev, [studentId]: value }));
  }

  function setComment(studentId: string, value: string) {
    setCommentsState((prev) => ({ ...prev, [studentId]: value }));
  }

  function openExam(exam: ExamItem) {
    setSelectedExam(exam);
    setSearchQuery('');
    setView('enter');
  }

  function goToPreview() {
    setSearchQuery('');
    setView('preview');
  }

  function goBackToEnter() {
    setSearchQuery('');
    setView('enter');
  }

  function submitMarks() {
    setView('done');
  }

  function goBackToList() {
    setView('list');
    setSelectedExam(null);
    setSearchQuery('');
  }

  return {
    view,
    activeFilter,
    setActiveFilter,
    selectedExam,
    searchQuery,
    setSearchQuery,
    students,
    filteredStudents,
    gradedStudents,
    pendingStudents,
    avgMark,
    marks,
    comments,
    filteredExams,
    setMark,
    setComment,
    openExam,
    goToPreview,
    goBackToEnter,
    submitMarks,
    goBackToList,
  };
}
