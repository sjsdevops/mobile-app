import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HomeworkItem {
    homework_id: string;
    class_id: string;
    class_name: string;
    section_id: string;
    section_name: string;
    subject_id: string;
    subject_name: string;
    employee_id: string;
    employee_name: string;
    homework_description: string;
    due_date: string;
    file_url: string | null;
    status: 'submitted' | 'approved';
    created_at: string;
    modified_at: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get all homeworks with optional filters */
export async function getHomeworks(params?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    employeeId?: string;
    status?: string;
}): Promise<HomeworkItem[]> {
    const query = new URLSearchParams();
    if (params?.classId) query.append('class_id', params.classId);
    if (params?.sectionId) query.append('section_id', params.sectionId);
    if (params?.subjectId) query.append('subject_id', params.subjectId);
    if (params?.employeeId) query.append('employee_id', params.employeeId);
    if (params?.status) query.append('status', params.status);

    const url = `/mobile/homeworks${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await api.get(url);
    const data = response.data?.data ?? response.data;
    return data?.items ?? [];
}

/** Create homework */
export async function createHomework(params: {
    classId: string;
    sectionId: string;
    subjectId: string;
    homeworkDescription: string;
    dueDate: string;
}): Promise<HomeworkItem> {
    const formData = new FormData();
    formData.append('class_id', params.classId);
    formData.append('section_id', params.sectionId);
    formData.append('subject_id', params.subjectId);
    formData.append('homework_description', params.homeworkDescription);
    formData.append('due_date', params.dueDate);

    const response = await api.post('/mobile/homeworks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
}

/** Delete homework */
export async function deleteHomework(homeworkId: string): Promise<void> {
    await api.delete(`/mobile/homeworks/${homeworkId}`);
}

/** Update homework (status, description, etc.) */
export async function updateHomework(homeworkId: string, params: {
    status?: string;
    homeworkDescription?: string;
    dueDate?: string;
}): Promise<HomeworkItem> {
    const formData = new FormData();
    if (params.status) formData.append('status', params.status);
    if (params.homeworkDescription) formData.append('homework_description', params.homeworkDescription);
    if (params.dueDate) formData.append('due_date', params.dueDate);

    const response = await api.put(`/mobile/homeworks/${homeworkId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
}
