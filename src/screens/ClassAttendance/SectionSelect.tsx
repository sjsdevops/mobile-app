import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, People } from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useSectionSelectVM } from './SectionSelect.vm';

export function SectionSelect() {
    const router = useRouter();
    const vm = useSectionSelectVM();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.circleBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Mark Attendance</Text>
                    <Text style={styles.headerSub}>Select your class section</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {vm.loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : vm.mySections.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No assigned sections found</Text>
                </View>
            ) : (
                <FlatList
                    data={vm.mySections}
                    keyExtractor={(item) => item.sectionId}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.sectionCard}
                            activeOpacity={0.75}
                            onPress={() =>
                                router.push({
                                    pathname: '/attendance',
                                    params: {
                                        classId: item.classId,
                                        sectionId: item.sectionId,
                                        className: item.className,
                                        sectionName: item.sectionName,
                                    },
                                })
                            }
                        >
                            <View style={styles.iconCircle}>
                                <People color={colors.primary[300]} size={24} variant="Bold" />
                            </View>
                            <View style={styles.sectionInfo}>
                                <Text style={styles.sectionTitle}>{item.className} - {item.sectionName}</Text>
                                <Text style={styles.sectionSub}>Class Teacher</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    circleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.neutral[900] },
    headerSub: { fontSize: 13, color: colors.neutral[500], marginTop: 1 },
    divider: { height: 1, backgroundColor: colors.neutral[200], marginHorizontal: 16, marginBottom: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 15, color: colors.neutral[400] },
    list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
    sectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 14,
        padding: 16,
        gap: 14,
        shadowColor: colors.neutral[1000],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.alpha,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionInfo: { flex: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
    sectionSub: { fontSize: 13, color: colors.neutral[500], marginTop: 2 },
});
