import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getHomeworks, updateHomework, type HomeworkItem } from '../../services/homeworkService';
import { getAssignedSubjects, type AssignedClass } from '../../services/lessonPlanService';
import { getAllClasses, type ClassItem } from '../../services/classService';

export type FilterTab = 'all' | 'submitted' | 'approved';
export type DropdownOption = { id: string; label: string };

export function useHomeworkVM() {
    const { user } = useAuth();
    const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
    const [allClassesData, setAllClassesData] = useState<ClassItem[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshHomeworks = useCallback(() => setRefreshKey((k) => k + 1), []);

    // Fetch data on mount
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [assignedData, classesData] = await Promise.all([
                    getAssignedSubjects(user.id, user.id),
                    getAllClasses(user.id),
                ]);
                setAssignedClasses(assignedData.classes ?? []);
                setAllClassesData(classesData);
                if (assignedData.classes?.length > 0) setSelectedClass(assignedData.classes[0].class_id);
            } catch (err) {
                console.error('[Homework] Failed to fetch data:', err);
            }
        })();
    }, [user]);

    // Dropdown options
    const classes: DropdownOption[] = useMemo(() =>
        assignedClasses.map((c) => ({ id: c.class_id, label: c.class_name })),
        [assignedClasses]
    );

    const sections: DropdownOption[] = useMemo(() => {
        const cls = assignedClasses.find((c) => c.class_id === selectedClass);
        return (cls?.sections ?? []).map((s) => ({ id: s.section_id, label: s.section_name }));
    }, [assignedClasses, selectedClass]);

    const subjects: DropdownOption[] = useMemo(() => {
        const cls = assignedClasses.find((c) => c.class_id === selectedClass);
        const sec = cls?.sections.find((s) => s.section_id === selectedSection);
        return (sec?.subjects ?? []).map((s) => ({ id: s.subject_id, label: s.subject_name }));
    }, [assignedClasses, selectedClass, selectedSection]);

    // Auto-select
    useEffect(() => {
        if (sections.length > 0 && !sections.find((s) => s.id === selectedSection))
            setSelectedSection(sections[0].id);
    }, [sections]);

    useEffect(() => {
        if (subjects.length > 0 && !subjects.find((s) => s.id === selectedSubject))
            setSelectedSubject(subjects[0].id);
    }, [subjects]);

    // Fetch homeworks
    useEffect(() => {
        if (!selectedClass || !selectedSection || !user) return;
        (async () => {
            setLoading(true);
            try {
                const data = await getHomeworks({
                    classId: selectedClass,
                    sectionId: selectedSection,
                    subjectId: selectedSubject || undefined,
                });
                setHomeworks(data);
            } catch {
                setHomeworks([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedClass, selectedSection, selectedSubject, user, refreshKey]);

    const filteredHomeworks = useMemo(() => {
        if (filterTab === 'all') return homeworks;
        return homeworks.filter((h) => h.status === filterTab);
    }, [homeworks, filterTab]);

    // Role checks for selected section
    const isClassTeacher = useMemo(() => {
        if (!user || !selectedClass || !selectedSection) return false;
        const cls = allClassesData.find((c) => c.class_id === selectedClass);
        const sec = cls?.sections.find((s) => s.section_id === selectedSection);
        return sec?.class_teacher?.employee_id === user.id;
    }, [user, selectedClass, selectedSection, allClassesData]);

    const isCoordinator = useMemo(() => {
        if (!user || !selectedClass || !selectedSection) return false;
        const cls = allClassesData.find((c) => c.class_id === selectedClass);
        const sec = cls?.sections.find((s) => s.section_id === selectedSection);
        return sec?.coordinator?.employee_id === user.id;
    }, [user, selectedClass, selectedSection, allClassesData]);

    // Can add homework: only if class teacher
    const canAddHomework = isClassTeacher;

    // Can approve: if coordinator
    const canApprove = isCoordinator;

    // Approve homework
    const approveHomework = useCallback(async (homeworkId: string) => {
        try {
            await updateHomework(homeworkId, { status: 'approved' });
            Alert.alert('Success', 'Homework approved');
            refreshHomeworks();
        } catch (err) {
            console.error('[Homework] Approve error:', err);
            Alert.alert('Error', 'Failed to approve homework');
        }
    }, [refreshHomeworks]);

    return {
        classes,
        sections,
        subjects,
        selectedClass,
        setSelectedClass,
        selectedSection,
        setSelectedSection,
        selectedSubject,
        setSelectedSubject,
        filterTab,
        setFilterTab,
        filteredHomeworks,
        loading,
        refreshHomeworks,
        canAddHomework,
        canApprove,
        approveHomework,
    };
}
