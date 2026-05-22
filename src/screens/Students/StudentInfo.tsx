import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useStudentInfoVM } from './StudentInfo.vm';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SegmentChip({
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
      style={[styles.segmentChip, active ? styles.segmentChipActive : styles.segmentChipInactive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.segmentChipText, active && styles.segmentChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function StudentInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const vm = useStudentInfoVM(studentId);
  const [activeTab, setActiveTab] = useState('profile');

  if (!vm.student) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Student Info" onBack={() => router.replace('/students')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Student not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScreenHeader title="Student Info" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarCircleLarge}>
          <Text style={styles.avatarInitialLarge}>{vm.student.name.split(' ')[0][0]}</Text>
        </View>
        <Text style={styles.studentName}>{vm.student.name}</Text>
        <Text style={styles.studentSubtitle}>Roll: {vm.student.roll} | {vm.student.className}</Text>

        <View style={styles.segmentRow}>
          <SegmentChip
            label="Profile"
            active={activeTab === 'profile'}
            onPress={() => setActiveTab('profile')}
          />
          <SegmentChip
            label="Exam Results"
            active={activeTab === 'exam'}
            onPress={() => router.push(`/student-exam-results?id=${studentId}`)}
          />
          <SegmentChip
            label="Case Study"
            active={activeTab === 'case'}
            onPress={() => setActiveTab('case')}
          />
        </View>

        {activeTab === 'profile' && (
          <>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Blood Group" value={vm.student.bloodGroup} />
              <InfoRow label="Date of Birth" value={vm.student.dob} />
              <InfoRow label="Email ID" value={vm.student.email} />
              <InfoRow label="Parent's Name" value={vm.student.parentName} />
              <InfoRow label="Phone Number" value={vm.student.phone} />
              <InfoRow label="Date of Joining" value={vm.student.joined} />
            </View>
          </>
        )}

        {activeTab === 'case' && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Student case study will be available soon.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.light },
  scroll: { padding: 16, paddingBottom: 32 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: colors.neutral[500] },
  avatarCircleLarge: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  avatarInitialLarge: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  studentSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  segmentChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentChipActive: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  segmentChipInactive: {
    backgroundColor: colors.surface.light,
    borderColor: colors.neutral[200],
  },
  segmentChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  segmentChipTextActive: {
    color: colors.neutral[100],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 24,
    backgroundColor: colors.surface.DEFAULT,
    padding: 18,
    shadowColor: '#000',
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: colors.surface.DEFAULT,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
});
