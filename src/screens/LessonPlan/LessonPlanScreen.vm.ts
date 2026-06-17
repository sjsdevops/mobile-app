import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
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
export type Chapter = { id: string; name: string; status: 'completed' | 'inprogress' | 'notstarted'; completionPercentage: number; startDate: string; endDate: string; topicCount: number; lessonsCount: number };
export type SubjectProgress = { id: string; name: string; completedLessons: number; pendingLessons: number; syllabusPercentage: number; chapters: Chapter[] };
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
  const [academicYear, setAcademicYear] = useState('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [allClassesData, setAllClassesData] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshLessons = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;
    const isStudent = user.role === 'student';

    (async () => {
      try {
        if (isStudent) {
          // Student: get profile for class/section, then get subjects, then fetch lessons
          const profileResp = await api.get(`/mobile/student/${user.id}/profile`);
          const profile = profileResp.data?.data ?? profileResp.data;
          const classId = profile.academic_info?.class_id;
          const sectionId = profile.academic_info?.section_id;
          const className = profile.academic_info?.class_name ?? '';
          const sectionName = profile.academic_info?.section_name ?? '';

          if (classId && sectionId) {
            setSelectedClass(classId);
            setSelectedSection(sectionId);

            // Get subjects for this class/section
            const subjectsResp = await api.get(`/acadamics/users/${user.id}/subjects?class_id=${classId}`);
            const subjectsData = subjectsResp.data?.data ?? subjectsResp.data;
            const subjectItems = subjectsData?.items ?? subjectsData ?? [];
            const sectionSubjects = subjectItems
              .filter((s: any) => s.section?.section_id === sectionId)
              .map((s: any) => ({
                section_subject_id: s.section_subject_id,
                subject_id: s.subject_id,
                subject_name: s.subject_name,
                subject_code: s.subject_code ?? '',
                subject_type: s.subject_type ?? 'Core',
              }));

            setAssignedClasses([{
              class_id: classId, class_name: className, class_type: '',
              sections: [{ section_id: sectionId, section_name: sectionName, subjects: sectionSubjects }],
            }]);
            if (sectionSubjects.length > 0) setSelectedSubject(sectionSubjects[0].subject_id);

            // Fetch lessons for this section
            const lessonsResp = await api.get(`/mobile/lessons/class/${classId}/section/${sectionId}`);
            const lessonsData = lessonsResp.data?.data ?? lessonsResp.data;
            setLessons(lessonsData?.items ?? []);
          }

          const yearsData = await getAcademicYears();
          setAcademicYears(yearsData);
          if (yearsData.length > 0) setAcademicYear(yearsData[0].academic_year_id);
        } else {
          // Teacher/Coordinator
          const [yearsData, classesData, assignedData] = await Promise.all([
            getAcademicYears(),
            getAllClasses(user.id),
            getAssignedSubjects(user.id, user.id),
          ]);
          setAcademicYears(yearsData);
          setAllClassesData(classesData);
          if (yearsData.length > 0) setAcademicYear(yearsData[0].academic_year_id);

          const isCoordinatorRole = user.role?.toLowerCase().includes('coordinator') ||
            user.role?.toLowerCase().includes('oridinator');

          if (isCoordinatorRole) {
            // For coordinator: filter all classes down to sections where they are the coordinator,
            // then fetch subjects for each of those sections.
            const coordinatorClasses: AssignedClass[] = [];

            for (const cls of classesData) {
              const coordinatorSections = cls.sections.filter(
                (sec) => sec.coordinator?.employee_id === user.id
              );
              if (coordinatorSections.length === 0) continue;

              // Fetch subjects for this class
              let subjectItems: any[] = [];
              try {
                const subjectsResp = await api.get(
                  `/acadamics/users/${user.id}/subjects?class_id=${cls.class_id}`
                );
                const subjectsData = subjectsResp.data?.data ?? subjectsResp.data;
                subjectItems = subjectsData?.items ?? subjectsData ?? [];
              } catch {
                // subjects fetch failed for this class — continue with empty subjects
              }

              const sections = coordinatorSections.map((sec) => {
                const sectionSubjects = subjectItems
                  .filter((s: any) => s.section?.section_id === sec.section_id)
                  .map((s: any) => ({
                    section_subject_id: s.section_subject_id,
                    subject_id: s.subject_id,
                    subject_name: s.subject_name,
                    subject_code: s.subject_code ?? '',
                    subject_type: s.subject_type ?? 'Core',
                  }));

                return {
                  section_id: sec.section_id,
                  section_name: sec.section_name,
                  subjects: sectionSubjects,
                };
              });

              coordinatorClasses.push({
                class_id: cls.class_id,
                class_name: cls.class_name,
                class_type: cls.class_type,
                sections,
              });
            }

            setAssignedClasses(coordinatorClasses);
            if (coordinatorClasses.length > 0) setSelectedClass(coordinatorClasses[0].class_id);
          } else {
            // Teacher: use assigned subjects API as before
            setAssignedClasses(assignedData.classes ?? []);
            if (assignedData.classes?.length > 0) setSelectedClass(assignedData.classes[0].class_id);
          }
        }
      } catch (err) {
        console.error('[LessonPlan] Failed to fetch data:', err);
      }
    })();
  }, [user]);

  // Dropdown options
  const classes: DropdownOption[] = useMemo(() => assignedClasses.map((c) => ({ id: c.class_id, label: c.class_name })), [assignedClasses]);
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
  useEffect(() => { if (sections.length > 0 && !sections.find((s) => s.id === selectedSection)) setSelectedSection(sections[0].id); }, [sections]);
  useEffect(() => { if (subjects.length > 0 && !subjects.find((s) => s.id === selectedSubject)) setSelectedSubject(subjects[0].id); }, [subjects]);

  // Fetch lessons for teachers (students already loaded on mount)
  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedSubject || !user) return;
    if (user.role === 'student') return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLessons({ classId: selectedClass, sectionId: selectedSection, subjectId: selectedSubject });
        setLessons(data);
      } catch {
        setError('Failed to load lesson plans');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass, selectedSection, selectedSubject, user, refreshKey]);

  // Permission checks
  const isSubjectTeacher = useMemo(() => {
    if (!user || !selectedClass || !selectedSection || !selectedSubject) return false;
    const cls = assignedClasses.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    return (sec?.subjects ?? []).some((s) => s.subject_id === selectedSubject);
  }, [user, selectedClass, selectedSection, selectedSubject, assignedClasses]);

  const isCoordinator = useMemo(() => {
    if (!user || !selectedClass || !selectedSection) return false;
    const cls = allClassesData.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    return sec?.coordinator?.employee_id === user.id;
  }, [user, selectedClass, selectedSection, allClassesData]);

  const canAddLesson = isSubjectTeacher && user?.role !== 'student';
  const canApprove = isCoordinator && user?.role !== 'student';
  const canComplete = isSubjectTeacher && user?.role !== 'student';

  const approveLesson = useCallback(async (lessonId: string) => {
    try { await updateLesson(lessonId, { status: 'approved' }); Alert.alert('Success', 'Lesson plan approved'); refreshLessons(); }
    catch { Alert.alert('Error', 'Failed to approve lesson plan'); }
  }, [refreshLessons]);

  const completeLesson = useCallback(async (lessonId: string) => {
    try { await updateLesson(lessonId, { status: 'completed' }); Alert.alert('Success', 'Lesson plan completed'); refreshLessons(); }
    catch { Alert.alert('Error', 'Failed to complete lesson plan'); }
  }, [refreshLessons]);

  // Build subject progress from lessons filtered by selected subject
  const filteredLessons = useMemo(() => {
    if (!selectedSubject) return lessons;
    return lessons.filter((l) => l.subject_id === selectedSubject);
  }, [lessons, selectedSubject]);

  const subjectProgress: SubjectProgress | null = useMemo(() => {
    if (filteredLessons.length === 0) return null;
    const subjectName = subjects.find((s) => s.id === selectedSubject)?.label ?? 'Subject';
    const completed = filteredLessons.filter((l) => l.status === 'completed').length;
    const pending = filteredLessons.filter((l) => l.status !== 'completed').length;
    const percentage = filteredLessons.length > 0 ? Math.round((completed / filteredLessons.length) * 100) : 0;
    const chapters: Chapter[] = filteredLessons.map((l, idx) => ({
      id: l.lesson_id, name: l.chapter_name || l.topic_name || `Lesson ${idx + 1}`,
      status: mapStatus(l.status), completionPercentage: l.status === 'completed' ? 100 : l.status === 'on_pending' ? 50 : 0,
      startDate: formatDateRange(l.start_date, l.end_date), endDate: l.end_date ?? '', topicCount: 1, lessonsCount: 1,
    }));
    return { id: selectedSubject, name: subjectName, completedLessons: completed, pendingLessons: pending, syllabusPercentage: percentage, chapters };
  }, [filteredLessons, selectedSubject, subjects]);

  const hasData = filteredLessons.length > 0;
  const getFilteredChapters = () => {
    if (!subjectProgress) return [];
    return subjectProgress.chapters.filter((ch) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'completed') return ch.status === 'completed';
      if (filterTab === 'pending') return ch.status !== 'completed';
      return true;
    });
  };

  const academicYearOptions: DropdownOption[] = useMemo(() => academicYears.map((ay) => ({ id: ay.academic_year_id, label: ay.year })), [academicYears]);

  return {
    academicYear, setAcademicYear, academicYearOptions,
    selectedClass, setSelectedClass, selectedSection, setSelectedSection, selectedSubject, setSelectedSubject,
    filterTab, setFilterTab, loading, error, hasData, classes, sections, subjects, subjectProgress, getFilteredChapters,
    refreshLessons, canAddLesson, canApprove, canComplete, approveLesson, completeLesson,
  };
}
