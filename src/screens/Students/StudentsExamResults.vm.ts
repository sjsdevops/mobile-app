import { useState, useEffect } from 'react';
import { getStudentProfile } from '../../services/profileService';

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
  academicPerformance: { [key: string]: number };
}

export interface ExamSection {
  id: string;
  title: string;
  tests: ExamResult[];
  overall: ExamResult;
}

export function useStudentsExamResultsVM(studentId: string | undefined) {
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentClass, setStudentClass] = useState('');

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const profile = await getStudentProfile(studentId);

        setStudentName(`${profile.first_name} ${profile.last_name}`.trim());
        setStudentRoll(profile.academic_info?.roll_no ?? '-');
        setStudentClass(
          profile.academic_info
            ? `${profile.academic_info.class_name} - ${profile.academic_info.section_name}`
            : '-'
        );

        // Map exam_results from API to ExamSection format
        const sections: ExamSection[] = [];

        if ((profile as any).exam_results) {
          const examResults = (profile as any).exam_results as Array<{
            exam_id: string;
            exam_name: string;
            exam_type: string;
            marks: Array<{
              mark_id: string;
              exam_subject_id: string;
              subject_name: string;
              subject_code: string;
              exam_date: string | null;
              obtained_marks: number | null;
              grade: string | null;
              remarks: string | null;
              status: string | null;
              total_marks: number;
              passing_marks: number;
            }>;
          }>;

          for (const exam of examResults) {
            const subjects: ExamSubject[] = exam.marks.map((m) => ({
              subject: m.subject_name,
              max: m.total_marks,
              obtained: m.obtained_marks ?? 0,
              grade: m.grade ?? '-',
            }));

            const totalMax = subjects.reduce((sum, s) => sum + s.max, 0);
            const totalObtained = subjects.reduce((sum, s) => sum + s.obtained, 0);
            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

            const performanceMap: { [key: string]: number } = {};
            for (const s of subjects) {
              performanceMap[s.subject] = s.max > 0 ? (s.obtained / s.max) * 100 : 0;
            }

            const examResult: ExamResult = {
              id: exam.exam_id,
              title: exam.exam_name,
              subtitle: exam.exam_type,
              scoreLabel: `${totalObtained}/${totalMax}`,
              attendancePercentage: profile.attendance_percentage ?? 0,
              attendanceDays: 0,
              attendanceTotal: 0,
              subjects,
              remarks: exam.marks.find((m) => m.remarks)?.remarks ?? '',
              academicPerformance: performanceMap,
            };

            // Each exam becomes a section with only the overall card
            sections.push({
              id: exam.exam_id,
              title: exam.exam_name,
              tests: [],
              overall: {
                ...examResult,
                id: `${exam.exam_id}-overall`,
                title: exam.exam_name,
                subtitle: 'Total Marks',
                scoreLabel: `${totalObtained}/${totalMax}`,
              },
            });
          }
        }

        setExamSections(sections);
      } catch (error) {
        console.error('[ExamResults] Failed to fetch:', error);
        setExamSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId]);

  return {
    studentId: studentId || '',
    examSections,
    loading,
    studentName,
    studentRoll,
    studentClass,
  };
}
