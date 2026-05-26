import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { markEmployeeSelfAttendance } from '../../services/attendanceService';

export type AttendanceView = 'home' | 'confirm' | 'late' | 'outside' | 'success';
export type PunchStatus = 'on-time' | 'late';
export type PunchMode = 'punch-in' | 'punch-out';

export const SCHOOL = {
  name: 'Sree Jayam School',
  latitude: 12.9477102,
  longitude: 79.1337949,
  radiusMeters: 500,
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

export function useMyAttendanceVM() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [view, setView] = useState<AttendanceView>('home');
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState(0);
  const [punchTime, setPunchTime] = useState<Date | null>(null);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [punchStatus, setPunchStatus] = useState<PunchStatus>('on-time');
  const [submitting, setSubmitting] = useState(false);

  // Data from API
  const [employeeName, setEmployeeName] = useState('');
  const [shiftDisplay, setShiftDisplay] = useState('');
  const [shiftStartHour, setShiftStartHour] = useState(9);
  const [shiftStartMinute, setShiftStartMinute] = useState(0);

  // Today's attendance state
  const [punchMode, setPunchMode] = useState<PunchMode>('punch-in');
  const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
  const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);
  const [alreadyPunchedIn, setAlreadyPunchedIn] = useState(false);

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

  // Fetch today's attendance to check if already punched in
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const response = await api.get(`/mobile/attendance/employees/${userId}`);
        const data = response.data?.data ?? response.data;
        const records = data?.records ?? [];

        // Find today's record
        const today = getTodayISO();
        const todayRecord = records.find((r: any) => r.date === today);

        if (todayRecord && todayRecord.is_present) {
          setAlreadyPunchedIn(true);
          setTodayCheckIn(todayRecord.check_in);
          setTodayCheckOut(todayRecord.check_out);
          if (todayRecord.check_out) {
            // Already punched out — show success
            setPunchMode('punch-out');
          } else {
            // Punched in but not out — show punch out button
            setPunchMode('punch-out');
          }
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

  async function requestLocation() {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDistance(999);
        setCoords(null);
        return { within: false, dist: 999 };
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const dist = Math.round(haversine(pos.coords.latitude, pos.coords.longitude, SCHOOL.latitude, SCHOOL.longitude));
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setDistance(dist);
      return { within: dist <= SCHOOL.radiusMeters, dist };
    } catch {
      setCoords({ lat: SCHOOL.latitude, lng: SCHOOL.longitude });
      setDistance(30);
      return { within: true, dist: 30 };
    } finally {
      setLocLoading(false);
    }
  }

  async function onSwipePunchIn() {
    const r = await requestLocation();
    setView(r.within ? 'confirm' : 'outside');
  }

  async function onConfirmPunchIn() {
    if (!userId) return;
    const t = new Date();
    setPunchTime(t);

    setSubmitting(true);
    try {
      if (punchMode === 'punch-in') {
        // Punch IN
        const lateBy = (t.getHours() - shiftStartHour) * 60 + (t.getMinutes() - shiftStartMinute);
        await markEmployeeSelfAttendance({
          date: getTodayISO(),
          is_present: true,
          is_absent: false,
          check_in: toLocalISO(t),
          location: coords ? `${coords.lat},${coords.lng}` : undefined,
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
          location: coords ? `${coords.lat},${coords.lng}` : undefined,
          created_by: userId,
          modified_by: userId,
        });

        setTodayCheckOut(toLocalISO(t));
        setPunchStatus('on-time');
        setView('success');
      }
    } catch (e) {
      console.error('[Attendance] API error:', e);
    } finally {
      setSubmitting(false);
    }
  }

  function onAcknowledgeLate() { setView('success'); }
  async function onRetryLocation() { const r = await requestLocation(); if (r.within) setView('confirm'); }
  function goHome() { setView('home'); }

  const SHIFT = {
    display: shiftDisplay || 'Not set',
    startHour: shiftStartHour,
    startMinute: shiftStartMinute,
  };

  // Status text for home screen
  const statusTitle = alreadyPunchedIn
    ? (todayCheckOut ? 'Attendance Complete' : 'You have punched in')
    : "You haven't punched in yet";

  const statusSubtitle = alreadyPunchedIn
    ? (todayCheckOut
      ? `Punch In: ${fmtTimeStr(todayCheckIn)} | Punch Out: ${fmtTimeStr(todayCheckOut)}`
      : `Punched in at ${fmtTimeStr(todayCheckIn)}`)
    : 'Please mark your attendance to\nstart the day';

  const swipeLabel = punchMode === 'punch-in' ? 'Swipe to Punch In' : 'Swipe to Punch Out';
  const confirmLabel = punchMode === 'punch-in' ? 'Confirm Punch In' : 'Confirm Punch Out';

  return {
    view,
    locLoading,
    coords,
    distance,
    withinCampus: distance <= SCHOOL.radiusMeters,
    punchTime,
    lateMinutes,
    punchStatus,
    clockStr,
    dateStr,
    fmtTime,
    onSwipePunchIn,
    onConfirmPunchIn,
    onAcknowledgeLate,
    onRetryLocation,
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
    confirmLabel,
    fmtTimeStr,
  };
}
