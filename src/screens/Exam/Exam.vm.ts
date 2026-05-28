import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTeacherExams,
  bulkSaveMarks,
  type ExamSubjectEntry,
  type ExamStudentMark,
} from '../../services/examService';
import { getAllClasses } from '../../services/classService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExamStatus = 'in-progress' | 'not-started' | 'submitted' | 'verified';
export type ExamFilter = 'all' | 'pending' | 'submitted' | 'verified';
export type ExamView = 'list' | 'enter' | 'preview' | 'done';

export type ExamItem = {
  id: string;              // exam_subject_id
  name: string;            // exam_name + subject_name
  className: string;       // "Class 1 - Yamuna"
  section: string;
  studentCount: number;
  maxMarks: number;
  passingMarks: number;
  status: ExamStatus;
  gradedCount: number;
  examSubjectId: string;
  students: ExamStudentMark[];
};

export type ExamStudent = {
  id: string;
  name: string;
  rollNo: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveExamStatus(students: ExamStudentMark[]): ExamStatus {
  if (students.length === 0) return 'not-started';

  const allVerified = students.every((s) => s.status === 'verified');
  if (allVerified) return 'verified';

  const allSubmittedOrVerified = students.every((s) => s.status === 'submitted' || s.status === 'verified');
  const allHaveMarks = students.every((s) => s.obtained_marks !== null);

  // Only mark as "submitted" if all students have status submitted AND all have marks entered
  if (allSubmittedOrVerified && allHaveMarks) return 'submitted';

  // If all statuses are null → not started
  const allNull = students.every((s) => s.status === null && s.obtained_marks === null);
  if (allNull) return 'not-started';

  // Otherwise it's in-progress (some have marks, some don't)
  return 'in-progress';
}

function calculateGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useExamVM() {
  const { user } = useAuth();
  const [view, setView] = useState<ExamView>('list');
  const [activeFilter, setActiveFilter] = useState<ExamFilter>('all');
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marks, setMarksState] = useState<Record<string, string>>({});
  const [comments, setCommentsState] = useState<Record<string, string>>({});
  const [allExams, setAllExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCoordinatorForSection, setIsCoordinatorForSection] = useState(false);

  // Fetch teacher exams from API
  const fetchExams = async () => {
    if (!user || user.role === 'student') {
      console.log('[Exam] Skip fetch - no user or student role');
      return;
    }
    console.log('[Exam] Fetching exams for:', user.id);
    setLoading(true);
    try {
      const data = await getTeacherExams(user.id);
      const items: ExamItem[] = [];

      for (const cls of data.classes ?? []) {
        for (const section of cls.sections ?? []) {
          for (const subject of section.subjects ?? []) {
            const status = deriveExamStatus(subject.students);
            const gradedCount = subject.students.filter((s) => s.obtained_marks !== null).length;

            items.push({
              id: subject.exam_subject_id,
              name: `${subject.exam_name} - ${subject.subject_name}`,
              className: `${cls.class_name} - ${section.section_name}`,
              section: section.section_name,
              studentCount: subject.students.length,
              maxMarks: subject.total_marks,
              passingMarks: subject.passing_marks,
              status,
              gradedCount,
              examSubjectId: subject.exam_subject_id,
              students: subject.students,
            });
          }
        }
      }

      setAllExams(items);
    } catch (error) {
      console.error('[Exam] Failed to fetch exams:', error);
      setAllExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  // Students for the selected exam
  const students: ExamStudent[] = useMemo(() => {
    if (!selectedExam) return [];
    return selectedExam.students.map((s, i) => ({
      id: s.student_id,
      name: s.student_name,
      rollNo: String(i + 1).padStart(3, '0'),
    }));
  }, [selectedExam]);

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
      case 'pending': return allExams.filter((e) => e.status === 'in-progress' || e.status === 'not-started');
      case 'submitted': return allExams.filter((e) => e.status === 'submitted');
      case 'verified': return allExams.filter((e) => e.status === 'verified');
      default: return allExams;
    }
  }, [activeFilter, allExams]);

  function setMark(studentId: string, value: string) {
    setMarksState((prev) => ({ ...prev, [studentId]: value }));
  }

  function setComment(studentId: string, value: string) {
    setCommentsState((prev) => ({ ...prev, [studentId]: value }));
  }

  function openExam(exam: ExamItem) {
    setSelectedExam(exam);
    setSearchQuery('');

    // Pre-fill marks and comments from existing data
    const existingMarks: Record<string, string> = {};
    const existingComments: Record<string, string> = {};
    for (const s of exam.students) {
      if (s.obtained_marks !== null) {
        existingMarks[s.student_id] = String(s.obtained_marks);
      }
      if (s.remarks) {
        existingComments[s.student_id] = s.remarks;
      }
    }
    setMarksState(existingMarks);
    setCommentsState(existingComments);

    // Check coordinator status for this exam's section
    checkCoordinatorStatus(exam.className);

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

  async function submitMarks() {
    if (!selectedExam || !user) return;

    setSubmitting(true);
    try {
      const markEntries = students.map((s) => {
        const obtainedStr = marks[s.id];
        const obtained = obtainedStr && obtainedStr.trim() !== '' ? Number(obtainedStr) : null;
        const grade = obtained !== null
          ? calculateGrade(obtained, selectedExam.maxMarks)
          : null;

        return {
          student_id: s.id,
          obtained_marks: obtained,
          grade,
          remarks: comments[s.id] || null,
          status: 'submitted',
        };
      });

      await bulkSaveMarks({
        exam_subject_id: selectedExam.examSubjectId,
        marks: markEntries,
        created_by: user.id,
        modified_by: user.id,
      });

      setView('done');
    } catch (error) {
      console.error('[Exam] Failed to submit marks:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function goBackToList() {
    setView('list');
    setSelectedExam(null);
    setSearchQuery('');
    setMarksState({});
    setCommentsState({});
    setIsCoordinatorForSection(false);
    console.log('[Exam] Refreshing exams list...');
    fetchExams();
  }

  // Check if user is coordinator when opening an exam
  async function checkCoordinatorStatus(examClassName: string) {
    if (!user) return;
    try {
      const classes = await getAllClasses(user.id);
      // examClassName is like "Class X - Yamuna"
      const parts = examClassName.split(' - ');
      const className = parts[0]?.trim();
      const sectionName = parts[1]?.trim();
      for (const cls of classes) {
        if (cls.class_name === className) {
          for (const sec of cls.sections) {
            if (sec.section_name === sectionName) {
              setIsCoordinatorForSection(sec.coordinator?.employee_id === user.id);
              return;
            }
          }
        }
      }
    } catch { }
    setIsCoordinatorForSection(false);
  }

  // Approve marks (coordinator action) — same API with status: 'verified'
  async function approveMarks() {
    if (!selectedExam || !user) return;
    setSubmitting(true);
    try {
      const markEntries = students.map((s) => {
        const obtainedStr = marks[s.id];
        const obtained = obtainedStr && obtainedStr.trim() !== '' ? Number(obtainedStr) : null;
        const grade = obtained !== null
          ? calculateGrade(obtained, selectedExam.maxMarks)
          : null;

        return {
          student_id: s.id,
          obtained_marks: obtained,
          grade,
          remarks: comments[s.id] || null,
          status: 'verified',
        };
      });

      await bulkSaveMarks({
        exam_subject_id: selectedExam.examSubjectId,
        marks: markEntries,
        created_by: user.id,
        modified_by: user.id,
      });

      setView('done');
    } catch (error) {
      console.error('[Exam] Failed to approve marks:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // Can approve: coordinator + all students have submitted status with marks
  const canApproveMarks = useMemo(() => {
    if (!isCoordinatorForSection || !selectedExam) return false;
    // All students must have status 'submitted' and obtained_marks not null
    return selectedExam.students.length > 0 &&
      selectedExam.students.every((s) => s.status === 'submitted' && s.obtained_marks !== null);
  }, [isCoordinatorForSection, selectedExam]);

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
    approveMarks,
    canApproveMarks,
    goBackToList,
    loading,
    submitting,
  };
}
