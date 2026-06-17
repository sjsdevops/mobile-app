import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { CaseStudyCard } from '../../components/ui/CaseStudyCard';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentCaseStudiesVM } from './CaseStudy.vm';

export function CaseStudyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();

    const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
    const studentId = paramId || user?.id;

    const vm = useStudentCaseStudiesVM(studentId);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Case Study" onBack={() => router.back()} />

            {vm.loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : vm.caseStudies.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>
                        {vm.error ?? 'No case studies found.'}
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {vm.caseStudies.map((cs) => (
                        <CaseStudyCard key={cs.case_study_id} item={cs} expanded />
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    scroll: { padding: 16, paddingBottom: 32 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    emptyText: { fontSize: 15, color: colors.neutral[500], textAlign: 'center' },
});
