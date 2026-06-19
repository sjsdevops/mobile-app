import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  getStudentAttendanceDashboard,
  getStudentAttendanceHistory,
  getWeeklyClassAttendance,
  type AttendanceDashboard,
  type StudentHistoryRecord,
  type WeeklyStudentRecord,
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
  const params = useLocalSearchParams<{ classId?: string; sectionId?: string }>();
  
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AttendanceDashboard | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekDay[]>([]);
  const [recentRecords, setRecentRecords] = useState<StudentHistoryRecord[]>([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<LowAttendanceStudent[]>([]);
  const [className, setClassName] = useState('');
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);

  // Determine if this is for teacher (has classId/sectionId) or student
  const isTeacherView = !!(params.classId && params.sectionId);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("isTeacherView",isTeacherView )
        console.log("isTeacherView",params.classId  )
        console.log("isTeacherView",params.sectionId )
        if (isTeacherView && params.classId && params.sectionId) {
          console.log("teacher ");
          // Teacher view: fetch weekly class attendance
          await fetchTeacherView(params.classId, params.sectionId);
        } else {
          // Student view: fetch student attendance
          console.log("stustu ");
          await fetchStudentView(user.id);
        }
      } catch (err) {
        console.error('[ViewAttendance] Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, params.classId, params.sectionId, isTeacherView]);

  async function fetchTeacherView(classId: string, sectionId: string) {
    // Calculate week dates (last 6 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 5);

    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const weeklyData = await getWeeklyClassAttendance(
      classId,
      sectionId,
      formatDate(startDate),
      formatDate(endDate)
    );

    // Set summary data
    setAverageAttendance(weeklyData.average_attendance_percentage || 0);
    setAbsentToday(weeklyData.today_absent_count || 0);
    setClassName(`Class ${classId}-${sectionId}`);

    // Build weekly chart data from daily_summary
    const chartData: WeekDay[] = [];
    
    if (weeklyData.daily_summary && weeklyData.daily_summary.length > 0) {
      // Use actual daily summary data from API
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      weeklyData.daily_summary.forEach((daySummary) => {
        const date = new Date(daySummary.date);
        const dayName = days[date.getDay()];
        
        // Calculate percentages based on total students
        const presentPercent = daySummary.total_students > 0 
          ? (daySummary.present_count / daySummary.total_students) * 100 
          : 0;
        const absentPercent = daySummary.total_students > 0 
          ? (daySummary.absent_count / daySummary.total_students) * 100 
          : 0;
        
        chartData.push({
          day: dayName,
          present: Math.round(presentPercent),
          absent: Math.round(absentPercent),
        });
      });
    } else {
      // Fallback: generate days with average
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const avgPresent = weeklyData.average_attendance_percentage || 0;
        
        chartData.push({
          day: dayName,
          present: avgPresent,
          absent: 100 - avgPresent,
        });
      }
    }
    
    setWeeklyData(chartData);

    // Find students with low attendance (below 75%)
    const lowAttendance = weeklyData.students
      .filter((s) => s.attendance_percentage < 75)
      .sort((a, b) => a.attendance_percentage - b.attendance_percentage)
      .slice(0, 5)
      .map((s) => ({
        id: s.student_id,
        name: s.student_name,
        percentage: Math.round(s.attendance_percentage),
      }));
    
    setLowAttendanceStudents(lowAttendance);
  }

  async function fetchStudentView(studentId: string) {
    // Fetch dashboard stats
    const dashData = await getStudentAttendanceDashboard(studentId);
    setDashboard(dashData);
    setAverageAttendance(dashData.attendance_percentage || 0);
    setAbsentToday(dashData.absent || 0);

    // Fetch history for weekly chart
    const historyData = await getStudentAttendanceHistory(studentId);
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
  }

  const reportSummary = {
    averageAttendance,
    absentToday,
    totalPresent: dashboard?.present ?? 0,
    totalDays: dashboard?.total ?? 0,
    weekLabel: getWeekLabel(),
    className,
  };

  return {
    loading,
    weeklyData,
    reportSummary,
    recentRecords,
    dashboard,
    lowAttendanceStudents,
    isTeacherView,
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
