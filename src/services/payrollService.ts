import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeSalary {
    employee_salary_id: string;
    payroll_id: string;
    employee_id: string;
    salary_month: string; // "YYYY-MM"
    period_start: string;
    period_end: string;
    staff_name: string;
    actual_salary: number;
    sal_per_day: number;
    basic_pay: number;
    hra: number;
    nod: number;
    gross: number;
    pf: number;
    esi: number;
    lop: number;
    total_deduct: number;
    net_salary: number;
    is_pf_applicable: boolean;
    is_esi_applicable: boolean;
    generated_at: string;
}

export interface EmployeeSalariesResponse {
    total: number;
    skip: number;
    limit: number;
    items: EmployeeSalary[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getEmployeeSalaries(
    employeeId: string,
    params?: {
        payroll_id?: string;
        salary_month?: string;
        skip?: number;
        limit?: number;
    }
): Promise<EmployeeSalariesResponse> {
    const query = new URLSearchParams({ employee_id: employeeId });
    if (params?.payroll_id) query.set('payroll_id', params.payroll_id);
    if (params?.salary_month) query.set('salary_month', params.salary_month);
    if (params?.skip !== undefined) query.set('skip', String(params.skip));
    query.set('limit', String(params?.limit ?? 50));

    const response = await api.get(`/employee-salaries?${query.toString()}`);
    const data = response.data?.data ?? response.data;
    return {
        total: data?.total ?? 0,
        skip: data?.skip ?? 0,
        limit: data?.limit ?? 50,
        items: data?.items ?? [],
    };
}
