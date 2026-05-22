// ─── Types ────────────────────────────────────────────────────────────────────

export type WeekDay = {
  day: string;          // 'Mon' | 'Tue' …
  present: number;      // 0‒100 percentage
  absent: number;       // 0‒100 percentage
};

export type LowAttendanceStudent = {
  id: string;
  name: string;
  percentage: number;   // 0‒100
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const WEEKLY_DATA: WeekDay[] = [
  { day: 'Mon', present: 72, absent: 18 },
  { day: 'Tue', present: 90, absent: 30 },
  { day: 'Wed', present: 82, absent: 22 },
  { day: 'Thu', present: 45, absent: 38 },
  { day: 'Fri', present: 78, absent: 25 },
  { day: 'Sat', present: 80, absent: 28 },
];

export const LOW_ATTENDANCE: LowAttendanceStudent[] = [
  { id: '1', name: 'Rajesh Sharma', percentage: 65 },
  { id: '2', name: 'Anita Gupta',   percentage: 72 },
  { id: '3', name: 'Vikram Singh',  percentage: 58 },
  { id: '4', name: 'Ayesha Patel',  percentage: 72 },
  { id: '5', name: 'Ravi Kumar',    percentage: 65 },
];

export const REPORT_SUMMARY = {
  averageAttendance: 92,
  absentToday: 6,
  weekLabel: 'Feb 10 - Feb 16',
  className: 'Today Class 8-B',
};
