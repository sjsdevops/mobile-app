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
    // Check if location services are enabled on the device
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      return null as any; // signal: services off
    }
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

  const [punchMode, setPunchMode] = useState<PunchMode>('punch-in');
  const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
  const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);
  const [alreadyPunchedIn, setAlreadyPunchedIn] = useState(false);
  const [outsideMessage, setOutsideMessage] = useState('');
  const [isMarkedAbsent, setIsMarkedAbsent] = useState(false);
  const [swipeResetKey, setSwipeResetKey] = useState(0);

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

        if (todayRecord) {
          // Check if marked as absent
          if (todayRecord.is_absent) {
            setIsMarkedAbsent(true);
            setAlreadyPunchedIn(false);
            setPunchMode('punch-in');
          } else if (todayRecord.is_present) {
            setAlreadyPunchedIn(true);
            setTodayCheckIn(todayRecord.check_in);
            setTodayCheckOut(todayRecord.check_out);
            setPunchMode('punch-out');
            setIsMarkedAbsent(false);
          } else {
            setPunchMode('punch-in');
            setAlreadyPunchedIn(false);
            setIsMarkedAbsent(false);
          }
        } else {
          setPunchMode('punch-in');
          setAlreadyPunchedIn(false);
          setIsMarkedAbsent(false);
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

  // Swipe → get GPS → call API → backend validates campus + late
  async function onSwipePunchIn() {
    if (!userId) return;

    // Check if location services are enabled before proceeding
    try {
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        Alert.alert(
          'Location Required',
          'Please turn on your device location (GPS) to mark attendance.',
          [{ text: 'OK', style: 'default' }]
        );
        setSwipeResetKey((prev) => prev + 1);
        return;
      }
      // Also check if permission is granted
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Location permission is needed to verify you are on campus. Please enable it in Settings.',
            [{ text: 'OK', style: 'default' }]
          );
          setSwipeResetKey((prev) => prev + 1);
          return;
        }
      }
    } catch {
      // If we can't check, proceed — backend will validate
    }

    // Check if punching out before 8 hours
    if (punchMode === 'punch-out' && todayCheckIn) {
      const checkInTime = new Date(todayCheckIn);
      const now = new Date();
      const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      if (hoursWorked < 8) {
        // Show confirmation alert
        Alert.alert(
          'Early Punch Out',
          `You have worked ${hoursWorked.toFixed(1)} hours. Are you sure you want to punch out before the end of the day?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // Force swipe button to reset by changing the key
                setSwipeResetKey((prev) => prev + 1);
              },
            },
            {
              text: 'Yes, Punch Out',
              style: 'destructive',
              onPress: () => performPunchOut(),
            },
          ],
          { cancelable: true }
        );
        return;
      }
    }

    // Continue with normal punch in/out flow
    if (punchMode === 'punch-out') {
      await performPunchOut();
    } else {
      await performPunchIn();
    }
  }

  async function performPunchIn() {
    if (!userId) return;

    // Step 1: Get GPS
    setLocLoading(true);
    const location = await getCurrentLocation();
    setLocLoading(false);

    // Step 2: Call API (backend validates campus radius + detects late)
    const t = new Date();
    setPunchTime(t);
    setSubmitting(true);

    try {
      const result = await markEmployeeSelfAttendance({
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

      // Backend determines late — use response fields
      if (result.is_late) {
        setLateMinutes(result.late_by_minutes ?? 0);
        setPunchStatus('late');
        setView('late');
      } else {
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

  async function performPunchOut() {
    if (!userId) return;

    // Step 1: Get GPS
    setLocLoading(true);
    const location = await getCurrentLocation();
    setLocLoading(false);

    // Step 2: Call API
    const t = new Date();
    setPunchTime(t);
    setSubmitting(true);

    try {
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
    } catch (e: any) {
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
    isMarkedAbsent,
    swipeResetKey,
  };
}
