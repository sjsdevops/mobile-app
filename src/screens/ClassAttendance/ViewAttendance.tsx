import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DocumentDownload } from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import {
  LOW_ATTENDANCE,
  REPORT_SUMMARY,
  WEEKLY_DATA,
} from './ViewAttendance.vm';
import type { LowAttendanceStudent, WeekDay } from './ViewAttendance.vm';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_MAX_HEIGHT = 130; // px — tallest possible bar

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarGroup({ item }: { item: WeekDay }) {
  const presentH = Math.round((item.present / 100) * CHART_MAX_HEIGHT);
  const absentH  = Math.round((item.absent  / 100) * CHART_MAX_HEIGHT);

  return (
    <View style={chartStyles.group}>
      {/* Bars aligned to bottom */}
      <View style={chartStyles.barsRow}>
        <View style={[chartStyles.bar, chartStyles.barPresent, { height: presentH }]} />
        <View style={[chartStyles.bar, chartStyles.barAbsent,  { height: absentH  }]} />
      </View>
      <Text style={chartStyles.dayLabel}>{item.day}</Text>
    </View>
  );
}

function WeeklyChart() {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Weekly Overview</Text>
      <View style={styles.chartDivider} />
      <Text style={styles.weekLabel}>{REPORT_SUMMARY.weekLabel}</Text>

      <View style={chartStyles.canvas}>
        {WEEKLY_DATA.map((d) => (
          <BarGroup key={d.day} item={d} />
        ))}
      </View>
    </View>
  );
}

// ─── Need Attention Row ───────────────────────────────────────────────────────

function AttentionRow({ student }: { student: LowAttendanceStudent }) {
  return (
    <View style={styles.attentionRow}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {student.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </Text>
      </View>

      {/* Name + progress bar */}
      <View style={styles.attentionInfo}>
        <View style={styles.attentionNameRow}>
          <Text style={styles.attentionName}>{student.name}</Text>
          <Text style={styles.attentionPct}>{student.percentage}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${student.percentage}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ViewAttendance() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <Text style={styles.headerSub}>{REPORT_SUMMARY.className}</Text>
        </View>

        <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}>
          <DocumentDownload color={colors.neutral[800]} size={20} variant="Linear" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top stat cards ── */}
        <View style={styles.statsRow}>
          <StatCard
            value={`${REPORT_SUMMARY.averageAttendance}%`}
            label="Average Attendance"
          />
          <StatCard
            value={`${REPORT_SUMMARY.absentToday}%`}
            label="Absent Today"
          />
        </View>

        {/* ── Weekly Overview bar chart ── */}
        <WeeklyChart />

        {/* ── Need Attention ── */}
        <Text style={styles.needAttentionTitle}>Need Attention</Text>

        <View style={styles.attentionList}>
          {LOW_ATTENDANCE.map((s) => (
            <AttentionRow key={s.id} student={s} />
          ))}
        </View>
      </ScrollView>

      {/* ── Export button (pinned at bottom) ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Export', 'Full report exported!')}
        >
          <Text style={styles.exportBtnText}>Export Full Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Chart Styles ─────────────────────────────────────────────────────────────

const chartStyles = StyleSheet.create({
  canvas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_MAX_HEIGHT + 24, // + day label space
    paddingTop: 8,
  },
  group: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 10,
    borderRadius: 4,
  },
  barPresent: {
    backgroundColor: colors.primary[300],
  },
  barAbsent: {
    backgroundColor: colors.primary[100],
  },
  dayLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '500',
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.surface.light,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
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
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },

  // Stat cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: 'center',
  },

  // Chart card
  chartCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  chartDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 13,
    color: colors.neutral[400],
    marginBottom: 4,
  },

  // Need Attention
  needAttentionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginTop: 4,
  },
  attentionList: {
    gap: 18,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  attentionInfo: {
    flex: 1,
    gap: 6,
  },
  attentionNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attentionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  attentionPct: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary[300],
  },

  // Footer / Export button
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f4f5f7',
  },
  exportBtn: {
    backgroundColor: colors.primary[300],
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[100],
  },
});
