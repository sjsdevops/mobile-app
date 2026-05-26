import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeProfile {
    employee_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string;
    blood_group: string;
    mobile_number: string;
    email: string;
    joining_date: string | null;
    role: { role_id: string; role_name: string; permissions: unknown[] };
    personal_details: {
        personal_detail_id: string;
        father_name: string | null;
        mother_name: string | null;
        husband_name: string | null;
        marital_status: string | null;
        address: string | null;
        primary_contact: string | null;
        secondary_contact: string | null;
        email: string | null;
    } | null;
    work_details: {
        work_detail_id: string;
        employee_code: string | null;
        department_id: string | null;
        subject_handline: string | null;
        reports_to: string | null;
        shift_time: string | null;
    } | null;
    assigned_classes: Array<{
        class_id: string;
        class_name: string;
        class_type: string;
        sections: Array<{
            section_id: string;
            section_name: string;
            total_students?: number;
            today_attendance_percentage?: number;
        }>;
    }>;
    attendance_percentage: number | null;
}

export interface StudentProfile {
    student_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string;
    blood_group: string;
    nationality: string | null;
    mother_toung: string | null;
    personal_details: {
        personal_detail_id: string;
        father_name: string | null;
        mother_name: string | null;
        address: string | null;
        primary_contact: string | null;
        secondary_contact: string | null;
        email: string | null;
    } | null;
    academic_info: {
        academic_info_id: string;
        admission_number: string | null;
        medium: string | null;
        admission_date: string | null;
        roll_no: string | null;
        class_id: string;
        class_name: string;
        section_id: string;
        section_name: string;
        category: string | null;
    } | null;
    role: { role_id: string; role_name: string; permissions: unknown[] };
    class_teacher: {
        employee_id: string;
        first_name: string;
        last_name: string;
        email: string;
        mobile_number: string;
    } | null;
    attendance_percentage: number | null;
}

export interface UpdateEmployeePayload {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    mobile_number?: string;
    email?: string;
    address?: string;
    employee_code?: string;
    modified_by: string;
}

export interface UpdateStudentPayload {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    nationality?: string;
    mother_toung?: string;
    roll_no?: string;
    address?: string;
    email?: string;
    primary_contact?: string;
    modified_by: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getEmployeeProfile(employeeId: string): Promise<EmployeeProfile> {
    const response = await api.get(`/mobile/employee/${employeeId}/profile`);
    return response.data?.data ?? response.data;
}

export async function updateEmployeeProfile(employeeId: string, payload: UpdateEmployeePayload): Promise<EmployeeProfile> {
    const response = await api.put(`/mobile/employee/${employeeId}/profile`, payload);
    return response.data?.data ?? response.data;
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile> {
    const response = await api.get(`/mobile/student/${studentId}/profile`);
    return response.data?.data ?? response.data;
}

export async function updateStudentProfile(studentId: string, payload: UpdateStudentPayload): Promise<StudentProfile> {
    const response = await api.put(`/mobile/student/${studentId}/profile`, payload);
    return response.data?.data ?? response.data;
}
