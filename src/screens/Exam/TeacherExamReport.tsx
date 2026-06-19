import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '../../theme/colors';
import { useThemeColors } from '../../theme/ThemeContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAuth } from '../../contexts/AuthContext';
import { getTeacherExams, type ExamSubjectEntry } from '../../services/examService';

interface SchoolInfo {
  name: string;
  type: string;
  address: string;
  city: string;
}

function SchoolCard({ school }: { school: SchoolInfo }) {
  const themeColors = useThemeColors();
  const dynStyles = {
    schoolName: { color: themeColors.primary[500] },
  };

  return (
    <View style={styles.schoolCard}>
      <Image source={require('../../../assets/icon.png')} style={styles.schoolLogoImg} />
      <View style={styles.schoolInfo}>
        <Text style={[styles.schoolName, dynStyles.schoolName]}>{school.name}</Text>
        <Text style={styles.schoolType}>{school.type}</Text>
        <Text style={styles.schoolAddress}>
          {school.address}
          {'\n'}
          {school.city}
        </Text>
      </View>
    </View>
  );
}

function calculateGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

export function TeacherExamReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamSubjectEntry | null>(null);

  const examSubjectId = Array.isArray(params.examSubjectId) ? params.examSubjectId[0] : params.examSubjectId;

  const dynStyles = {
    tableHeader: { backgroundColor: themeColors.primary[300] },
  };

  const mockSchool: SchoolInfo = {
    name: 'Sree Jayam School',
    type: 'ICSE/ISC',
    address: 'Ezhil Nagar Main Road, Allapuram,',
    city: 'Vellore - 632002',
  };

  useEffect(() => {
    fetchExamData();
  }, [examSubjectId]);

  async function fetchExamData() {
    if (!user?.id || !examSubjectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getTeacherExams(user.id);

      let foundExam: ExamSubjectEntry | null = null;
      for (const cls of data.classes ?? []) {
        for (const section of cls.sections ?? []) {
          for (const subject of section.subjects ?? []) {
            if (subject.exam_subject_id === examSubjectId) {
              foundExam = subject;
              break;
            }
          }
          if (foundExam) break;
        }
        if (foundExam) break;
      }

      setExamData(foundExam);
    } catch (error) {
      console.error('[TeacherExamReport] Failed to fetch exam data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Exam Report" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary[300]} />
          <Text style={styles.loadingText}>Loading exam report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!examData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Exam Report" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Exam report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const studentsWithMarks = examData.students.filter((s) => s.obtained_marks !== null);
  const totalObtained = studentsWithMarks.reduce((sum, s) => sum + (s.obtained_marks || 0), 0);
  const totalPossible = studentsWithMarks.length * examData.total_marks;
  const avgPercentage = totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : '0.0';
  const passedCount = studentsWithMarks.filter((s) => (s.obtained_marks || 0) >= examData.passing_marks).length;
  const failedCount = studentsWithMarks.length - passedCount;

  const gradeDistribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  studentsWithMarks.forEach((s) => {
    const grade = s.grade || calculateGrade(s.obtained_marks || 0, examData.total_marks);
    if (grade in gradeDistribution) {
      gradeDistribution[grade as keyof typeof gradeDistribution]++;
    }
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
        <ScreenHeader title="Exam Report" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SchoolCard school={mockSchool} />

        <View style={styles.examInfoCard}>
          <Text style={styles.examTitle}>{examData.exam_name} - {examData.subject_name}</Text>
          <Text style={styles.examSubtitle}>{examData.subject_code}</Text>
          <View style={styles.examMetaRow}>
            <View style={styles.examMeta}>
              <Text style={styles.examMetaLabel}>Total Marks</Text>
              <Text style={styles.examMetaValue}>{examData.total_marks}</Text>
            </View>
            <View style={styles.examMeta}>
              <Text style={styles.examMetaLabel}>Passing Marks</Text>
              <Text style={styles.examMetaValue}>{examData.passing_marks}</Text>
            </View>
            <View style={styles.examMeta}>
              <Text style={styles.examMetaLabel}>Total Students</Text>
              <Text style={styles.examMetaValue}>{examData.students.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color: themeColors.primary[300] }]}>{avgPercentage}%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Passed</Text>
            <Text style={[styles.statValue, { color: colors.green[200] }]}>{passedCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Failed</Text>
            <Text style={[styles.statValue, { color: colors.secondary[300] }]}>{failedCount}</Text>
          </View>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Student Results</Text>
          
          <View style={[styles.tableRow, styles.tableHeaderRow, dynStyles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableHeaderCell, styles.rollCell]}>Roll</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, styles.nameCell]}>Student Name</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, styles.marksCell]}>Obtained</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, styles.marksCell]}>Total</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, styles.statusCell]}>Status</Text>
          </View>

          {examData.students.map((student, index) => {
            const obtained = student.obtained_marks;
            const obtainedStr = obtained !== null ? obtained.toString() : '-';
            const status = obtained !== null ? (obtained >= examData.passing_marks ? 'Pass' : 'Fail') : 'Pending';
            const statusColor = status === 'Pass' ? colors.green[200] : status === 'Fail' ? colors.secondary[300] : colors.neutral[500];
            const isFail = status === 'Fail';
            const rollNo = String(index + 1).padStart(3, '0');

            return (
              <View
                key={student.student_id}
                style={[
                  styles.tableRow,
                  styles.tableBodyRow,
                  index % 2 === 1 && styles.tableRowAlt,
                  isFail && styles.tableRowFail,
                ]}
              >
                <Text style={[styles.tableCell, styles.rollCell]}>{rollNo}</Text>
                <Text style={[styles.tableCell, styles.nameCell, isFail && styles.failText]}>{student.student_name}</Text>
                <Text style={[styles.tableCell, styles.marksCell, isFail && styles.failText]}>{obtainedStr}</Text>
                <Text style={[styles.tableCell, styles.marksCell]}>{examData.total_marks}</Text>
                <Text style={[styles.tableCell, styles.statusCell, { color: statusColor }]}>{status}</Text>
              </View>
            );
          })}

          <View style={[styles.tableRow, styles.tableFooterRow]}>
            <Text style={[styles.tableCell, styles.tableFooterCell, styles.rollCell]} />
            <Text style={[styles.tableCell, styles.tableFooterCell, styles.nameCell]}>TOTAL</Text>
            <Text style={[styles.tableCell, styles.tableFooterCell, styles.marksCell, styles.totalValue]}>{totalObtained}</Text>
            <Text style={[styles.tableCell, styles.tableFooterCell, styles.marksCell, styles.totalValue]}>{totalPossible}</Text>
            <Text style={[styles.tableCell, styles.tableFooterCell, styles.statusCell]} />
          </View>
        </View>

        <TouchableOpacity style={[styles.backButton, { backgroundColor: themeColors.primary[300] }]} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backButtonText}>Back to Exams</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.light },
  scroll: { padding: 16, paddingBottom: 32 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 16, color: colors.neutral[600], marginTop: 16 },
  emptyText: { fontSize: 16, color: colors.neutral[500], textAlign: 'center' },
  schoolCard: { flexDirection: 'row', backgroundColor: colors.surface.DEFAULT, borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center' },
  schoolLogoImg: { width: 50, height: 50, borderRadius: 12, marginRight: 14 },
  schoolInfo: { flex: 1 },
  schoolName: { fontSize: 14, fontWeight: '700', color: colors.primary[500], marginBottom: 4 },
  schoolType: { fontSize: 11, color: colors.neutral[700], fontWeight: '500', marginBottom: 2 },
  schoolAddress: { fontSize: 11, color: colors.neutral[600], lineHeight: 16 },
  examInfoCard: { backgroundColor: colors.surface.DEFAULT, borderRadius: 16, padding: 16, marginBottom: 16 },
  examTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[900], marginBottom: 4 },
  examSubtitle: { fontSize: 14, color: colors.neutral[600], marginBottom: 16 },
  examMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  examMeta: { alignItems: 'center' },
  examMetaLabel: { fontSize: 12, color: colors.neutral[600], marginBottom: 4 },
  examMetaValue: { fontSize: 18, fontWeight: '700', color: colors.neutral[900] },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface.DEFAULT, borderRadius: 12, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.neutral[600], marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700' },
  gradeCard: { backgroundColor: colors.surface.DEFAULT, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[900], marginBottom: 12 },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gradeItem: { width: 60, alignItems: 'center', padding: 12, backgroundColor: colors.neutral[100], borderRadius: 8 },
  gradeLabel: { fontSize: 14, fontWeight: '700', color: colors.neutral[900], marginBottom: 4 },
  gradeCount: { fontSize: 16, fontWeight: '600', color: colors.neutral[700] },
  tableCard: { backgroundColor: colors.surface.DEFAULT, borderRadius: 16, padding: 16, marginBottom: 24, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  tableHeaderRow: { borderRadius: 8, marginBottom: 4 },
  tableBodyRow: { paddingVertical: 12 },
  tableRowAlt: { backgroundColor: colors.neutral[50] },
  tableRowFail: { backgroundColor: '#FEF2F2' },
  tableFooterRow: { backgroundColor: colors.neutral[100], borderBottomWidth: 0, borderTopWidth: 2, borderTopColor: colors.neutral[300], paddingVertical: 12 },
  tableCell: { fontSize: 13, color: colors.neutral[900], paddingVertical: 8, paddingHorizontal: 4 },
  tableHeaderCell: { fontWeight: '700', color: colors.neutral[100], fontSize: 12 },
  tableFooterCell: { fontWeight: '700', fontSize: 13 },
  rollCell: { width: 50, textAlign: 'center' },
  nameCell: { flex: 1, paddingLeft: 8 },
  marksCell: { width: 60, textAlign: 'center' },
  gradeCell: { width: 50, textAlign: 'center', fontWeight: '600' },
  statusCell: { width: 60, textAlign: 'center', fontWeight: '600' },
  failText: { color: colors.secondary[300] },
  totalValue: { color: colors.primary[300] },
  backButton: { backgroundColor: colors.primary[300], borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: colors.neutral[100] },
});
