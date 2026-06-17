import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
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
                const isStudent = user.role === 'student';

                if (isStudent) {
                    // For students: get profile for class/section, then get subjects
                    const profileResp = await api.get(`/mobile/student/${user.id}/profile`);
                    const profile = profileResp.data?.data ?? profileResp.data;
                    const classId = profile.academic_info?.class_id;
                    const sectionId = profile.academic_info?.section_id;
                    const className = profile.academic_info?.class_name ?? '';
                    const sectionName = profile.academic_info?.section_name ?? '';

                    if (classId && sectionId) {
                        setSelectedClass(classId);
                        setSelectedSection(sectionId);

                        // Get subjects for this section
                        const subjectsResp = await api.get(`/acadamics/users/${user.id}/subjects?class_id=${classId}`);
                        const subjectsData = subjectsResp.data?.data ?? subjectsResp.data;
                        const subjectItems = subjectsData?.items ?? subjectsData ?? [];
                        const sectionSubjects = subjectItems
                            .filter((s: any) => s.section?.section_id === sectionId)
                            .map((s: any) => ({
                                section_subject_id: s.section_subject_id,
                                subject_id: s.subject_id,
                                subject_name: s.subject_name,
                                subject_code: s.subject_code ?? '',
                                subject_type: s.subject_type ?? 'Core',
                            }));

                        setAssignedClasses([{
                            class_id: classId, class_name: className, class_type: '',
                            sections: [{ section_id: sectionId, section_name: sectionName, subjects: sectionSubjects }],
                        }]);
                        if (sectionSubjects.length > 0) setSelectedSubject(sectionSubjects[0].subject_id);
                    }
                } else {
                    const isCoordinatorRole = user.role?.toLowerCase().includes('coordinator') ||
                        user.role?.toLowerCase().includes('oridinator');

                    const [assignedData, classesData] = await Promise.all([
                        getAssignedSubjects(user.id, user.id),
                        getAllClasses(user.id),
                    ]);
                    setAllClassesData(classesData);

                    if (isCoordinatorRole) {
                        // Coordinator: filter to sections where they are coordinator, fetch subjects per section
                        const coordinatorClasses: AssignedClass[] = [];

                        for (const cls of classesData) {
                            const coordinatorSections = cls.sections.filter(
                                (sec) => sec.coordinator?.employee_id === user.id
                            );
                            if (coordinatorSections.length === 0) continue;

                            let subjectItems: any[] = [];
                            try {
                                const subjectsResp = await api.get(
                                    `/acadamics/users/${user.id}/subjects?class_id=${cls.class_id}`
                                );
                                const subjectsData = subjectsResp.data?.data ?? subjectsResp.data;
                                subjectItems = subjectsData?.items ?? subjectsData ?? [];
                            } catch { /* continue with empty subjects */ }

                            const sections = coordinatorSections.map((sec) => ({
                                section_id: sec.section_id,
                                section_name: sec.section_name,
                                subjects: subjectItems
                                    .filter((s: any) => s.section?.section_id === sec.section_id)
                                    .map((s: any) => ({
                                        section_subject_id: s.section_subject_id,
                                        subject_id: s.subject_id,
                                        subject_name: s.subject_name,
                                        subject_code: s.subject_code ?? '',
                                        subject_type: s.subject_type ?? 'Core',
                                    })),
                            }));

                            coordinatorClasses.push({
                                class_id: cls.class_id,
                                class_name: cls.class_name,
                                class_type: cls.class_type,
                                sections,
                            });
                        }

                        setAssignedClasses(coordinatorClasses);
                        if (coordinatorClasses.length > 0) setSelectedClass(coordinatorClasses[0].class_id);
                    } else {
                        // Teacher: use assigned subjects as before
                        setAssignedClasses(assignedData.classes ?? []);
                        if (assignedData.classes?.length > 0) setSelectedClass(assignedData.classes[0].class_id);
                    }
                }
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
    const isSubjectTeacher = useMemo(() => {
        if (!user || !selectedClass || !selectedSection || !selectedSubject) return false;
        const cls = assignedClasses.find((c) => c.class_id === selectedClass);
        const sec = cls?.sections.find((s) => s.section_id === selectedSection);
        return (sec?.subjects ?? []).some((s) => s.subject_id === selectedSubject);
    }, [user, selectedClass, selectedSection, selectedSubject, assignedClasses]);

    const isCoordinator = useMemo(() => {
        if (!user || !selectedClass || !selectedSection) return false;
        const cls = allClassesData.find((c) => c.class_id === selectedClass);
        const sec = cls?.sections.find((s) => s.section_id === selectedSection);
        return sec?.coordinator?.employee_id === user.id;
    }, [user, selectedClass, selectedSection, allClassesData]);

    // Can add homework: only if subject teacher (not student)
    const canAddHomework = isSubjectTeacher && user?.role !== 'student';

    // Can approve: if coordinator (not student)
    const canApprove = isCoordinator && user?.role !== 'student';

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
