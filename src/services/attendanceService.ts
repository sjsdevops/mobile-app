import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentAttendanceRecord {
    student_id: string;
    is_present: boolean;
    is_absent: boolean;
}

export interface MarkStudentAttendancePayload {
    class_id: string;
    section_id: string;
    date: string;
    attendance: StudentAttendanceRecord[];
    created_by: string;
    modified_by: string;
}

export interface ClassAttendanceItem {
    student_id: string;
    student_name: string;
    status: 'present' | 'absent' | 'not_marked';
    is_present: boolean;
    is_absent: boolean;
    is_approved?: boolean;
}

export interface ClassAttendanceResponse {
    class_id: string;
    section_id: string;
    date: string;
    total_students: number;
    present_count: number;
    absent_count: number;
    not_marked_count: number;
    items: ClassAttendanceItem[];
}

export interface WeeklyStudentRecord {
    student_id: string;
    student_name: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    not_marked_days: number;
    attendance_percentage: number;
}

export interface WeeklyAttendanceResponse {
    class_id: string;
    section_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    total_students: number;
    average_attendance_percentage: number;
    end_date_absent_count: number;
    students: WeeklyStudentRecord[];
}

export interface StudentHistoryRecord {
    attendance_id: string;
    student_id: string;
    date: string;
    is_present: boolean;
    is_absent: boolean;
}

export interface StudentHistoryResponse {
    student_id: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    records: StudentHistoryRecord[];
}

export interface AttendanceDashboard {
    total: number;
    present: number;
    absent: number;
    attendance_percentage: number;
}

export interface EmployeeAttendanceRecord {
    employee_attendance_id: string;
    employee_id: string;
    date: string;
    is_present: boolean;
    is_absent: boolean;
    check_in: string | null;
    check_out: string | null;
    location: string | null;
}

export interface EmployeeHistoryResponse {
    employee_id: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    records: EmployeeAttendanceRecord[];
}

export interface MarkEmployeeSelfPayload {
    date: string;
    is_present: boolean;
    is_absent: boolean;
    check_in?: string;
    check_out?: string;
    location?: string;
    created_by: string;
    modified_by: string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/** 1. Mark student attendance (bulk) */
export async function markStudentAttendance(payload: MarkStudentAttendancePayload): Promise<string> {
    const response = await api.post('/mobile/attendance/students', payload);
    const data = response.data?.data ?? response.data;
    return typeof data === 'string' ? data : 'Attendance marked successfully';
}

/** 2. Get class attendance for a date */
export async function getClassAttendance(
    classId: string,
    sectionId: string,
    date?: string,
): Promise<ClassAttendanceResponse> {
    let url = `/mobile/attendance/students/class/${classId}/section/${sectionId}`;
    if (date) url += `?date=${date}`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
}

/** 3. Get weekly class attendance */
export async function getWeeklyClassAttendance(
    classId: string,
    sectionId: string,
    startDate: string,
    endDate: string,
): Promise<WeeklyAttendanceResponse> {
    const url = `/mobile/attendance/students/class/${classId}/section/${sectionId}/weekly?start_date=${startDate}&end_date=${endDate}`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
}

/** 4. Get student attendance history */
export async function getStudentAttendanceHistory(studentId: string): Promise<StudentHistoryResponse> {
    const response = await api.get(`/mobile/attendance/students/${studentId}`);
    return response.data?.data ?? response.data;
}

/** 5. Get student attendance dashboard */
export async function getStudentAttendanceDashboard(studentId: string): Promise<AttendanceDashboard> {
    const response = await api.get(`/mobile/attendance/students/dashboard/${studentId}`);
    return response.data?.data ?? response.data;
}

/** 6. Get student attendance report */
export async function getStudentAttendanceReport(studentId: string): Promise<StudentHistoryResponse> {
    const response = await api.get(`/mobile/attendance/students/report/${studentId}`);
    return response.data?.data ?? response.data;
}

/** 7. Mark employee self attendance */
export async function markEmployeeSelfAttendance(payload: MarkEmployeeSelfPayload): Promise<string> {
    const response = await api.post('/mobile/attendance/employees/self', payload);
    const data = response.data?.data ?? response.data;
    return typeof data === 'string' ? data : 'Attendance marked successfully';
}

/** 8. Get employee attendance history */
export async function getEmployeeAttendanceHistory(employeeId: string): Promise<EmployeeHistoryResponse> {
    const response = await api.get(`/mobile/attendance/employees/${employeeId}`);
    return response.data?.data ?? response.data;
}

/** 9. Get employee attendance dashboard */
export async function getEmployeeAttendanceDashboard(employeeId: string): Promise<AttendanceDashboard> {
    const response = await api.get(`/mobile/attendance/employees/${employeeId}/dashboard`);
    return response.data?.data ?? response.data;
}

/** Approve/revoke student attendance (coordinator action) */
export async function approveStudentAttendance(payload: {
    class_id: string;
    section_id: string;
    date: string;
    attendance: Array<{ student_id: string; is_approved: boolean; is_present: boolean; is_absent: boolean }>;
    modified_by: string;
}): Promise<void> {
    await api.patch('/mobile/attendance/students/approve', payload);
}
