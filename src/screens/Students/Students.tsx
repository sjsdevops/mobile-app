import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useStudentsVM } from './Students.vm';

function StudentChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.classChip, active ? styles.classChipActive : styles.classChipInactive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.classChipText, active && styles.classChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StudentCard({
  name,
  roll,
  status,
  onPress,
}: {
  name: string;
  roll: string;
  status: 'present' | 'absent';
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.studentCardRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{name.split(' ')[0][0]}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{name}</Text>
          <Text style={styles.studentMeta}>Roll No: {roll}</Text>
        </View>
        <View style={[styles.statusDot, status === 'present' ? styles.presentDot : styles.absentDot]} />
      </View>
    </TouchableOpacity>
  );
}

export function StudentsScreen() {
  const router = useRouter();
  const vm = useStudentsVM();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>Students</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {vm.classes.map((className) => (
            <StudentChip
              key={className}
              label={className}
              active={vm.activeClass === className}
              onPress={() => vm.setActiveClass(className)}
            />
          ))}
        </ScrollView>

        <View style={styles.summaryRow}>
          <Text style={styles.sectionTitle}>Student ({vm.totalCount})</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryBadge}>
              <View style={[styles.summaryDot, styles.presentDot]} />
              <Text style={styles.summaryText}>{vm.presentCount} Present</Text>
            </View>
            <View style={styles.summaryBadge}>
              <View style={[styles.summaryDot, styles.absentDot]} />
              <Text style={styles.summaryText}>{vm.absentCount} Absent</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.neutral[400]}
            value={vm.searchQuery}
            onChangeText={vm.setSearchQuery}
          />
        </View>

        {vm.filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            name={student.name}
            roll={student.roll}
            status={student.status}
            onPress={() => router.push(`/student-info?id=${student.id}`)}
          />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.light },
  headerRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.neutral[900] },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  chipsRow: { marginBottom: 20 },
  classChip: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
  },
  classChipActive: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  classChipInactive: {
    backgroundColor: colors.surface.light,
    borderColor: colors.neutral[200],
  },
  classChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  classChipTextActive: {
    color: colors.neutral[100],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  summaryStats: { flexDirection: 'row', gap: 10 },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  summaryText: {
    fontSize: 12,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  searchCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 12,
    marginBottom: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchInput: {
    height: 44,
    color: colors.neutral[900],
  },
  studentCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  studentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  presentDot: { backgroundColor: colors.green[200] },
  absentDot: { backgroundColor: colors.secondary[300] },
});
