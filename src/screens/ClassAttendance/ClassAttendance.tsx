import React from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar1,
  InfoCircle,
  TickCircle,
} from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAttendanceVM } from './ClassAttendance.vm';
import type { AttendanceStep, Student } from './ClassAttendance.vm';

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS: { num: number; label: string }[] = [
  { num: 1, label: 'Mark' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Submit' },
];

function StepIndicator({ current }: { current: AttendanceStep }) {
  // After submission current===4: all 3 steps are done/green
  const isAllDone = current > 3;

  const line1Done = current > 1 || isAllDone;
  const line2Done = current > 2 || isAllDone;

  return (
    <View style={stepStyles.container}>
      {/* Single row: circle — line — circle — line — circle */}
      <View style={stepStyles.stepsRow}>
        {STEPS.map((s, idx) => {
          const done = isAllDone ? true : s.num < current;
          const active = !isAllDone && s.num === current;
          const label = done && s.num === 3 ? 'Done' : s.label;
          const lineDone = idx === 0 ? line1Done : line2Done;

          return (
            <React.Fragment key={s.num}>
              {/* Connector line BEFORE steps 2 and 3 */}
              {idx > 0 && (
                <View
                  style={[
                    stepStyles.line,
                    lineDone && stepStyles.lineDone,
                  ]}
                />
              )}

              <View style={stepStyles.stepCol}>
                <View
                  style={[
                    stepStyles.circle,
                    done && stepStyles.circleDone,
                    active && stepStyles.circleActive,
                  ]}
                >
                  {done ? (
                    <TickCircle color={colors.neutral[100]} size={22} variant="Bold" />
                  ) : (
                    <Text
                      style={[
                        stepStyles.circleText,
                        active && stepStyles.circleTextActive,
                      ]}
                    >
                      {s.num}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    stepStyles.label,
                    done && stepStyles.labelDone,
                    active && stepStyles.labelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 40;

const stepStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  // Single row holds: stepCol — line — stepCol — line — stepCol
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // so labels don't stretch the line vertically
  },

  // Line sits between two stepCols, vertically centered to the circle
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[300],
    marginTop: CIRCLE_SIZE / 2 - 1, // shift down by half circle so line bisects circle
  },
  lineDone: {
    backgroundColor: colors.green[200],
  },

  // Each step column: circle + label stacked
  stepCol: {
    alignItems: 'center',
    gap: 6,
    minWidth: CIRCLE_SIZE,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: colors.green[200],
  },
  circleActive: {
    backgroundColor: colors.primary[300],
  },
  circleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  circleTextActive: {
    color: colors.neutral[100],
  },
  label: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
    textAlign: 'center',
  },
  labelDone: {
    color: colors.green[200],
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary[300],
    fontWeight: '700',
  },
});

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({
  student,
  onMark,
  readonly,
}: {
  student: Student;
  onMark?: (id: string, status: 'present' | 'absent') => void;
  readonly?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      {/* Avatar */}
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarText}>{student.avatarInitials}</Text>
      </View>

      {/* Name + roll */}
      <View style={rowStyles.info}>
        <Text style={rowStyles.name}>{student.name}</Text>
        <Text style={rowStyles.roll}>Roll No: {student.rollNo}</Text>
      </View>

      {/* P / A buttons */}
      <View style={rowStyles.paRow}>
        <TouchableOpacity
          style={[
            rowStyles.paBtn,
            student.status === 'present' && rowStyles.paBtnPresent,
          ]}
          onPress={() => !readonly && onMark?.(student.id, 'present')}
          activeOpacity={readonly ? 1 : 0.75}
        >
          <Text
            style={[
              rowStyles.paBtnText,
              student.status === 'present' && rowStyles.paBtnTextActive,
            ]}
          >
            P
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            rowStyles.paBtn,
            student.status === 'absent' && rowStyles.paBtnAbsent,
          ]}
          onPress={() => !readonly && onMark?.(student.id, 'absent')}
          activeOpacity={readonly ? 1 : 0.75}
        >
          <Text
            style={[
              rowStyles.paBtnText,
              student.status === 'absent' && rowStyles.paBtnTextAbsent,
            ]}
          >
            A
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  roll: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  paRow: {
    flexDirection: 'row',
    gap: 6,
  },
  paBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paBtnPresent: {
    backgroundColor: colors.green[200],
  },
  paBtnAbsent: {
    backgroundColor: colors.secondary[300],
  },
  paBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  paBtnTextActive: {
    color: colors.neutral[100],
  },
  paBtnTextAbsent: {
    color: colors.neutral[100],
  },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  valueColor,
}: {
  value: number;
  label: string;
  valueColor?: string;
}) {
  return (
    <View style={statStyles.card}>
      <Text style={[statStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: colors.neutral[500],
  },
});

// ─── Shared Header ────────────────────────────────────────────────────────────

function ScreenHeader({ onBack, className, sectionName }: { onBack: () => void; className?: string; sectionName?: string }) {
  const label = className && sectionName ? `Today ${className} - ${sectionName}` : 'Today';
  return (
    <>
      <View style={sharedStyles.header}>
        <TouchableOpacity
          style={sharedStyles.circleBtn}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
        </TouchableOpacity>
        <View style={sharedStyles.headerCenter}>
          <Text style={sharedStyles.headerTitle}>Attendance</Text>
          <Text style={sharedStyles.headerSub}>{label}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={sharedStyles.divider} />
    </>
  );
}

const sharedStyles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  headerSub: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 16,
  },
});

