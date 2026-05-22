import { useMemo } from 'react';
import { STUDENTS, type Student } from './Students.vm';

export function useStudentInfoVM(studentId: string | undefined) {
  const student = useMemo<Student | undefined>(() => {
    if (!studentId) return undefined;
    return STUDENTS.find((item) => item.id === studentId);
  }, [studentId]);

  return {
    student,
  };
}
