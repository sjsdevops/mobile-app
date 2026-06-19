import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { getAllClasses, type ClassItem } from '../../services/classService';
import { getClassAttendance } from '../../services/attendanceService';

export type StudentStatus = 'present' | 'absent' | 'not_marked';

export type Student = {
  id: string;
  name: string;
  roll: string;
  className: string;
  status: StudentStatus;
};

export interface SectionTab {
  label: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useStudentsVM() {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<SectionTab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch classes and build tabs for sections where user is class teacher
  useEffect(() => {
    if (!user) return;

    const fetchClasses = async () => {
      setLoadingTabs(true);
      try {
        const classes = await getAllClasses(user.id);
        const sectionTabs: SectionTab[] = [];

        for (const cls of classes) {
          for (const section of cls.sections ?? []) {
            if (section.class_teacher?.employee_id === user.id || section.coordinator?.employee_id === user.id) {
              sectionTabs.push({
                label: `${cls.class_name} - ${section.section_name}`,
                classId: cls.class_id,
                sectionId: section.section_id,
                className: cls.class_name,
                sectionName: section.section_name,
              });
            }
          }
        }

        setTabs(sectionTabs);
        if (sectionTabs.length > 0) {
          setActiveTabIndex(0);
        }
      } catch (error) {
        console.error('[Students] Failed to fetch classes:', error);
      } finally {
        setLoadingTabs(false);
      }
    };

    fetchClasses();
  }, [user]);

  // Fetch students + attendance when active tab changes
  useEffect(() => {
    if (!user || tabs.length === 0) return;
    const activeTab = tabs[activeTabIndex];
    if (!activeTab) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        // Get students for this class/section
        const studentsResponse = await api.get(
          `/users/${user.id}/students?class=${activeTab.classId}&section=${activeTab.sectionId}`
        );
        const studentsData = studentsResponse.data?.data ?? studentsResponse.data;
        const studentsList: Array<{
          student_id: string;
          first_name: string;
          last_name: string;
          roll_number?: string;
        }> = studentsData?.items ?? studentsData ?? [];

        // Get today's attendance
        let attendanceMap = new Map<string, { is_present: boolean; is_absent: boolean }>();
        try {
          const attendanceData = await getClassAttendance(
            activeTab.classId,
            activeTab.sectionId,
            getTodayDate()
          );
          if (attendanceData.items && attendanceData.items.length > 0) {
            for (const item of attendanceData.items) {
              attendanceMap.set(item.student_id, {
                is_present: item.is_present,
                is_absent: item.is_absent,
              });
            }
          }
        } catch {
          // No attendance yet
        }

        // Merge
        const merged: Student[] = studentsList.map((s, index) => {
          const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim();
          const record = attendanceMap.get(s.student_id);

          let status: StudentStatus = 'not_marked';
          if (record) {
            if (record.is_present) status = 'present';
            else if (record.is_absent) status = 'absent';
          }

          return {
            id: s.student_id,
            name: fullName || `Student ${index + 1}`,
            roll: s.roll_number || String(index + 1).padStart(2, '0'),
            className: activeTab.label,
            status,
          };
        });

        setStudents(merged);
      } catch (error) {
        console.error('[Students] Failed to fetch students:', error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [user, tabs, activeTabIndex]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.roll.toLowerCase().includes(query),
    );
  }, [students, searchQuery]);

  const totalCount = filteredStudents.length;
  const presentCount = filteredStudents.filter((s) => s.status === 'present').length;
  const absentCount = filteredStudents.filter((s) => s.status === 'absent').length;

  const classes = tabs.map((t) => t.label);
  const activeClass = tabs[activeTabIndex]?.label ?? '';

  function setActiveClass(label: string) {
    const idx = tabs.findIndex((t) => t.label === label);
    if (idx >= 0) setActiveTabIndex(idx);
  }

  return {
    classes,
    activeClass,
    setActiveClass,
    searchQuery,
    setSearchQuery,
    filteredStudents,
    totalCount,
    presentCount,
    absentCount,
    loadingTabs,
    loadingStudents,
  };
}