// ─── Step 1 — Mark ────────────────────────────────────────────────────────────

function StepMark({
  vm,
}: {
  vm: ReturnType<typeof useAttendanceVM>;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        <FlatList
          data={vm.students}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <StudentRow student={item} onMark={vm.mark} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.studentListContent}
        />
      </View>

      {/* Bottom buttons — always show "All Present"; show approve or review+submit based on role */}
      {vm.canApproveAttendance ? (
        <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={vm.markAllPresent}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>All Present</Text>
          </TouchableOpacity>

          {vm.alreadyApproved ? (
            <View style={[styles.primaryBtn, { backgroundColor: colors.green[200] }]}>
              <Text style={styles.primaryBtnText}>✓ Approved</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#1fc16b' }]}
              onPress={vm.approveAttendance}
              disabled={vm.approving}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {vm.approving ? 'Approving...' : 'Approve'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={vm.markAllPresent}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>All Present</Text>
          </TouchableOpacity>

          {/* For teacher role: disable until all students are marked */}
          {(() => {
            const disabled = vm.isTeacher && vm.attendanceAlreadySubmitted;
            return (
              <TouchableOpacity
                style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled, disabled && { height: 60 }]}
                onPress={disabled ? undefined : vm.goToReview}
                activeOpacity={disabled ? 1 : 0.85}
                disabled={disabled}
              >
                <Text style={styles.primaryBtnText}>Review & Submit</Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      )}
    </View>
  );
}

// ─── Step 2 — Review ─────────────────────────────────────────────────────────

function StepReview({
  vm,
}: {
  vm: ReturnType<typeof useAttendanceVM>;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.flex}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={vm.totalCount} label="Total" />
        <StatCard value={vm.presentCount} label="Present" valueColor={colors.green[200]} />
        <StatCard value={vm.absentCount} label="Absent" valueColor={colors.secondary[300]} />
      </View>

      {/* Present students */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Present Students</Text>
        <TouchableOpacity><Text style={styles.viewList}>View List</Text></TouchableOpacity>
      </View>
      <View style={styles.listCard}>
        {vm.presentStudents.map((s) => (
          <StudentRow key={s.id} student={s} readonly />
        ))}
      </View>

      {/* Absent students */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Absent Students</Text>
        <TouchableOpacity><Text style={styles.viewList}>View List</Text></TouchableOpacity>
      </View>
      <View style={styles.listCard}>
        {vm.absentStudents.map((s) => (
          <StudentRow key={s.id} student={s} readonly />
        ))}
      </View>

      {/* Warning notice */}
      <View style={styles.noticeCard}>
        <InfoCircle color={colors.neutral[500]} size={20} variant="Linear" />
        <Text style={styles.noticeText}>
          Please review the list carefully. Once submitted, you will need coordinator or principal approval to make changes
        </Text>
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.primaryBtn, styles.submitBtn]}
        onPress={vm.submitAttendance}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Submit Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Step 3 — Done ────────────────────────────────────────────────────────────

function StepDone({
  vm,
  onDashboard,
  onViewReport,
}: {
  vm: ReturnType<typeof useAttendanceVM>;
  onDashboard: () => void;
  onViewReport: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.doneContent, { paddingBottom: insets.bottom + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Calendar + tick icon */}
      <View style={styles.doneIconWrapper}>
        <Calendar1 color={colors.primary[300]} size={72} variant="Bold" />
        <View style={styles.doneTickBadge}>
          <TickCircle color={colors.green[200]} size={30} variant="Bold" />
        </View>
      </View>

      <Text style={styles.doneTitle}>Attendance Submitted</Text>
      <Text style={styles.doneSub}>
        Attendance for {vm.className} - {vm.sectionName}{'\n'}has been successfully recorded for today
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={vm.totalCount} label="Total" />
        <StatCard value={vm.presentCount} label="Present" valueColor={colors.green[200]} />
        <StatCard value={vm.absentCount} label="Absent" valueColor={colors.secondary[300]} />
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.primaryBtn, { marginBottom: 12 }]}
        onPress={onDashboard}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineBtn}
        activeOpacity={0.8}
        onPress={onViewReport}
      >
        <Text style={styles.outlineBtnText}>View Attendance Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ClassAttendance() {
  const router = useRouter();
  const vm = useAttendanceVM();

  function handleBack() {
    if (vm.step === 2) { vm.goBackToMark(); }
    else { router.back(); }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <ScreenHeader onBack={handleBack} className={vm.className} sectionName={vm.sectionName} />

      {/* Step indicator */}
      <View style={styles.stepCard}>
        <StepIndicator current={vm.step} />
      </View>

      {vm.step === 1 && <StepMark vm={vm} />}
      {vm.step === 2 && <StepReview vm={vm} />}
      {(vm.step === 3 || vm.step === 4) && (
        <StepDone
          vm={vm}
          onDashboard={() => router.replace('/(tabs)')}
          onViewReport={() => router.push({
            pathname: '/view-attendance',
            params: {
              classId: vm.classId,
              sectionId: vm.sectionId,
            }
          })}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  flex: { flex: 1 },

  // Step indicator card
  stepCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'visible',
  },

  // Student list
  studentListContent: {
    backgroundColor: colors.neutral[100],
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 8,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  viewList: {
    fontSize: 13,
    color: colors.primary[300],
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // List card
  listCard: {
    marginHorizontal: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // Notice card
  noticeCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primary[50] ?? 'rgba(20,79,204,0.07)',
    borderRadius: 12,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 19,
  },

  // Bottom row (step 1)
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface.light,
  },

  // Buttons
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
  primaryBtnDisabled: {
    backgroundColor: colors.neutral[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  primaryBtnSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[200],
    marginTop: 2,
  },
  approveSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.surface.light,
  },
  approveBtn: {
    height: 52,
    borderRadius: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtn: {
    marginHorizontal: 16,
    flex: 0,
  },

  // Done screen
  doneContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
    alignItems: 'stretch',
  },
  doneIconWrapper: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  doneTickBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surface.light,
    borderRadius: 16,
  },
  doneTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 10,
  },
  doneSub: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
});

