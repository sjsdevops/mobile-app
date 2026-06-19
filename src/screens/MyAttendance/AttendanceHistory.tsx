import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDown2,
  ArrowLeft,
  ArrowRight2,
  Clock,
  LoginCurve,
  LogoutCurve,
} from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAttendanceHistoryVM } from './AttendanceHistory.vm';
import type { AttendanceEntry } from './AttendanceHistory.vm';

function EventRow({ item }: { item: AttendanceEntry }) {
  const isAbsent = item.status === 'Absent';

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.dateLabel}</Text>
        <View style={[styles.statusPill, isAbsent ? styles.absentPill : styles.presentPill]}>
          <Text style={[styles.statusText, isAbsent ? styles.absentText : styles.presentText]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <LoginCurve color={colors.primary[300]} size={18} variant="Bold" />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Punch In</Text>
            <Text style={styles.detailValue}>{item.punchIn ?? 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <LogoutCurve color={colors.primary[300]} size={18} variant="Bold" />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Punch Out</Text>
            <Text style={styles.detailValue}>{item.punchOut ?? 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Clock color={colors.primary[300]} size={18} variant="Bold" />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>{item.total ?? '0h 00 Min'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function AttendanceHistoryScreen() {
  const router = useRouter();
  const vm = useAttendanceHistoryVM();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance History</Text>
        </View>

      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => vm.setMonthPickerVisible(true)} activeOpacity={0.75}>
          <Text style={styles.filterText}>{vm.monthLabel}</Text>
          <ArrowDown2 color={colors.neutral[600]} size={16} variant="Linear" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={vm.onApplyLeave} activeOpacity={0.85}>
          <Text style={styles.actionButtonText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{vm.monthTitle}</Text>
            <Text style={styles.summaryCount}>Total {vm.totalDays} Days</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{vm.presentCount}</Text>
              <Text style={styles.summaryStatLabel}>Present</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{vm.absentCount}</Text>
              <Text style={styles.summaryStatLabel}>Absent</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{vm.paidLeaveCount}</Text>
              <Text style={styles.summaryStatLabel}>Paid Leave</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{vm.holidayCount}</Text>
              <Text style={styles.summaryStatLabel}>Holiday</Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          {vm.history.map((item) => (
            <EventRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Month Picker Bottom Sheet */}
      <Modal visible={vm.monthPickerVisible} transparent animationType="fade" onRequestClose={() => vm.setMonthPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => vm.setMonthPickerVisible(false)}>
          <View style={styles.modalSheet}>
            {/* Year navigation */}
            <View style={styles.yearRow}>
              <TouchableOpacity onPress={vm.onPrevYear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowLeft color={colors.neutral[800]} size={20} variant="Linear" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{vm.pickerYear}</Text>
              <TouchableOpacity onPress={vm.onNextYear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowRight2 color={colors.neutral[800]} size={20} variant="Linear" />
              </TouchableOpacity>
            </View>

            {/* Month grid */}
            <View style={styles.monthGrid}>
              {vm.monthOptions.map((m) => (
                <TouchableOpacity
                  key={m.index}
                  style={[styles.monthCell, vm.selectedMonth === m.index && vm.pickerYear === vm.selectedYear && styles.monthCellActive]}
                  onPress={() => vm.onSelectMonth(m.index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.monthCellText, vm.selectedMonth === m.index && vm.pickerYear === vm.selectedYear && styles.monthCellTextActive]}>
                    {m.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface.light,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: colors.surface.light,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    flex: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  actionButton: {
    backgroundColor: colors.primary[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: colors.primary[300],
    marginTop: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[100],
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryStatItem: {
    flex: 1,
    minWidth: 72,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  summaryStatLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.neutral[100],
    opacity: 0.9,
  },
  listSection: {
    marginTop: 18,
    gap: 14,
  },
  entryCard: {
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presentPill: {
    backgroundColor: colors.green[100],
  },
  absentPill: {
    backgroundColor: colors.secondary.alpha,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presentText: {
    color: colors.green[200],
  },
  absentText: {
    color: colors.secondary[300],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  detailValue: {
    marginTop: 4,
    fontSize: 14,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthCell: {
    width: '22%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  monthCellActive: {
    backgroundColor: colors.primary[300],
  },
  monthCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  monthCellTextActive: {
    color: '#fff',
  },
});
