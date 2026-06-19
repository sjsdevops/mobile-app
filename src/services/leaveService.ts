import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaveBalance {
    leave_type_id: string;
    name: string;
    code: string;
    color: string | null;
    available: number;
    booked: number;
}

export interface AbsentRecord {
    attendance_date: string;
    day_of_week: string;
    days: number;
}

export interface UpcomingHoliday {
    holiday_id: string;
    name: string;
    holiday_date: string;
    day_of_week: string;
    days: number;
    description: string | null;
}

export interface LeaveSummary {
    employee_id: string;
    leave_balance: LeaveBalance[];
    absent_without_leave: AbsentRecord[];
    upcoming_holidays: UpcomingHoliday[];
}

export interface LeaveRequest {
    leave_request_id: string;
    employee_id: string;
    employee_name: string | null;
    leave_type_id: string | null;
    leave_type_name: string | null;
    leave_type_code: string | null;
    leave_type: string | null;
    from_date: string;
    to_date: string;
    reason: string | null;
    approval_status: 'pending' | 'approved' | 'rejected';
    leave_mode: 'paid' | 'unpaid';
    approved_by: string | null;
    remarks: string | null;
    created_at: string;
    leave_type_details?: {
        color: string | null;
        is_paid: boolean;
        salary_deduction: boolean;
    } | null;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getLeaveSummary(employeeId: string, year?: number): Promise<LeaveSummary> {
    const url = `/leave-summary/${employeeId}${year ? `?year=${year}` : ''}`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
}

export async function getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    const response = await api.get(`/leave-requests?employee_id=${employeeId}&limit=100`);
    const data = response.data?.data ?? response.data;
    return data?.items ?? [];
}

// ─── Holiday Types & API ──────────────────────────────────────────────────────

export interface Holiday {
    holiday_id: string;
    name: string;
    holiday_date: string; // YYYY-MM-DD
    description: string | null;
    created_by: string;
    modified_by: string;
    created_at: string;
    modified_at: string;
}

export interface HolidayListResponse {
    total: number;
    skip: number;
    limit: number;
    items: Holiday[];
}

export async function getHolidays(params?: {
    from_date?: string;
    skip?: number;
    limit?: number;
}): Promise<HolidayListResponse> {
    const qs = new URLSearchParams();
    if (params?.from_date) qs.set('from_date', params.from_date);
    if (params?.skip !== undefined) qs.set('skip', String(params.skip));
    qs.set('limit', String(params?.limit ?? 100));

    const response = await api.get(`/holidays?${qs.toString()}`);
    const data = response.data?.data ?? response.data;
    return {
        total: data?.total ?? 0,
        skip: data?.skip ?? 0,
        limit: data?.limit ?? 100,
        items: data?.items ?? [],
    };
}

export async function applyLeave(payload: {
    employee_id: string;
    leave_type_id: string;
    from_date: string;
    to_date: string;
    reason?: string;
    created_by: string;
    modified_by: string;
}): Promise<void> {
    // Ensure dates include timestamp: YYYY-MM-DDTHH:MM:SS
    const toISO = (d: string) => d.includes('T') ? d : `${d}T00:00:00`;
    await api.post('/leave-requests', {
        ...payload,
        from_date: toISO(payload.from_date),
        to_date: toISO(payload.to_date),
    });
}
