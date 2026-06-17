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
import { ArrowLeft, Coffee, MoreCircle } from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useThemeColors } from '../../theme/ThemeContext';
import { useClassRoutineVM } from './ClassTimeTable.vm';
import type { Period, PeriodStatus } from './ClassTimeTable.vm';

// ─── Period row ───────────────────────────────────────────────────────────────

function PeriodRow({
  period,
  status,
  themeColors,
}: {
  period: Period;
  status: PeriodStatus;
  themeColors: ReturnType<typeof useThemeColors>;
}) {
  const isInProgress = status === 'in-progress';

  if (period.isBreak) {
    return (
      <View style={styles.row}>
        <View style={styles.timeCol}>
          <Text style={styles.timeStart}>{period.startTime}</Text>
          <Text style={styles.timeEnd}>{period.endTime}</Text>
        </View>
        <View style={styles.breakCard}>
          <Text style={styles.breakLabel}>{period.breakLabel}</Text>
          <Coffee color={colors.neutral[400]} size={22} variant="Linear" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.timeCol}>
        <Text style={styles.timeStart}>{period.startTime}</Text>
        <Text style={styles.timeEnd}>{period.endTime}</Text>
      </View>

      <View
        style={[
          styles.periodCard,
          isInProgress && { backgroundColor: themeColors.primary[50] ?? 'rgba(20,79,204,0.07)', borderWidth: 1, borderColor: themeColors.primary[100] },
        ]}
      >
        {isInProgress && <View style={[styles.accentBar, { backgroundColor: themeColors.primary[300] }]} />}

        <View style={styles.periodContent}>
          <View style={styles.periodLeft}>
            <Text style={styles.subjectName}>{period.subject}</Text>
            <Text style={styles.className}>{period.className}</Text>
          </View>

          {status === 'completed' && (
            <View style={styles.badgeCompleted}>
              <Text style={styles.badgeCompletedText}>Completed</Text>
            </View>
          )}
          {status === 'in-progress' && (
            <View style={[styles.badgeInProgress, { backgroundColor: themeColors.primary[300] }]}>
              <Text style={styles.badgeInProgressText}>In Progress</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ClassTimeTable() {
  const router = useRouter();
  const vm = useClassRoutineVM();
  const themeColors = useThemeColors();

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
          <Text style={styles.headerTitle}>{vm.headerInfo.title}</Text>
          <Text style={styles.headerSub}>{vm.headerInfo.subtitle}</Text>
        </View>

        <TouchableOpacity style={styles.circleBtn}>
          <MoreCircle color={colors.neutral[800]} size={20} variant="Linear" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* ── Month label ── */}
      <Text style={styles.monthLabel}>{vm.monthLabel}</Text>

      {/* ── Date strip ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStripContent}
        style={styles.dateStrip}
      >
        {vm.weekDates.map((item) => {
          const isSel =
            item.date.getDate() === vm.selectedDate.getDate() &&
            item.date.getMonth() === vm.selectedDate.getMonth() &&
            item.date.getFullYear() === vm.selectedDate.getFullYear();

          return (
            <TouchableOpacity
              key={item.date.toISOString()}
              style={[styles.dateChip, isSel && { backgroundColor: themeColors.primary[300] }]}
              onPress={() => vm.setSelectedDate(new Date(item.date))}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateDayShort, isSel && styles.dateDayShortActive]}>
                {item.dayShort}
              </Text>
              <Text style={[styles.dateNum, isSel && styles.dateNumActive]}>
                {item.date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Periods ── */}
      {vm.loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary[300]} />
        </View>
      ) : (
        <FlatList
          data={vm.periods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PeriodRow period={item} status={vm.getPeriodStatus(item)} themeColors={themeColors} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No classes scheduled</Text>
            </View>
          }
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

  // Header
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
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // Month
  monthLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[700],
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // Date strip
  dateStrip: {
    maxHeight: 88,
    marginBottom: 12,
  },
  dateStripContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  dateChip: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  dateChipActive: {
    backgroundColor: colors.primary[300],
  },
  dateDayShort: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDayShortActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  dateNumActive: {
    color: colors.neutral[100],
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Time column
  timeCol: {
    width: 52,
    alignItems: 'flex-start',
  },
  timeStart: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  timeEnd: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 2,
  },

  // Period card
  periodCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 68,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  periodCardActive: {
    backgroundColor: colors.primary[50] ?? 'rgba(20,79,204,0.07)',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.primary[300],
  },
  periodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  periodLeft: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 3,
  },
  className: {
    fontSize: 13,
    color: colors.neutral[500],
  },

  // Badges
  badgeCompleted: {
    backgroundColor: 'rgba(31,193,107,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeCompletedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green[200],
  },
  badgeInProgress: {
    backgroundColor: colors.primary[300],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeInProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[100],
  },

  // Break card
  breakCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  breakLabel: {
    fontSize: 14,
    color: colors.neutral[400],
    fontWeight: '500',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: colors.neutral[400],
  },
});
