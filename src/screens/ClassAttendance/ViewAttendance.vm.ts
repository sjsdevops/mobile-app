import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getStudentAttendanceDashboard,
  getStudentAttendanceHistory,
  type AttendanceDashboard,
  type StudentHistoryRecord,
} from '../../services/attendanceService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeekDay = {
  day: string;
  present: number;
  absent: number;
};

export type LowAttendanceStudent = {
  id: string;
  name: string;
  percentage: number;
};

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useViewAttendanceVM() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AttendanceDashboard | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekDay[]>([]);
  const [recentRecords, setRecentRecords] = useState<StudentHistoryRecord[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const dashData = await getStudentAttendanceDashboard(user.id);
        setDashboard(dashData);

        // Fetch history for weekly chart
        const historyData = await getStudentAttendanceHistory(user.id);
        setRecentRecords(historyData.records ?? []);

        // Build weekly data from last 6 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData: WeekDay[] = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const record = (historyData.records ?? []).find((r) => r.date === dateStr);

          weekData.push({
            day: days[d.getDay()],
            present: record?.is_present ? 100 : 0,
            absent: record?.is_absent ? 100 : 0,
          });
        }
        setWeeklyData(weekData);
      } catch (err) {
        console.error('[ViewAttendance] Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const reportSummary = {
    averageAttendance: dashboard?.attendance_percentage ?? 0,
    absentToday: dashboard?.absent ?? 0,
    totalPresent: dashboard?.present ?? 0,
    totalDays: dashboard?.total ?? 0,
    weekLabel: getWeekLabel(),
    className: '',
  };

  return {
    loading,
    weeklyData,
    reportSummary,
    recentRecords,
    dashboard,
  };
}

function getWeekLabel(): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 5);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  return `${fmt(start)} - ${fmt(today)}`;
}

// Keep these exports for backward compatibility with the UI
export const WEEKLY_DATA: WeekDay[] = [];
export const LOW_ATTENDANCE: LowAttendanceStudent[] = [];
export const REPORT_SUMMARY = {
  averageAttendance: 0,
  absentToday: 0,
  weekLabel: '',
  className: '',
};
