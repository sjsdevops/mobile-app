import { useCallback, useEffect, useMemo, useState } from 'react';
import { getHolidays, type Holiday } from '../../services/leaveService';

export type HolidayFilter = 'upcoming' | 'all';

export function useHolidaysVM() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<HolidayFilter>('upcoming');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all holidays for the current year
            const yearStart = `${new Date().getFullYear()}-01-01`;
            const result = await getHolidays({ from_date: yearStart, limit: 200 });
            // Sort ascending by date
            const sorted = [...result.items].sort((a, b) =>
                a.holiday_date.localeCompare(b.holiday_date)
            );
            setHolidays(sorted);
        } catch {
            setError('Failed to load holidays. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const today = new Date().toISOString().slice(0, 10);

    const displayedHolidays = useMemo(() => {
        if (filter === 'upcoming') {
            return holidays.filter((h) => h.holiday_date >= today);
        }
        return holidays;
    }, [holidays, filter, today]);

    // Group by month for sectioned display
    const grouped = useMemo(() => {
        const map = new Map<string, Holiday[]>();
        for (const h of displayedHolidays) {
            const [y, m] = h.holiday_date.split('-');
            const key = `${y}-${m}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(h);
        }
        return Array.from(map.entries()).map(([monthKey, items]) => ({
            monthKey,
            items,
        }));
    }, [displayedHolidays]);

    const upcomingCount = useMemo(
        () => holidays.filter((h) => h.holiday_date >= today).length,
        [holidays, today]
    );

    const pastCount = useMemo(
        () => holidays.filter((h) => h.holiday_date < today).length,
        [holidays, today]
    );

    return {
        grouped,
        loading,
        error,
        filter,
        setFilter,
        refresh: load,
        totalCount: holidays.length,
        upcomingCount,
        pastCount,
    };
}
