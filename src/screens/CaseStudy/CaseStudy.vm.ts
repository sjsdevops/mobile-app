import { useCallback, useEffect, useState } from 'react';
import { getStudentCaseStudies, type CaseStudyItem } from '../../services/caseStudyService';

export function useStudentCaseStudiesVM(studentId: string | undefined) {
    const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!studentId) {
            setCaseStudies([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const items = await getStudentCaseStudies(studentId);
            setCaseStudies(items);
        } catch (e) {
            console.error('[CaseStudy] Failed to fetch:', e);
            setError('Failed to load case studies.');
            setCaseStudies([]);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        load();
    }, [load]);

    return { caseStudies, loading, error, reload: load };
}
