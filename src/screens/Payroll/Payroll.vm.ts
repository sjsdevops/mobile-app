import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeSalaries, type EmployeeSalary } from '../../services/payrollService';

export function usePayrollVM() {
    const { user } = useAuth();
    const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        fetchSalaries();
    }, [user?.id]);

    async function fetchSalaries() {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getEmployeeSalaries(user.id, { limit: 50 });
            // Sort newest month first
            const sorted = [...result.items].sort((a, b) =>
                b.salary_month.localeCompare(a.salary_month)
            );
            setSalaries(sorted);
        } catch (err: any) {
            setError('Failed to load payroll data. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return { salaries, loading, error, refresh: fetchSalaries };
}
