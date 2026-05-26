import { api } from './api';
import { Platform } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LessonItem {
    lesson_id: string;
    class_id: string;
    class_name: string;
    section_id: string;
    section_name: string;
    subject_id: string;
    subject_name: string;
    employee_id: string;
    employee_name: string;
    chapter_name: string | null;
    topic_name: string | null;
    start_date: string | null;
    end_date: string | null;
    learning_objectives: string | null;
    file_url: string | null;
    status: 'not_started' | 'on_pending' | 'completed';
    assessment_type: string | null;
    created_at: string;
    modified_at: string;
}

export interface AssignedSubject {
    section_subject_id: string;
    subject_id: string;
    subject_name: string;
    subject_code: string;
    subject_type: string;
}

export interface AssignedSection {
    section_id: string;
    section_name: string;
    subjects: AssignedSubject[];
}

export interface AssignedClass {
    class_id: string;
    class_name: string;
    class_type: string;
    sections: AssignedSection[];
}

export interface AssignedSubjectsResponse {
    employee_id: string;
    classes: AssignedClass[];
}

export interface AcademicYear {
    academic_year_id: string;
    year: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get all lessons with optional filters */
export async function getLessons(params?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    employeeId?: string;
    status?: string;
}): Promise<LessonItem[]> {
    const query = new URLSearchParams();
    if (params?.classId) query.append('class_id', params.classId);
    if (params?.sectionId) query.append('section_id', params.sectionId);
    if (params?.subjectId) query.append('subject_id', params.subjectId);
    if (params?.employeeId) query.append('employee_id', params.employeeId);
    if (params?.status) query.append('status', params.status);

    const url = `/mobile/lessons${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await api.get(url);
    const data = response.data?.data ?? response.data;
    return data?.items ?? [];
}

/** Get teacher's assigned subjects (class → section → subjects) */
export async function getAssignedSubjects(userId: string, employeeId: string): Promise<AssignedSubjectsResponse> {
    const response = await api.get(`/acadamics/users/${userId}/employees/${employeeId}/assigned-subjects`);
    return response.data?.data ?? response.data;
}

/** Get academic years */
export async function getAcademicYears(): Promise<AcademicYear[]> {
    const response = await api.get('/academic-years');
    const data = response.data?.data ?? response.data;
    return data ?? [];
}

/** Create a lesson plan */
export async function createLesson(params: {
    classId: string;
    sectionId: string;
    subjectId: string;
    chapterName?: string;
    topicName?: string;
    startDate?: string;
    endDate?: string;
    learningObjectives?: string;
    status?: string;
    assessmentType?: string;
}): Promise<LessonItem> {
    const formData = new FormData();
    formData.append('class_id', params.classId);
    formData.append('section_id', params.sectionId);
    formData.append('subject_id', params.subjectId);
    if (params.chapterName) formData.append('chapter_name', params.chapterName);
    if (params.topicName) formData.append('topic_name', params.topicName);
    if (params.startDate) formData.append('start_date', params.startDate);
    if (params.endDate) formData.append('end_date', params.endDate);
    if (params.learningObjectives) formData.append('learning_objectives', params.learningObjectives);
    if (params.status) formData.append('status', params.status);
    if (params.assessmentType) formData.append('assessment_type', params.assessmentType);

    const response = await api.post('/mobile/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
}

/** Delete a lesson */
export async function deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/mobile/lessons/${lessonId}`);
}

/** Update a lesson (status, dates, etc.) */
export async function updateLesson(lessonId: string, params: {
    status?: string;
    chapterName?: string;
    topicName?: string;
    startDate?: string;
    endDate?: string;
    learningObjectives?: string;
    assessmentType?: string;
}): Promise<LessonItem> {
    const formData = new FormData();
    if (params.status) formData.append('status', params.status);
    if (params.chapterName) formData.append('chapter_name', params.chapterName);
    if (params.topicName) formData.append('topic_name', params.topicName);
    if (params.startDate) formData.append('start_date', params.startDate);
    if (params.endDate) formData.append('end_date', params.endDate);
    if (params.learningObjectives) formData.append('learning_objectives', params.learningObjectives);
    if (params.assessmentType) formData.append('assessment_type', params.assessmentType);

    const response = await api.put(`/mobile/lessons/${lessonId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
}
