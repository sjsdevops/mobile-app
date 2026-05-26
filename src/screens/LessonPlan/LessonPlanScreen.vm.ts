import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  getLessons,
  getAssignedSubjects,
  getAcademicYears,
  updateLesson,
  type LessonItem,
  type AssignedClass,
  type AcademicYear,
} from '../../services/lessonPlanService';
import { getAllClasses, type ClassItem } from '../../services/classService';

export type FilterTab = 'all' | 'pending' | 'completed';

export type Chapter = {
  id: string;
  name: string;
  status: 'completed' | 'inprogress' | 'notstarted';
  completionPercentage: number;
  startDate: string;
  endDate: string;
  topicCount: number;
  lessonsCount: number;
};

export type SubjectProgress = {
  id: string;
  name: string;
  completedLessons: number;
  pendingLessons: number;
  syllabusPercentage: number;
  chapters: Chapter[];
};

export type DropdownOption = { id: string; label: string };

function mapStatus(status: string): 'completed' | 'inprogress' | 'notstarted' {
  if (status === 'completed') return 'completed';
  if (status === 'on_pending') return 'inprogress';
  return 'notstarted';
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return '-';
  const s = new Date(start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  return `${s} - ${e}`;
}

export function useLessonPlanVM() {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState<string>('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [allClassesData, setAllClassesData] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshLessons = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [assignedData, yearsData, classesData] = await Promise.all([
          getAssignedSubjects(user.id, user.id),
          getAcademicYears(),
          getAllClasses(user.id),
        ]);
        setAssignedClasses(assignedData.classes ?? []);
        setAcademicYears(yearsData);
        setAllClassesData(classesData);
        if (yearsData.length > 0) setAcademicYear(yearsData[0].academic_year_id);
        if (assignedData.classes?.length > 0) setSelectedClass(assignedData.classes[0].class_id);
      } catch (err) {
        console.error('[LessonPlan] Failed to fetch data:', err);
      }
    })();
  }, [user]);

  // Dropdown options
  const classes: DropdownOption[] = useMemo(() =>
    assignedClasses.map((c) => ({ id: c.class_id, label: c.class_name })),
    [assignedClasses]
  );

  const sections: DropdownOption[] = useMemo(() => {
    const cls = assignedClasses.find((c) => c.class_id === selectedClass);
    return (cls?.sections ?? []).map((s) => ({ id: s.section_id, label: s.section_name }));
  }, [assignedClasses, selectedClass]);

  const subjects: DropdownOption[] = useMemo(() => {
    const cls = assignedClasses.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    return (sec?.subjects ?? []).map((s) => ({ id: s.subject_id, label: s.subject_name }));
  }, [assignedClasses, selectedClass, selectedSection]);

  // Auto-select
  useEffect(() => {
    if (sections.length > 0 && !sections.find((s) => s.id === selectedSection))
      setSelectedSection(sections[0].id);
  }, [sections]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.find((s) => s.id === selectedSubject))
      setSelectedSubject(subjects[0].id);
  }, [subjects]);

  // Fetch lessons
  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedSubject || !user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLessons({
          classId: selectedClass,
          sectionId: selectedSection,
          subjectId: selectedSubject,
        });
        setLessons(data);
      } catch {
        setError('Failed to load lesson plans');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass, selectedSection, selectedSubject, user, refreshKey]);

  // Check if logged-in user is class teacher for the selected section
  const isClassTeacher = useMemo(() => {
    if (!user || !selectedClass || !selectedSection) return false;
    const cls = allClassesData.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    if (!sec) return false;
    return sec.class_teacher?.employee_id === user.id;
  }, [user, selectedClass, selectedSection, allClassesData]);

  // Check if logged-in user is coordinator for the selected section
  const isCoordinator = useMemo(() => {
    if (!user || !selectedClass || !selectedSection) return false;
    const cls = allClassesData.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    if (!sec) return false;
    return sec.coordinator?.employee_id === user.id;
  }, [user, selectedClass, selectedSection, allClassesData]);

  // Can add lesson: only if class teacher
  const canAddLesson = isClassTeacher;

  // Can approve: if coordinator
  const canApprove = isCoordinator;

  // Can complete: if class teacher
  const canComplete = isClassTeacher;

  // Approve a lesson (coordinator action)
  const approveLesson = useCallback(async (lessonId: string) => {
    try {
      await updateLesson(lessonId, { status: 'approved' });
      Alert.alert('Success', 'Lesson plan approved');
      refreshLessons();
    } catch (err) {
      console.error('[LessonPlan] Approve error:', err);
      Alert.alert('Error', 'Failed to approve lesson plan');
    }
  }, [refreshLessons]);

  // Complete a lesson (class teacher action)
  const completeLesson = useCallback(async (lessonId: string) => {
    try {
      await updateLesson(lessonId, { status: 'completed' });
      Alert.alert('Success', 'Lesson plan marked as completed');
      refreshLessons();
    } catch (err) {
      console.error('[LessonPlan] Complete error:', err);
      Alert.alert('Error', 'Failed to complete lesson plan');
    }
  }, [refreshLessons]);

  // Build subject progress
  const subjectProgress: SubjectProgress | null = useMemo(() => {
    if (lessons.length === 0) return null;
    const subjectName = subjects.find((s) => s.id === selectedSubject)?.label ?? 'Subject';
    const completed = lessons.filter((l) => l.status === 'completed').length;
    const pending = lessons.filter((l) => l.status !== 'completed').length;
    const percentage = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

    const chapters: Chapter[] = lessons.map((l, idx) => ({
      id: l.lesson_id,
      name: l.chapter_name || l.topic_name || `Lesson ${idx + 1}`,
      status: mapStatus(l.status),
      completionPercentage: l.status === 'completed' ? 100 : l.status === 'on_pending' ? 50 : 0,
      startDate: formatDateRange(l.start_date, l.end_date),
      endDate: l.end_date ?? '',
      topicCount: 1,
      lessonsCount: 1,
    }));

    return { id: selectedSubject, name: subjectName, completedLessons: completed, pendingLessons: pending, syllabusPercentage: percentage, chapters };
  }, [lessons, selectedSubject, subjects]);

  const hasData = lessons.length > 0;

  const getFilteredChapters = () => {
    if (!subjectProgress) return [];
    return subjectProgress.chapters.filter((ch) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'completed') return ch.status === 'completed';
      if (filterTab === 'pending') return ch.status !== 'completed';
      return true;
    });
  };

  const academicYearOptions: DropdownOption[] = useMemo(() =>
    academicYears.map((ay) => ({ id: ay.academic_year_id, label: ay.year })),
    [academicYears]
  );

  return {
    academicYear,
    setAcademicYear,
    academicYearOptions,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedSubject,
    setSelectedSubject,
    filterTab,
    setFilterTab,
    loading,
    error,
    hasData,
    classes,
    sections,
    subjects,
    subjectProgress,
    getFilteredChapters,
    refreshLessons,
    canAddLesson,
    canApprove,
    canComplete,
    approveLesson,
    completeLesson,
  };
}
