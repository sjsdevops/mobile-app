import { useState, useEffect } from 'react';
import { api } from '../../services/api';

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

export type DropdownOption = {
  id: string;
  label: string;
};

export function useLessonPlanVM() {
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(true);

  // Options for dropdowns
  const [classes, setClasses] = useState<DropdownOption[]>([
    { id: 'class5', label: 'Class 5' },
    { id: 'class6', label: 'Class 6' },
    { id: 'class7', label: 'Class 7' },
  ]);

  const [sections, setSections] = useState<DropdownOption[]>([
    { id: 'sectiona', label: 'Section A' },
    { id: 'sectionb', label: 'Section B' },
  ]);

  const [subjects, setSubjects] = useState<DropdownOption[]>([
    { id: 'mathematics', label: 'Mathematics' },
    { id: 'english', label: 'English' },
    { id: 'science', label: 'Science' },
  ]);

  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress | null>(null);

  // Initialize default selections
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects]);

  // Fetch lesson plan data when filters change
  useEffect(() => {
    if (selectedClass && selectedSection && selectedSubject) {
      fetchLessonPlanData();
    }
  }, [selectedClass, selectedSection, selectedSubject]);

  async function fetchLessonPlanData() {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API call
      const mockData: SubjectProgress = {
        id: selectedSubject,
        name: subjects.find(s => s.id === selectedSubject)?.label || 'Mathematics',
        completedLessons: 6,
        pendingLessons: 4,
        syllabusPercentage: 60,
        chapters: [
          {
            id: '1',
            name: 'Number Systems',
            status: 'completed',
            completionPercentage: 100,
            startDate: 'Sep 1 - Sep 15',
            endDate: '',
            topicCount: 5,
            lessonsCount: 10,
          },
          {
            id: '2',
            name: 'Algebra Basics',
            status: 'inprogress',
            completionPercentage: 45,
            startDate: 'Oct 01 - 05',
            endDate: '',
            topicCount: 4,
            lessonsCount: 8,
          },
          {
            id: '3',
            name: 'Geometry Fundamentals',
            status: 'notstarted',
            completionPercentage: 0,
            startDate: 'Oct 06 - 10',
            endDate: '',
            topicCount: 6,
            lessonsCount: 12,
          },
          {
            id: '4',
            name: 'Calculus Introduction',
            status: 'notstarted',
            completionPercentage: 10,
            startDate: 'Oct 11 - 15',
            endDate: '',
            topicCount: 5,
            lessonsCount: 10,
          },
        ],
      };

      setSubjectProgress(mockData);
      setHasData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson plans');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }

  const getFilteredChapters = () => {
    if (!subjectProgress) return [];

    return subjectProgress.chapters.filter(chapter => {
      if (filterTab === 'all') return true;
      if (filterTab === 'completed') return chapter.status === 'completed';
      if (filterTab === 'pending') return chapter.status !== 'completed';
      return true;
    });
  };

  return {
    academicYear,
    setAcademicYear,
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
  };
}
