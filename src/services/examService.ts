import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExamStudentMark {
    student_id: string;
    student_name: string;
    obtained_marks: number | null;
    grade: string | null;
    remarks: string | null;
    status: 'submitted' | 'pending' | 'verified' | null;
    verification_remarks: string | null;
    mark_id: string | null;
}

export interface ExamSubjectEntry {
    exam_subject_id: string;
    subject_id: string;
    subject_name: string;
    subject_code: string;
    exam_date: string | null;
    exam_id: string;
    exam_name: string;
    exam_type: string;
    total_marks: number;
    passing_marks: number;
    students: ExamStudentMark[];
}

export interface ExamSection {
    section_id: string;
    section_name: string;
    subjects: ExamSubjectEntry[];
}

export interface ExamClass {
    class_id: string;
    class_name: string;
    class_type: string;
    sections: ExamSection[];
}

export interface TeacherExamsResponse {
    employee_id: string;
    classes: ExamClass[];
}

export interface BulkMarkEntry {
    student_id: string;
    obtained_marks: number | null;
    grade: string | null;
    remarks: string | null;
    status: string;
}

export interface BulkMarksPayload {
    exam_subject_id: string;
    marks: BulkMarkEntry[];
    created_by: string;
    modified_by: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get all exams assigned to a teacher */
export async function getTeacherExams(employeeId: string): Promise<TeacherExamsResponse> {
    const response = await api.get(`/mobile/teacher/${employeeId}/exams`);
    const data = response.data?.data ?? response.data;
    return data;
}

/** Bulk create/update marks */
export async function bulkSaveMarks(payload: BulkMarksPayload): Promise<void> {
    await api.post('/mobile/exams/marks/bulk', payload);
}
