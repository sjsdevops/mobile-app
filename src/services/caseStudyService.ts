import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CaseStudyItem {
    case_study_id: string;
    student_id: string;
    student_name: string | null;
    status: string | null;
    case_study_type: string | null;
    notes: string | null;
    created_by: string;
    modified_by: string;
    created_at: string;
    modified_at: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get a student's case-study records (paginated). */
export async function getStudentCaseStudies(
    studentId: string,
    skip = 0,
    limit = 50,
): Promise<CaseStudyItem[]> {
    const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    const response = await api.get(`/case-studies/students/${studentId}?${query.toString()}`);
    const data = response.data?.data ?? response.data;
    return data?.items ?? [];
}
