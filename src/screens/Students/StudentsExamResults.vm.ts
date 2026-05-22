import { useState, useEffect } from 'react';

export interface ExamSubject {
  subject: string;
  max: number;
  obtained: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  title: string;
  subtitle: string;
  scoreLabel: string;
  attendancePercentage: number;
  attendanceDays: number;
  attendanceTotal: number;
  subjects: ExamSubject[];
  remarks: string;
  academicPerformance: {
    [key: string]: number;
  };
}

export interface ExamSection {
  id: string;
  title: string;
  tests: ExamResult[];
  overall: ExamResult;
}

interface StudentExamVM {
  studentId: string;
  examSections: ExamSection[];
  loading: boolean;
}

export function useStudentsExamResultsVM(studentId: string | undefined): StudentExamVM {
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    const baseSubjects: ExamSubject[] = [
      { subject: 'English', max: 50, obtained: 45, grade: 'A+' },
      { subject: 'Science', max: 50, obtained: 42, grade: 'A' },
      { subject: 'Tamil', max: 50, obtained: 40, grade: 'B+' },
      { subject: 'Social', max: 50, obtained: 38, grade: 'A' },
      { subject: 'Maths', max: 50, obtained: 44, grade: 'B' },
    ];

    const mockSections: ExamSection[] = [
      {
        id: 'quarterly',
        title: 'Quarterly Exam',
        tests: [
          {
            id: 'quarterly-unit-1',
            title: 'Unit Test - 1',
            subtitle: 'Algebraic, Geometry...',
            scoreLabel: '48/50',
            attendancePercentage: 27.4,
            attendanceDays: 100,
            attendanceTotal: 365,
            subjects: baseSubjects,
            remarks: 'An outstanding student who consistently performs at a high level. Keep up the excellent work!',
            academicPerformance: {
              Tamil: 80,
              Maths: 88,
              English: 90,
              Science: 84,
              Social: 76,
            },
          },
          {
            id: 'quarterly-unit-2',
            title: 'Unit Test - 2',
            subtitle: 'Calculus, Statistics...',
            scoreLabel: '45/50',
            attendancePercentage: 29.0,
            attendanceDays: 105,
            attendanceTotal: 365,
            subjects: baseSubjects,
            remarks: 'Very sincere, disciplined, and hardworking. Maintain the same enthusiasm.',
            academicPerformance: {
              Tamil: 78,
              Maths: 85,
              English: 88,
              Science: 82,
              Social: 74,
            },
          },
        ],
        overall: {
          id: 'quarterly-overall',
          title: 'Quarterly',
          subtitle: 'Total Marks',
          scoreLabel: '93/100',
          attendancePercentage: 26.5,
          attendanceDays: 99,
          attendanceTotal: 365,
          subjects: baseSubjects,
          remarks: 'Very sincere, disciplined, and hardworking. Maintain the same enthusiasm.',
          academicPerformance: {
            Tamil: 79,
            Maths: 86,
            English: 89,
            Science: 83,
            Social: 75,
          },
        },
      },
      {
        id: 'half-yearly',
        title: 'Half-Yearly Exam',
        tests: [
          {
            id: 'half-yearly-unit-1',
            title: 'Unit Test - 1',
            subtitle: 'Algebraic, Geometry...',
            scoreLabel: '48/50',
            attendancePercentage: 27.4,
            attendanceDays: 100,
            attendanceTotal: 365,
            subjects: baseSubjects,
            remarks: 'An outstanding student who consistently performs at a high level. Keep up the excellent work!',
            academicPerformance: {
              Tamil: 80,
              Maths: 88,
              English: 90,
              Science: 84,
              Social: 76,
            },
          },
          {
            id: 'half-yearly-unit-2',
            title: 'Unit Test - 2',
            subtitle: 'Calculus, Statistics...',
            scoreLabel: '45/50',
            attendancePercentage: 29.0,
            attendanceDays: 105,
            attendanceTotal: 365,
            subjects: baseSubjects,
            remarks: 'Very sincere, disciplined, and hardworking. Maintain the same enthusiasm.',
            academicPerformance: {
              Tamil: 78,
              Maths: 85,
              English: 88,
              Science: 82,
              Social: 74,
            },
          },
        ],
        overall: {
          id: 'half-yearly-overall',
          title: 'Half-Yearly',
          subtitle: 'Total Marks',
          scoreLabel: '93/100',
          attendancePercentage: 26.5,
          attendanceDays: 99,
          attendanceTotal: 365,
          subjects: baseSubjects,
          remarks: 'Very sincere, disciplined, and hardworking. Maintain the same enthusiasm.',
          academicPerformance: {
            Tamil: 79,
            Maths: 86,
            English: 89,
            Science: 83,
            Social: 75,
          },
        },
      },
    ];

    setExamSections(mockSections);
    setLoading(false);
  }, [studentId]);

  return {
    studentId: studentId || '',
    examSections,
    loading,
  };
}
