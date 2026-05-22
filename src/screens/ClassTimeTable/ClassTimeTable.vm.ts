import { useMemo, useState } from 'react';

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
  dayShort: string; // "Mon"
};

// ─── Timetable Data ──────────────────────────────────────────────────────────

const ROUTINE: Record<string, Period[]> = {
  mon: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics',     className: 'Class 9-A'  },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Physics',     className: 'Class 10-A' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Physics',     className: 'Class 11-B' },
    { id: '5', startTime: '11:45', endTime: '12:30', subject: 'Physics',     className: 'Class 12-C' },
    { id: 'b2', startTime: '12:30', endTime: '13:00', subject: '', className: '', isBreak: true, breakLabel: 'Lunch Break' },
    { id: '6', startTime: '13:00', endTime: '13:45', subject: 'Chemistry',   className: 'Class 8-B'  },
  ],
  tue: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics',     className: 'Class 9-A'  },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Physics',     className: 'Class 10-A' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Physics',     className: 'Class 11-B' },
    { id: '5', startTime: '11:45', endTime: '12:30', subject: 'Physics',     className: 'Class 12-C' },
  ],
  wed: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Chemistry',   className: 'Class 8-B'  },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Physics',     className: 'Class 10-A' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Physics',     className: 'Class 11-B' },
  ],
  thu: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Physics',     className: 'Class 12-C' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Chemistry',   className: 'Class 8-B'  },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Physics',     className: 'Class 9-A'  },
    { id: '5', startTime: '11:45', endTime: '12:30', subject: 'Physics',     className: 'Class 10-A' },
  ],
  fri: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics',     className: 'Class 11-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Chemistry',   className: 'Class 9-A'  },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Physics',     className: 'Class 12-C' },
    { id: 'b2', startTime: '11:45', endTime: '12:15', subject: '', className: '', isBreak: true, breakLabel: 'Lunch Break' },
    { id: '5', startTime: '12:15', endTime: '13:00', subject: 'Physics',     className: 'Class 8-B'  },
  ],
  sat: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics',     className: 'Class 9-A'  },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', className: 'Class 5-B'  },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Physics',     className: 'Class 10-A' },
  ],
};

const DAY_SHORTS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

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
  const jsDay = d.getDay(); // 0 Sun
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

// ─── ViewModel ───────────────────────────────────────────────────────────────

export function useClassRoutineVM() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const weekDates = useMemo(() => getMonSatWeek(selectedDate), [selectedDate]);

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [selectedDate]);

  const dayKey = useMemo(() => DAY_KEYS[selectedDate.getDay()] ?? 'mon', [selectedDate]);
  const periods = useMemo(() => ROUTINE[dayKey] ?? [], [dayKey]);

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
    const end   = timeToMinutes(period.endTime);

    if (now >= end)                   return 'completed';
    if (now >= start && now < end)    return 'in-progress';
    return null;
  }

  return {
    selectedDate,
    setSelectedDate,
    weekDates,
    monthLabel,
    periods,
    getPeriodStatus,
  };
}
