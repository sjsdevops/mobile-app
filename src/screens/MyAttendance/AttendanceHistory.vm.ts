import { useMemo } from 'react';
import { Alert } from 'react-native';

export type AttendanceStatus = 'Present' | 'Absent' | 'Paid Leave' | 'Holiday';

export type AttendanceEntry = {
  id: string;
  dateLabel: string;
  status: AttendanceStatus;
  punchIn?: string;
  punchOut?: string;
  total?: string;
};

const ATTENDANCE_HISTORY: AttendanceEntry[] = [
  {
    id: '2026-02-20',
    dateLabel: 'Feb 20, Tue',
    status: 'Present',
    punchIn: '09:00 AM',
    punchOut: '04:30 PM',
    total: '07h 15 Min',
  },
  {
    id: '2026-02-21',
    dateLabel: 'Feb 21, Wed',
    status: 'Present',
    punchIn: '09:05 AM',
    punchOut: '04:40 PM',
    total: '07h 35 Min',
  },
  {
    id: '2026-02-22',
    dateLabel: 'Feb 22, Thu',
    status: 'Present',
    punchIn: '09:10 AM',
    punchOut: '04:45 PM',
    total: '07h 35 Min',
  },
  {
    id: '2026-02-23',
    dateLabel: 'Feb 23, Fri',
    status: 'Absent',
  },
  {
    id: '2026-02-24',
    dateLabel: 'Feb 24, Sat',
    status: 'Present',
    punchIn: '09:00 AM',
    punchOut: '04:30 PM',
    total: '07h 30 Min',
  },
  {
    id: '2026-02-25',
    dateLabel: 'Feb 25, Sun',
    status: 'Present',
    punchIn: '09:00 AM',
    punchOut: '04:30 PM',
    total: '07h 30 Min',
  },
];

export function useAttendanceHistoryVM() {
  const monthLabel = 'This Month';
  const monthTitle = 'February 2026';
  const totalDays = 28;

  const presentCount = useMemo(
    () => 18,
    [],
  );
  const absentCount = useMemo(
    () => 2,
    [],
  );
  const paidLeaveCount = useMemo(
    () => 0,
    [],
  );
  const holidayCount = useMemo(
    () => 0,
    [],
  );

  function onExport() {
    Alert.alert('Download', 'Your attendance history has been downloaded.');
  }

  function onApplyLeave() {
    Alert.alert('Apply Leave', 'Leave application will be available soon.');
  }

  function onChangeMonth() {
    Alert.alert('Filter', 'Month filter is not available in this demo.');
  }

  return {
    monthLabel,
    monthTitle,
    totalDays,
    presentCount,
    absentCount,
    paidLeaveCount,
    holidayCount,
    history: ATTENDANCE_HISTORY,
    onExport,
    onApplyLeave,
    onChangeMonth,
  };
}
