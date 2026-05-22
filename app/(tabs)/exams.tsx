"use client";

import { ExamScreen } from '../../src/screens/Exam/Exam';
import { StudentsExamResultsScreen } from '../../src/screens/Students/StudentsExamResults';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ExamsTab() {
  const { user } = useAuth();
  return user?.role === 'student' ? <StudentsExamResultsScreen /> : <ExamScreen />;
}
