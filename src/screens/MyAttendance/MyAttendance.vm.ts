import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { markEmployeeSelfAttendance } from '../../services/attendanceService';

export type AttendanceView = 'home' | 'late' | 'outside' | 'success';
export type PunchStatus = 'on-time' | 'late';
export type PunchMode = 'punch-in' | 'punch-out';

export const SCHOOL = {
  name: 'Sree Jayam School',
  latitude: 12.9477102,
  longitude: 79.1337949,
};

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${day}T${h}:${mi}:${s}`;
}

async function getCurrentLocation(): Promise<string | undefined> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return undefined;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return `${pos.coords.latitude},${pos.coords.longitude}`;
  } catch {
    return undefined;
  }
}

export function useMyAttendanceVM() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [view, setView] = useState<AttendanceView>('home');
  const [locLoading, setLocLoading] = useState(false);
  const [punchTime, setPunchTime] = useState<Date | null>(null);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [punchStatus, setPunchStatus] = useState<PunchStatus>('on-time');
  const [submitting, setSubmitting] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [shiftDisplay, setShiftDisplay] = useState('');
  const [shiftStartHour, setShiftStartHour] = useState(9);
  const [shiftStartMinute, setShiftStartMinute] = useState(0);

  const [punchMode, setPunchMode] = useState<PunchMode>('punch-in');
  const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
  const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);
  const [alreadyPunchedIn, setAlreadyPunchedIn] = useState(false);
  const [outsideMessage, setOutsideMessage] = useState('');

  // Fetch employee profile
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const response = await api.get(`/mobile/employee/${userId}/profile`);
        const p = response.data?.data ?? response.data;
        setEmployeeName(`${p.first_name || ''} ${p.last_name || ''}`.trim());
        if (p.work_details?.shift_time) {
          setShiftDisplay(p.work_details.shift_time);
          const match = p.work_details.shift_time.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            setShiftStartHour(parseInt(match[1]));
            setShiftStartMinute(parseInt(match[2]));
          }
        }
      } catch (err) {
        console.error('[MyAttendance] Profile API error:', err);
      }
    })();
  }, [userId]);

  // Fetch today's attendance
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const response = await api.get(`/mobile/attendance/employees/${userId}`);
        const data = response.data?.data ?? response.data;
        const records = data?.records ?? [];
        const today = getTodayISO();
        const todayRecord = records.find((r: any) => r.date === today);
        if (todayRecord && todayRecord.is_present) {
          setAlreadyPunchedIn(true);
          setTodayCheckIn(todayRecord.check_in);
          setTodayCheckOut(todayRecord.check_out);
          setPunchMode('punch-out');
        } else {
          setPunchMode('punch-in');
          setAlreadyPunchedIn(false);
        }
      } catch (err) {
        console.error('[MyAttendance] History API error:', err);
      }
    })();
  }, [userId]);

  // Live clock
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clockStr = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  function fmtTime(d: Date) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function fmtTimeStr(isoStr: string | null): string {
    if (!isoStr) return '--:--';
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '--:--'; }
  }

  // Swipe → get GPS → call API → backend validates campus
  async function onSwipePunchIn() {
    if (!userId) return;

    // Step 1: Get GPS
    setLocLoading(true);
    const location = await getCurrentLocation();
    setLocLoading(false);

    // Step 2: Call API (backend validates campus radius)
    const t = new Date();
    setPunchTime(t);
    setSubmitting(true);

    try {
      if (punchMode === 'punch-in') {
        const lateBy = (t.getHours() - shiftStartHour) * 60 + (t.getMinutes() - shiftStartMinute);

        await markEmployeeSelfAttendance({
          date: getTodayISO(),
          is_present: true,
          is_absent: false,
          check_in: toLocalISO(t),
          location,
          created_by: userId,
          modified_by: userId,
        });

        setAlreadyPunchedIn(true);
        setTodayCheckIn(toLocalISO(t));
        setPunchMode('punch-out');

        if (lateBy > 0) {
          setLateMinutes(lateBy);
          setPunchStatus('late');
          setView('late');
        } else {
          setPunchStatus('on-time');
          setView('success');
        }
      } else {
        // Punch OUT
        await markEmployeeSelfAttendance({
          date: getTodayISO(),
          is_present: true,
          is_absent: false,
          check_in: todayCheckIn || toLocalISO(t),
          check_out: toLocalISO(t),
          location,
          created_by: userId,
          modified_by: userId,
        });

        setTodayCheckOut(toLocalISO(t));
        setPunchStatus('on-time');
        setView('success');
      }
    } catch (e: any) {
      // Backend error (e.g. "You are 600m away from campus")
      const msg = e?.response?.data?.detail || 'Failed to mark attendance';
      setOutsideMessage(msg);
      setView('outside');
    } finally {
      setSubmitting(false);
    }
  }

  function onAcknowledgeLate() { setView('success'); }
  function goHome() { setView('home'); }

  const SHIFT = {
    display: shiftDisplay || 'Not set',
    startHour: shiftStartHour,
    startMinute: shiftStartMinute,
  };

  const statusTitle = alreadyPunchedIn
    ? (todayCheckOut ? 'Attendance Complete' : 'You have punched in')
    : "You haven't punched in yet";

  const statusSubtitle = alreadyPunchedIn
    ? (todayCheckOut
      ? `Punch In: ${fmtTimeStr(todayCheckIn)} | Punch Out: ${fmtTimeStr(todayCheckOut)}`
      : `Punched in at ${fmtTimeStr(todayCheckIn)}`)
    : 'Please mark your attendance to\nstart the day';

  const swipeLabel = punchMode === 'punch-in' ? 'Swipe to Punch In' : 'Swipe to Punch Out';

  return {
    view,
    locLoading: locLoading || submitting,
    coords: null,
    distance: 0,
    withinCampus: true,
    punchTime,
    lateMinutes,
    punchStatus,
    clockStr,
    dateStr,
    fmtTime,
    onSwipePunchIn,
    onConfirmPunchIn: onSwipePunchIn,
    onAcknowledgeLate,
    onRetryLocation: onSwipePunchIn,
    goHome,
    submitting,
    employeeName,
    SHIFT,
    punchMode,
    alreadyPunchedIn,
    todayCheckIn,
    todayCheckOut,
    statusTitle,
    statusSubtitle,
    swipeLabel,
    confirmLabel: swipeLabel,
    fmtTimeStr,
    outsideMessage,
  };
}
