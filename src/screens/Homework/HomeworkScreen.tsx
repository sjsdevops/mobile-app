import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Badge } from '../../components/ui/Badge';
import { ModalDropdown } from '../../components/ui/ModalDropdown';
import { useHomeworkVM, type FilterTab } from './HomeworkScreen.vm';
import type { HomeworkItem } from '../../services/homeworkService';

const FILTERS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
];

function HomeworkCard({ item, canApprove, onApprove }: { item: HomeworkItem; canApprove: boolean; onApprove: () => void }) {
    const dueDate = item.due_date
        ? new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-';
    return (
        <View style={s.card}>
            <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                    <Text style={s.cardSubject}>{item.subject_name}</Text>
                    <Text style={s.cardClass}>{item.class_name} - {item.section_name}</Text>
                </View>
                <Badge label={item.status === 'approved' ? 'Approved' : 'Submitted'} variant={item.status === 'approved' ? 'green' : 'blue'} />
            </View>
            <Text style={s.cardDesc} numberOfLines={2}>{item.homework_description}</Text>
            <View style={s.cardBottom}>
                <Text style={s.cardDue}>Due: {dueDate}</Text>
                {canApprove && item.status === 'submitted' && (
                    <TouchableOpacity style={s.approveBtn} onPress={onApprove} activeOpacity={0.8}>
                        <Text style={s.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export function HomeworkScreen() {
    const router = useRouter();
    const vm = useHomeworkVM();

    useFocusEffect(useCallback(() => { vm.refreshHomeworks(); }, [vm.refreshHomeworks]));

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Homework" onBack={() => router.back()} />

            <View style={s.content}>
                {/* Filters */}
                <View style={s.row}>
                    <View style={{ flex: 1 }}>
                        <ModalDropdown label="Class" value={vm.selectedClass} options={vm.classes} onSelect={vm.setSelectedClass} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ModalDropdown label="Section" value={vm.selectedSection} options={vm.sections} onSelect={vm.setSelectedSection} />
                    </View>
                </View>
                <ModalDropdown label="Subject" value={vm.selectedSubject} options={vm.subjects} onSelect={vm.setSelectedSubject} />

                {/* Filter chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow} contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}>
                    {FILTERS.map((f) => (
                        <TouchableOpacity key={f.key} style={[s.chip, vm.filterTab === f.key && s.chipActive]} onPress={() => vm.setFilterTab(f.key)}>
                            <Text style={[s.chipText, vm.filterTab === f.key && s.chipTextActive]}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* List */}
                {vm.loading ? (
                    <View style={s.center}><ActivityIndicator size="large" color={colors.primary[300]} /></View>
                ) : vm.filteredHomeworks.length === 0 ? (
                    <View style={s.center}><Text style={s.emptyText}>No homework found</Text></View>
                ) : (
                    <FlatList
                        data={vm.filteredHomeworks}
                        keyExtractor={(item) => item.homework_id}
                        renderItem={({ item }) => (
                            <HomeworkCard
                                item={item}
                                canApprove={vm.canApprove}
                                onApprove={() => vm.approveHomework(item.homework_id)}
                            />
                        )}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Add button — only if class teacher or coordinator */}
                {vm.canAddHomework && (
                    <TouchableOpacity style={s.fab} onPress={() => router.push('/add-homework')} activeOpacity={0.85}>
                        <Text style={s.fabText}>+ Add Homework</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    row: { flexDirection: 'row', gap: 12 },
    chipRow: { marginBottom: 12, maxHeight: 44 },
    chip: { paddingHorizontal: 16, height: 34, borderRadius: 17, backgroundColor: colors.neutral[200], alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    chipActive: { backgroundColor: colors.primary[300] },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.neutral[800] },
    chipTextActive: { color: colors.neutral[100] },
    card: { backgroundColor: colors.neutral[100], borderRadius: 14, padding: 16, marginBottom: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardSubject: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
    cardClass: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
    cardDesc: { fontSize: 13, color: colors.neutral[700], marginBottom: 8, lineHeight: 19 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardDue: { fontSize: 12, color: colors.neutral[500] },
    approveBtn: { backgroundColor: colors.green[200], paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    approveBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 15, color: colors.neutral[400] },
    fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: colors.primary[300], paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    fabText: { fontSize: 15, fontWeight: '600', color: colors.neutral[100] },
});
