import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import {
  ClipboardText,
  Clock,
  MoreCircle,
  TickCircle,
} from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader, CircleIconBtn } from '../../components/ui/ScreenHeader';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { SearchInput } from '../../components/ui/SearchInput';
import { useExamVM } from './Exam.vm';
import { useAuth } from '../../contexts/AuthContext';
import type { ExamFilter, ExamItem, ExamStudent } from './Exam.vm';

// ─── Filter Chips ─────────────────────────────────────────────────────────────

const FILTERS: { key: ExamFilter; label: string }[] = [
  { key: 'all', label: 'All Exams' },
  { key: 'pending', label: 'Pending' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'verified', label: 'Verified' },
];

function FilterChips({
  active,
  onChange,
}: {
  active: ExamFilter;
  onChange: (f: ExamFilter) => void;
}) {
  return (
    <View style={listStyles.filterWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={listStyles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[listStyles.chip, active === f.key && listStyles.chipActive]}
            onPress={() => onChange(f.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                listStyles.chipText,
                active === f.key && listStyles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({
  exam,
  onAction,
}: {
  exam: ExamItem;
  onAction: () => void;
}) {
  const isPending = exam.status === 'in-progress' || exam.status === 'not-started';
  const isSubmitted = exam.status === 'submitted';
  const isVerified = exam.status === 'verified';

  const progressText =
    exam.status === 'in-progress' ? `${exam.gradedCount}/${exam.studentCount} Graded` :
      exam.status === 'not-started' ? 'Not Started' :
        exam.status === 'submitted' ? 'Wait for Coordinator Approval' :
          'Published to Students';

  const actionLabel =
    exam.status === 'in-progress' ? 'Continue Entry Marks' :
      exam.status === 'not-started' ? 'Enter Marks' :
        exam.status === 'submitted' ? 'View Details' :
          'View Report';

  return (
    <View style={listStyles.card}>
      {/* Top row */}
      <View style={listStyles.cardTopRow}>
        <View style={listStyles.cardInfo}>
          <Text style={listStyles.examName}>{exam.name}</Text>
          <Text style={listStyles.examMeta}>
            Class {exam.className} | {exam.studentCount} Students
          </Text>
        </View>
        {(isSubmitted || isVerified) && (
          <Badge
            label={isSubmitted ? 'Submitted' : 'Verified'}
            variant="green"
          />
        )}
      </View>

      <View style={listStyles.cardDivider} />

      {/* Bottom row */}
      <View style={listStyles.cardBottomRow}>
        <Text style={listStyles.progressText}>{progressText}</Text>
        <TouchableOpacity
          style={[
            listStyles.actionBtn,
            isPending && listStyles.actionBtnPrimary,
          ]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text
            style={[
              listStyles.actionBtnText,
              isPending && listStyles.actionBtnTextPrimary,
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── View 1: Student Exam List ────────────────────────────────────────────────

function StudentExamList({ vm }: { vm: ReturnType<typeof useExamVM> }) {
  const router = useRouter();
  const upcomingExams = vm.filteredExams.filter((e) => e.status === 'not-started');

  function Section({
    title,
    data,
  }: {
    title: string;
    data: ExamItem[];
  }) {
    if (data.length === 0) return null;
    return (
      <>
        <Text style={listStyles.sectionTitle}>{title}</Text>
        {data.map((exam) => (
          <View key={exam.id} style={listStyles.card}>
            <View style={listStyles.cardTopRow}>
              <View style={listStyles.cardInfo}>
                <Text style={listStyles.examName}>{exam.name}</Text>
                <Text style={listStyles.examMeta}>
                  Class {exam.className} | {exam.studentCount} Students
                </Text>
              </View>
            </View>
            <View style={listStyles.cardDivider} />
            <View style={listStyles.cardBottomRow}>
              <Text style={listStyles.progressText}>Upcoming</Text>
            </View>
          </View>
        ))}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader
        title="Exams"
        onBack={() => router.navigate('/(tabs)')}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={listStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Upcoming Exams" data={upcomingExams} />
        {upcomingExams.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No upcoming exams</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── View 1: Exam List ────────────────────────────────────────────────────────

function ExamList({ vm }: { vm: ReturnType<typeof useExamVM> }) {
  const router = useRouter();
  const pending = vm.filteredExams.filter(
    (e) => e.status === 'in-progress' || e.status === 'not-started',
  );
  const submitted = vm.filteredExams.filter((e) => e.status === 'submitted');
  const verified = vm.filteredExams.filter((e) => e.status === 'verified');

  function Section({
    title,
    data,
  }: {
    title: string;
    data: ExamItem[];
  }) {
    if (data.length === 0) return null;
    return (
      <>
        <Text style={listStyles.sectionTitle}>{title}</Text>
        {data.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onAction={() => vm.openExam(exam)}
          />
        ))}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader
        title="Exams"
        onBack={() => router.navigate('/(tabs)')}
      />

      <FilterChips active={vm.activeFilter} onChange={vm.setActiveFilter} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={listStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Pending Entry" data={pending} />
        <Section title="Submitted" data={submitted} />
        <Section title="Verified Exams" data={verified} />
        {vm.filteredExams.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No exams found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Student Mark Row ─────────────────────────────────────────────────────────

function StudentMarkRow({
  student,
  mark,
  comment,
  maxMarks,
  readonly,
  onChangeMark,
  onChangeComment,
}: {
  student: ExamStudent;
  mark: string;
  comment: string;
  maxMarks: number;
  readonly?: boolean;
  onChangeMark?: (v: string) => void;
  onChangeComment?: (v: string) => void;
}) {
  const hasmark = mark.trim() !== '';
  const markNum = hasmark ? Number(mark) : null;
  const isFail = markNum !== null && markNum < 35;

  return (
    <>
      <View style={enterStyles.row}>
        {/* Avatar */}
        <View style={enterStyles.avatar}>
          <Text style={enterStyles.avatarText}>
            {student.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </Text>
        </View>

        {/* Info */}
        <View style={enterStyles.info}>
          <Text style={enterStyles.studentName}>{student.name}</Text>
          <Text style={enterStyles.rollNo}>Roll No: {student.rollNo}</Text>
        </View>

        {/* Mark box */}
        {readonly ? (
          /* Preview/readonly view */
          hasmark ? (
            <View style={enterStyles.marksBox}>
              <View style={[enterStyles.markInput, isFail && enterStyles.markInputFail]}>
                <Text style={[enterStyles.markValue, isFail && enterStyles.markValueFail]}>{mark}</Text>
              </View>
              <View style={[enterStyles.markInput, enterStyles.markMax]}>
                <Text style={enterStyles.markMaxText}>{maxMarks}</Text>
              </View>
            </View>
          ) : (
            <View style={enterStyles.pendingBox}>
              <Text style={enterStyles.pendingText}>Pending</Text>
            </View>
          )
        ) : (
          /* Editable view */
          <View style={enterStyles.marksBox}>
            <TextInput
              style={[enterStyles.markInput, isFail && enterStyles.markInputFail, isFail && { color: colors.secondary[300] }]}
              value={mark}
              onChangeText={onChangeMark}
              keyboardType="number-pad"
              maxLength={3}
              placeholder=""
              placeholderTextColor={colors.neutral[400]}
            />
            <View style={[enterStyles.markInput, enterStyles.markMax]}>
              <Text style={enterStyles.markMaxText}>{maxMarks}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Comments — shown for every student in edit mode once they have a mark */}
      {!readonly && hasmark && (
        <View style={enterStyles.commentSection}>
          <Text style={enterStyles.commentLabel}>Comments</Text>
          <TextInput
            style={enterStyles.commentInput}
            value={comment}
            onChangeText={onChangeComment}
            placeholder="Write a case study"
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      <View style={enterStyles.rowDivider} />
    </>
  );
}

// ─── View 2: Enter Marks ──────────────────────────────────────────────────────

function EnterMarks({ vm }: { vm: ReturnType<typeof useExamVM> }) {
  const exam = vm.selectedExam!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader
        title="Enter Marks"
        onBack={vm.goBackToList}
        rightElement={
          <CircleIconBtn>
            <MoreCircle color={colors.neutral[800]} size={20} variant="Linear" />
          </CircleIconBtn>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Blue banner */}
        <View style={enterStyles.banner}>
          <View style={enterStyles.bannerLeft}>
            <Text style={enterStyles.bannerExamName}>{exam.name}</Text>
            <Text style={enterStyles.bannerClass}>
              Class {exam.className} Section
            </Text>
          </View>
          <View style={enterStyles.bannerRight}>
            <Text style={enterStyles.bannerMax}>{exam.maxMarks}</Text>
            <Text style={enterStyles.bannerMaxLabel}>Max Marks</Text>
          </View>
        </View>

        {/* Student count + search */}
        <View style={enterStyles.searchRow}>
          <Text style={enterStyles.studentCount}>
            Student ({vm.students.length})
          </Text>
          <SearchInput
            value={vm.searchQuery}
            onChangeText={vm.setSearchQuery}
          />
        </View>

        {/* Student list */}
        <FlatList
          data={vm.filteredStudents}
          keyExtractor={(s) => s.id}
          style={enterStyles.list}
          contentContainerStyle={[enterStyles.listContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          renderItem={({ item }) => (
            <StudentMarkRow
              student={item}
              mark={vm.marks[item.id] ?? ''}
              comment={vm.comments[item.id] ?? ''}
              maxMarks={exam.maxMarks}
              onChangeMark={(v) => vm.setMark(item.id, v)}
              onChangeComment={(v) => vm.setComment(item.id, v)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No students found</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* Bottom buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={vm.goToPreview}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Review & Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── View 3: Preview & Submission ────────────────────────────────────────────

function PreviewSubmission({ vm }: { vm: ReturnType<typeof useExamVM> }) {
  const exam = vm.selectedExam!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader
        title="Preview & Submission"
        onBack={vm.goBackToEnter}
        showDivider
      />

      <ScrollView
        contentContainerStyle={previewStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat cards */}
        <View style={previewStyles.statsRow}>
          <StatCard
            value={vm.gradedStudents.length}
            label="Graded"
            valueColor={colors.primary[300]}
          />
          <StatCard
            value={vm.pendingStudents.length}
            label="Pending"
          />
          <StatCard
            value={vm.avgMark}
            label="Avg. Mark"
            valueColor={colors.green[200]}
          />
        </View>

        {/* Warning banner */}
        {vm.pendingStudents.length > 0 && (
          <View style={previewStyles.warnCard}>
            <Clock color={colors.neutral[500]} size={20} variant="Linear" />
            <Text style={previewStyles.warnText}>
              You have ungraded students. You can submit now and finish grading later
            </Text>
          </View>
        )}

        {/* Student count + search */}
        <View style={enterStyles.searchRow}>
          <Text style={enterStyles.studentCount}>
            Student ({vm.students.length})
          </Text>
          <SearchInput
            value={vm.searchQuery}
            onChangeText={vm.setSearchQuery}
          />
        </View>

        {/* Readonly student list */}
        <View style={previewStyles.listCard}>
          {vm.filteredStudents.map((student) => (
            <StudentMarkRow
              key={student.id}
              student={student}
              mark={vm.marks[student.id] ?? ''}
              comment=""
              maxMarks={exam.maxMarks}
              readonly
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={vm.goBackToEnter}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>Edit Marks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={vm.submitMarks}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Confirm & Submit</Text>
        </TouchableOpacity>
      </View>
      {vm.canApproveMarks && (
        <View style={[styles.bottomRow, { borderTopWidth: 0, paddingTop: 0 }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#1fc16b' }]}
            onPress={vm.approveMarks}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Approve Marks</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── View 4: Submitted ───────────────────────────────────────────────────────

function SubmittedView({ vm }: { vm: ReturnType<typeof useExamVM> }) {
  const exam = vm.selectedExam!;

  return (
    <SafeAreaView style={[styles.safe, doneStyles.safe]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f5f7" />

      <ScrollView
        contentContainerStyle={doneStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration using iconsax icons */}
        <View style={doneStyles.illustration}>
          <View style={doneStyles.iconCircle}>
            <ClipboardText color={colors.primary[300]} size={60} variant="Bold" />
          </View>
          <View style={doneStyles.tickBadge}>
            <TickCircle color={colors.green[200]} size={32} variant="Bold" />
          </View>
        </View>

        <Text style={doneStyles.title}>Submitted !</Text>
        <Text style={doneStyles.subtitle}>
          Marks for {exam.name} have been{'\n'}successfully updated.
        </Text>

        {/* Summary card */}
        <View style={doneStyles.summaryCard}>
          <SummaryRow label="Class" value={`${exam.className}`} />
          <SummaryRow label="Total Students" value={`${exam.studentCount}`} />
          <SummaryRow
            label="Marks Updated"
            value={`${vm.gradedStudents.length}`}
            valueColor={colors.primary[300]}
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.primaryBtn, doneStyles.btn]}
          onPress={vm.goBackToList}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Back to Exams</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.outlineBtn, doneStyles.btn]}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>View Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={doneStyles.summaryRow}>
      <Text style={doneStyles.summaryLabel}>{label}</Text>
      <Text style={[doneStyles.summaryValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Root Screen ──────────────────────────────────────────────────────────────

export function ExamScreen() {
  const vm = useExamVM();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  if (isStudent) {
    return <StudentExamList vm={vm} />;
  }

  if (vm.view === 'enter') return <EnterMarks vm={vm} />;
  if (vm.view === 'preview') return <PreviewSubmission vm={vm} />;
  if (vm.view === 'done') return <SubmittedView vm={vm} />;
  return <ExamList vm={vm} />;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  flex: { flex: 1 },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 15,
    color: colors.neutral[400],
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface.light,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  outlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[100],
  },
});

// ─── Exam List Styles ─────────────────────────────────────────────────────────

const listStyles = StyleSheet.create({
  filterWrap: {
    height: 60,                // fixed height = chip height (36) + vertical padding (12+12)
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'flex-start',  // pins chips to top so they never shift on press
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary[300],
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  chipTextActive: {
    color: colors.neutral[100],
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: { flex: 1, marginRight: 8 },
  examName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  examMeta: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: colors.neutral[500],
    flex: 1,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  actionBtnTextPrimary: {
    color: colors.neutral[100],
  },
});

// ─── Enter Marks Styles ───────────────────────────────────────────────────────

const enterStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[300],
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  bannerLeft: { flex: 1 },
  bannerExamName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.neutral[100],
    marginBottom: 4,
  },
  bannerClass: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  bannerRight: { alignItems: 'flex-end' },
  bannerMax: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral[100],
  },
  bannerMaxLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  studentCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    flexShrink: 0,
  },
  list: { flex: 1 },
  listContent: {
    backgroundColor: colors.neutral[100],
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  info: { flex: 1 },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  rollNo: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  marksBox: {
    flexDirection: 'row',
    gap: 4,
  },
  markInput: {
    width: 52,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  markValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  markMax: {
    backgroundColor: colors.neutral[200],
    borderColor: colors.neutral[200],
  },
  markMaxText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  markInputFail: {
    borderColor: colors.secondary[300],
    backgroundColor: 'rgba(228,37,39,0.06)',
  },
  markValueFail: {
    color: colors.secondary[300],
  },
  pendingBox: {
    width: 110,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingText: {
    fontSize: 13,
    color: colors.neutral[400],
    fontWeight: '500',
  },
  commentSection: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 6,
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.neutral[800],
    minHeight: 80,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 14,
  },
});

// ─── Preview Styles ───────────────────────────────────────────────────────────

const previewStyles = StyleSheet.create({
  scroll: {
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 14,
  },
  warnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,200,100,0.15)',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  warnText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 19,
  },
  listCard: {
    backgroundColor: colors.neutral[100],
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});

// ─── Done / Submitted Styles ──────────────────────────────────────────────────

const doneStyles = StyleSheet.create({
  safe: {
    backgroundColor: '#f4f5f7',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  illustration: {
    position: 'relative',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(20,79,204,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#f4f5f7',
    borderRadius: 18,
    padding: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  summaryCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.neutral[500],
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  btn: {
    alignSelf: 'stretch',
    flex: 0,
    marginBottom: 12,
  },
});
