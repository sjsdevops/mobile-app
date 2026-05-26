import { api } from './api';

export interface ClassTeacher {
    employee_id: string;
    first_name: string;
    last_name: string;
}

export interface SectionItem {
    section_id: string;
    section_name: string;
    class_teacher?: ClassTeacher;
    coordinator?: ClassTeacher;
}

export interface ClassItem {
    class_id: string;
    class_name: string;
    class_type: string;
    sections: SectionItem[];
}

/** Get all classes with sections, class teachers, and coordinators */
export async function getAllClasses(userId: string): Promise<ClassItem[]> {
    const response = await api.get(`/users/${userId}/classes`);
    const data = response.data?.data ?? response.data;
    return data?.items ?? data ?? [];
}
