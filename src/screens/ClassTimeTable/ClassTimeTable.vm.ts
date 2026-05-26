import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodStatus = 'completed' | 'in-progress' | null;

export type Period = {
  id: string;
  startTime: string; // "08:00"
  endTime: string;   // "08:45"
  subject: string;
  className: string;
  isBreak?: boolean;
  breakLabel?: string;
};

export type DateItem = {
  date: Date;
  dayKey: string;
  dayShort: string;
};

// ─── API Response Types ──────────────────────────────────────────────────────

interface TimetableEntry {
  time_table_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string | null;
  section_name: string;
  class_name: string;
}

interface TimetableResponse {
  section_id?: string;
  section_name?: string;
  class_name?: string;
  employee_id?: string;
  entries: TimetableEntry[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_SHORTS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAME_TO_KEY: Record<string, string> = {
  sunday: 'sun',
  monday: 'mon',
  tuesday: 'tue',
  wednesday: 'wed',
  thursday: 'thu',
  friday: 'fri',
  saturday: 'sat',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function getMonSatWeek(anchor: Date): DateItem[] {
  const d = new Date(anchor);
  const jsDay = d.getDay();
  const toMon = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + toMon);

  const week: DateItem[] = [];
  for (let i = 0; i < 6; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const idx = day.getDay();
    week.push({ date: day, dayKey: DAY_KEYS[idx], dayShort: DAY_SHORTS[idx] });
  }
  return week;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Extract "HH:MM" from ISO datetime string like "2024-01-01T09:00:00" */
function extractTime(isoString: string): string {
  if (!isoString) return '00:00';
  // Handle both "2024-01-01T09:00:00" and plain "09:00"
  if (isoString.includes('T')) {
    const timePart = isoString.split('T')[1];
    return timePart.substring(0, 5);
  }
  return isoString.substring(0, 5);
}

// ─── ViewModel ───────────────────────────────────────────────────────────────

export function useClassRoutineVM() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allEntries, setAllEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerInfo, setHeaderInfo] = useState({ title: 'Class Routine', subtitle: '' });

  // Fetch timetable from API
  useEffect(() => {
    if (!user) return;

    const fetchTimetable = async () => {
      setLoading(true);
      try {
        let url = '';
        if (user.role === 'student') {
          url = `/mobile/student/${user.id}/timetable`;
        } else {
          url = `/mobile/teacher/${user.id}/timetable`;
        }

        const response = await api.get(url);
        const apiData = response.data?.data ?? response.data;
        const data = apiData as TimetableResponse;

        setAllEntries(data.entries ?? []);

        // Set header info
        if (user.role === 'student' && data.class_name && data.section_name) {
          setHeaderInfo({
            title: 'Class Routine',
            subtitle: `${data.class_name} - ${data.section_name}`,
          });
        } else {
          setHeaderInfo({
            title: 'My Schedule',
            subtitle: `${user.firstName} ${user.lastName}`.trim(),
          });
        }
      } catch (error) {
        console.error('[Timetable] Failed to fetch:', error);
        setAllEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [user]);

  const weekDates = useMemo(() => getMonSatWeek(selectedDate), [selectedDate]);

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [selectedDate]);

  // Get the day key for the selected date
  const dayKey = useMemo(() => DAY_KEYS[selectedDate.getDay()] ?? 'mon', [selectedDate]);

  // Filter and map entries for the selected day
  const periods: Period[] = useMemo(() => {
    const filtered = allEntries.filter((entry) => {
      const entryDayKey = DAY_NAME_TO_KEY[entry.day_of_week.toLowerCase()] ?? '';
      return entryDayKey === dayKey;
    });

    // Sort by start_time
    filtered.sort((a, b) => {
      const aTime = extractTime(a.start_time);
      const bTime = extractTime(b.start_time);
      return timeToMinutes(aTime) - timeToMinutes(bTime);
    });

    // Map to Period type
    return filtered.map((entry, index) => ({
      id: entry.time_table_id || `period-${index}`,
      startTime: extractTime(entry.start_time),
      endTime: extractTime(entry.end_time),
      subject: entry.subject_name,
      className: user?.role === 'student'
        ? (entry.teacher_name ? `Teacher: ${entry.teacher_name}` : entry.class_name)
        : `${entry.class_name} - ${entry.section_name}`,
    }));
  }, [allEntries, dayKey, user]);

  function getPeriodStatus(period: Period): PeriodStatus {
    if (period.isBreak) return null;

    const today = new Date();
    const pastDate =
      selectedDate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (pastDate) return 'completed';
    if (!isSameDay(selectedDate, today)) return null;

    const now = today.getHours() * 60 + today.getMinutes();
    const start = timeToMinutes(period.startTime);
    const end = timeToMinutes(period.endTime);

    if (now >= end) return 'completed';
    if (now >= start && now < end) return 'in-progress';
    return null;
  }

  return {
    selectedDate,
    setSelectedDate,
    weekDates,
    monthLabel,
    periods,
    getPeriodStatus,
    loading,
    headerInfo,
  };
}
