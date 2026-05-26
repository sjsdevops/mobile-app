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
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ExamSection, ExamResult, useStudentsExamResultsVM } from './StudentsExamResults.vm';

interface SchoolInfo {
  name: string;
  type: string;
  address: string;
  city: string;
}

interface StudentInfo {
  name: string;
  roll: string;
  className: string;
}

function CircularProgress({ percentage, label }: { percentage: number; label: string }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={colors.neutral[200]}
          strokeWidth="8"
        />
        <Circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={colors.primary[300]}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </Svg>
      <View style={styles.progressText}>
        <Text style={styles.progressValue}>{percentage.toFixed(1)}%</Text>
        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    </View>
  );
}

function PieChart({ data }: { data: { [key: string]: number } }) {
  const colors_array = [
    colors.primary[300],
    colors.primary[500],
    colors.primary[400],
    colors.neutral[500],
    colors.neutral[400],
  ];

  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  let currentAngle = -90;
  const paths = entries.map(([label, value], index) => {
    const sliceAngle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return (
      <Path
        key={label}
        d={pathData}
        fill={colors_array[index % colors_array.length]}
      />
    );
  });

  return (
    <View>
      <Svg width={150} height={150} viewBox="0 0 100 100">
        {paths}
      </Svg>
      <View style={styles.pieLegend}>
        {entries.map((item, index) => (
          <View key={item[0]} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: colors_array[index % colors_array.length] },
              ]}
            />
            <Text style={styles.legendLabel}>{item[0]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SchoolCard({ school }: { school: SchoolInfo }) {
  return (
    <View style={styles.schoolCard}>
      <View style={styles.schoolLogo}>
        <Text style={styles.schoolLogoText}>S</Text>
      </View>
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{school.name}</Text>
        <Text style={styles.schoolType}>{school.type}</Text>
        <Text style={styles.schoolAddress}>{school.address}</Text>
        <Text style={styles.schoolCity}>{school.city}</Text>
      </View>
    </View>
  );
}

function StudentCard({ student }: { student: StudentInfo }) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.avatarSmall}>
        <Text style={styles.avatarText}>{student.name.split(' ')[0][0]}</Text>
      </View>
      <View>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentMeta}>
          Roll: {student.roll} | {student.className}
        </Text>
      </View>
    </View>
  );
}

function ResultRow({ subject, max, obtained, grade }: { subject: string; max: number; obtained: number; grade: string }) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.subjectCell]}>{subject}</Text>
      <Text style={[styles.tableCell, styles.numberCell]}>{max}</Text>
      <Text style={[styles.tableCell, styles.numberCell]}>{obtained}</Text>
      <View style={styles.tableCellContainer}>
        <Text style={styles.gradeBadge}>{grade}</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, onView }: { title: string; onView: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <TouchableOpacity onPress={onView} activeOpacity={0.7}>
        <Text style={styles.viewAllText}>View Overall Reports</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReportCard({ item, onPress, isOverall }: { item: ExamResult; onPress: () => void; isOverall?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.reportCard, isOverall && styles.overallReportCard]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View>
        <Text style={styles.reportCardTitle}>{item.title}</Text>
        <Text style={styles.reportCardSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={[styles.reportBadge, isOverall ? styles.overallBadge : styles.scoreBadge]}>
        <Text style={[styles.reportBadgeText, isOverall && styles.overallBadgeText]}>{item.scoreLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function StudentsExamResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const vm = useStudentsExamResultsVM(studentId);

  const mockSchool: SchoolInfo = {
    name: 'Sree Jayam School',
    type: 'ICSE/ISC',
    address: 'Ezhil Nagar Main Road, Allapuram,',
    city: 'Vellore - 632002',
  };

  const studentInfo: StudentInfo = {
    name: vm.studentName || 'Student',
    roll: vm.studentRoll || '-',
    className: vm.studentClass || '-',
  };

  if (vm.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Exam Results" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vm.examSections.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Exam Results" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exam results available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScreenHeader title="Exam Results" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SchoolCard school={mockSchool} />
        <StudentCard student={studentInfo} />

        {vm.examSections.map((section) => (
          <View key={section.id} style={styles.sectionBlock}>
            <SectionHeader
              title={section.title}
              onView={() =>
                router.push({
                  pathname: `/student-exam-results/${section.id}`,
                  params: { id: studentId },
                })
              }
            />

            {section.tests.map((test) => (
              <ReportCard
                key={test.id}
                item={test}
                onPress={() =>
                  router.push({
                    pathname: `/student-exam-results/${section.id}`,
                    params: { id: studentId },
                  })
                }
              />
            ))}

            <ReportCard
              item={section.overall}
              onPress={() =>
                router.push({
                  pathname: `/student-exam-results/${section.id}`,
                  params: { id: studentId },
                })
              }
              isOverall
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[500],
  },

  // School Card
  schoolCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  schoolLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schoolLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[500],
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: 2,
  },
  schoolType: {
    fontSize: 12,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  schoolAddress: {
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 2,
  },
  schoolCity: {
    fontSize: 11,
    color: colors.neutral[600],
  },

  // Student Card
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 4,
  },

  // Exam Tabs
  examTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  examTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  examTabActive: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  examTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  examTabTextActive: {
    color: colors.neutral[100],
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary[300],
    fontWeight: '700',
  },
  reportCard: {
    borderRadius: 20,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primary[300],
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallReportCard: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  reportCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  reportCardSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 6,
  },
  reportBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  scoreBadge: {
    backgroundColor: colors.green[200],
  },
  overallBadge: {
    backgroundColor: colors.surface.DEFAULT,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface.DEFAULT,
  },
  overallBadgeText: {
    color: colors.primary[300],
  },

  // Attendance
  attendanceContainer: {
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  progressLabel: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  attendanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },

  // Performance
  performanceContainer: {
    alignItems: 'center',
  },
  pieLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.neutral[700],
    fontWeight: '500',
  },

  // Table
  tableSection: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface.DEFAULT,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary[300],
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[100],
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.neutral[100],
  },
  tableCell: {
    fontSize: 12,
    color: colors.neutral[900],
  },
  subjectCell: {
    flex: 2,
    fontWeight: '500',
  },
  numberCell: {
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
  },
  tableCellContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gradeBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface.DEFAULT,
    backgroundColor: colors.green[200],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalText: {
    fontWeight: '700',
    color: colors.neutral[900],
  },
  totalGradeBadge: {
    backgroundColor: colors.primary[300],
  },

  // Remarks
  remarksInput: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.neutral[900],
    fontFamily: 'System',
    minHeight: 100,
  },

  // Submit Button
  submitButton: {
    backgroundColor: colors.primary[300],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[100],
  },
});
