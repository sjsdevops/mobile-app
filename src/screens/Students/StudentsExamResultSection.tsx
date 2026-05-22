import React from 'react';
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

function CircularProgress({ percentage }: { percentage: number }) {
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
        <Text style={styles.progressValue}>{Math.round(percentage)}%</Text>
        <Text style={styles.progressLabel}>Days</Text>
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

    return <Path key={label} d={pathData} fill={colors_array[index % colors_array.length]} />;
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
        <Text style={styles.schoolName}>{school.name} | ICSE/ISC</Text>
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
      <View style={styles.studentInfoContainer}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentMeta}>Roll: {student.roll} Class {student.className}</Text>
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
      <Text style={[styles.tableCell, styles.gradeCell]}>{grade}</Text>
    </View>
  );
}

function ExamReportSection({ title, result }: { title: string; result: ExamResult }) {
  const totalMarks = result.subjects.reduce((sum, item) => sum + item.max, 0);
  const obtainedMarks = result.subjects.reduce((sum, item) => sum + item.obtained, 0);
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.subjectCell]}>Subject</Text>
          <Text style={[styles.tableHeaderCell, styles.numberCell]}>Max</Text>
          <Text style={[styles.tableHeaderCell, styles.numberCell]}>Obtained</Text>
          <Text style={[styles.tableHeaderCell, styles.gradeCellHeader]}>Grade</Text>
        </View>
        {result.subjects.map((subject) => (
          <ResultRow
            key={subject.subject}
            subject={subject.subject}
            max={subject.max}
            obtained={subject.obtained}
            grade={subject.grade}
          />
        ))}
        <View style={styles.tableRowTotal}>
          <Text style={[styles.tableCell, styles.subjectCell, styles.totalText]}>Total</Text>
          <Text style={[styles.tableCell, styles.numberCell, styles.totalText]}>{totalMarks}</Text>
          <Text style={[styles.tableCell, styles.numberCell, styles.totalText]}>{obtainedMarks}</Text>
          <Text style={[styles.tableCell, styles.gradeCell, styles.totalText]}>B+</Text>
        </View>
      </View>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>{result.remarks}</Text>
      </View>
    </View>
  );
}

export function StudentsExamResultSectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId;
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const vm = useStudentsExamResultsVM(studentId);

  const mockSchool: SchoolInfo = {
    name: 'Sree Jayam School',
    type: 'ICSE/ISC',
    address: 'Ezhil Nagar Main Road, Allapuram,',
    city: 'Vellore - 632002',
  };

  const mockStudent: StudentInfo = {
    name: 'Sneha Gupta',
    roll: '14',
    className: 'X-A',
  };

  const section = vm.examSections.find((item) => item.id === sectionId);

  if (!section) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Exam Details" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Report not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
      <ScreenHeader title={`${section.title} Reports`} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SchoolCard school={mockSchool} />
        <StudentCard student={mockStudent} />

        <View style={styles.detailMetricBlock}>
          <Text style={styles.detailMetricLabel}>ATTENDANCE</Text>
          <CircularProgress percentage={section.overall.attendancePercentage} />
          <Text style={styles.attendanceSubLabel}>
            {section.overall.attendanceDays}/{section.overall.attendanceTotal} Days
          </Text>
        </View>

        <View style={styles.detailMetricBlock}>
          <Text style={styles.detailMetricLabel}>ACADEMIC PERFORMANCE</Text>
          <PieChart data={section.overall.academicPerformance} />
        </View>

        {section.tests.map((test) => (
          <ExamReportSection key={test.id} title={`UNIT TEST RESULT - ${section.tests.indexOf(test) + 1}`} result={test} />
        ))}

        <ExamReportSection title={`OVERALL REPORT OF ${section.title.toUpperCase()}`} result={section.overall} />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} activeOpacity={0.85}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Share Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} activeOpacity={0.85}>
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Save as PDF</Text>
          </TouchableOpacity>
        </View>
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
  schoolCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  schoolLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  schoolLogoText: {
    fontSize: 18,
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
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 11,
    color: colors.neutral[600],
    lineHeight: 16,
  },
  schoolCity: {
    fontSize: 11,
    color: colors.neutral[600],
  },
  studentCard: {
    alignItems: 'center',
    marginBottom: 22,
  },
  studentInfoContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  avatarSmall: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  studentMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 6,
  },
  detailMetricBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detailMetricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  progressLabel: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  attendanceSubLabel: {
    marginTop: 10,
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '600',
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
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  tableSection: {
    borderRadius: 16,
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
  gradeCell: {
    flex: 1,
    fontWeight: '500',
    textAlign: 'right',
  },
  gradeCellHeader: {
    flex: 1,
    textAlign: 'right',
  },
  totalText: {
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 16,
    marginTop: 12,
  },
  noteText: {
    fontSize: 12,
    color: colors.neutral[700],
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[300],
  },
  secondaryButton: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: colors.surface.DEFAULT,
  },
  secondaryButtonText: {
    color: colors.primary[300],
  },
});
