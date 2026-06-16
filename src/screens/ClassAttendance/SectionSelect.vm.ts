import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllClasses } from '../../services/classService';

export interface MySection {
    classId: string;
    className: string;
    sectionId: string;
    sectionName: string;
}

export function useSectionSelectVM() {
    const { user } = useAuth();
    const [mySections, setMySections] = useState<MySection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchClasses = async () => {
            setLoading(true);
            try {
                const classes = await getAllClasses(user.id);
                const sections: MySection[] = [];

                for (const cls of classes) {
                    for (const section of cls.sections ?? []) {
                        // Show sections where logged-in user is the class teacher OR coordinator
                        const isTeacher = section.class_teacher?.employee_id === user.id;
                        const isCoordinator = section.coordinator?.employee_id === user.id;
                        if (isTeacher || isCoordinator) {
                            sections.push({
                                classId: cls.class_id,
                                className: cls.class_name,
                                sectionId: section.section_id,
                                sectionName: section.section_name,
                            });
                        }
                    }
                }

                setMySections(sections);
            } catch (error) {
                console.error('[SectionSelect] Failed to fetch classes:', error);
                setMySections([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user]);

    return { mySections, loading };
}
