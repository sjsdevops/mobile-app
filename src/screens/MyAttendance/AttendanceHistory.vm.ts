import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeAttendanceHistory, type EmployeeAttendanceRecord } from '../../services/attendanceService';

export type AttendanceStatus = 'Present' | 'Absent';

export type AttendanceEntry = {
  id: string;
  dateLabel: string;
  status: AttendanceStatus;
  punchIn?: string;
  punchOut?: string;
  total?: string;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORTS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTime(isoStr: string | null): string | undefined {
  if (!isoStr) return undefined;
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return undefined; }
}

function calcTotal(checkIn: string | null, checkOut: string | null): string | undefined {
  if (!checkIn || !checkOut) return undefined;
  try {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diff <= 0) return undefined;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${String(mins).padStart(2, '0')} Min`;
  } catch { return undefined; }
}

export function useAttendanceHistoryVM() {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState<EmployeeAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalDaysFromApi, setTotalDaysFromApi] = useState(0);
  const [presentDaysFromApi, setPresentDaysFromApi] = useState(0);
  const [absentDaysFromApi, setAbsentDaysFromApi] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getEmployeeAttendanceHistory(user.id);
        setAllRecords(data.records ?? []);
        setTotalDaysFromApi(data.total_days ?? 0);
        setPresentDaysFromApi(data.present_days ?? 0);
        setAbsentDaysFromApi(data.absent_days ?? 0);
      } catch (err) {
        console.error('[AttendanceHistory] Failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [allRecords, selectedMonth, selectedYear]);

  // Map to display entries
  const history: AttendanceEntry[] = useMemo(() => {
    return filteredRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((r) => {
        const d = new Date(r.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateLabel = `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${dayName}`;
        return {
          id: r.employee_attendance_id || r.date,
          dateLabel,
          status: r.is_present ? 'Present' as const : 'Absent' as const,
          punchIn: formatTime(r.check_in),
          punchOut: formatTime(r.check_out),
          total: calcTotal(r.check_in, r.check_out),
        };
      });
  }, [filteredRecords]);

  const presentCount = filteredRecords.filter((r) => r.is_present).length;
  const absentCount = filteredRecords.filter((r) => r.is_absent).length;

  const monthLabel = `${MONTHS[selectedMonth].slice(0, 3)} ${selectedYear}`;
  const monthTitle = `${MONTHS[selectedMonth]} ${selectedYear}`;
  const totalDays = filteredRecords.length;

  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedYear);

  const monthOptions = MONTH_SHORTS.map((short, index) => ({ index, short }));

  function onSelectMonth(monthIndex: number) {
    setSelectedMonth(monthIndex);
    setSelectedYear(pickerYear);
    setMonthPickerVisible(false);
  }

  function onPrevYear() { setPickerYear((y) => y - 1); }
  function onNextYear() { setPickerYear((y) => y + 1); }

  function onChangeMonth() {
    setMonthPickerVisible(true);
  }

  function onExport() {
    Alert.alert('Download', 'Attendance report download will be available soon.');
  }

  function onApplyLeave() {
    Alert.alert('Apply Leave', 'Leave application will be available soon.');
  }

  return {
    monthLabel,
    monthTitle,
    totalDays,
    presentCount,
    absentCount,
    paidLeaveCount: 0,
    holidayCount: 0,
    history,
    loading,
    onExport,
    onApplyLeave,
    onChangeMonth,
    monthPickerVisible,
    setMonthPickerVisible,
    pickerYear,
    monthOptions,
    selectedMonth,
    selectedYear,
    onSelectMonth,
    onPrevYear,
    onNextYear,
  };
}
