import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceView =
  | 'home'           // main swipe-to-punch screen
  | 'confirm'        // map + confirm location
  | 'late'           // late entry detected
  | 'outside'        // outside campus
  | 'success';       // punch-in successful

export type PunchStatus = 'on-time' | 'late';

// ─── School Campus Config ─────────────────────────────────────────────────────

export const SCHOOL = {
  name:      'Man2 Web Technologies',
  latitude:  12.9477102,
  longitude: 79.1337949,
  radiusMeters: 500,   // allowed radius
};

export const SHIFT = {
  start: '09:00AM',
  end:   '04:00PM',
  startHour: 9,
  startMinute: 0,
};

// ─── Haversine distance (metres) ─────────────────────────────────────────────

function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R  = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useMyAttendanceVM() {
  const [view,       setView]       = useState<AttendanceView>('home');
  const [locLoading, setLocLoading] = useState(false);
  const [coords,     setCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [distance,   setDistance]   = useState<number>(0);
  const [withinCampus, setWithinCampus] = useState(false);
  const [punchTime,  setPunchTime]  = useState<Date | null>(null);
  const [lateMinutes,setLateMinutes] = useState(0);
  const [punchStatus,setPunchStatus] = useState<PunchStatus>('on-time');

  const now = new Date();

  // Live clock
  const [clock, setClock] = useState(now);
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clockStr = clock.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day:     'numeric',
    month:   'short',
    year:    'numeric',
  });

  // Format a Date to "09:20 AM"
  function fmtTime(d: Date) {
    return d.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  async function requestLocation() {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Permission denied — treat as outside
        setDistance(450);
        setWithinCampus(false);
        setCoords({ lat: SCHOOL.latitude + 0.004, lng: SCHOOL.longitude + 0.003 });
        return { within: false, dist: 450 };
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = pos.coords;
      const dist = Math.round(haversine(latitude, longitude, SCHOOL.latitude, SCHOOL.longitude));
      const within = dist <= SCHOOL.radiusMeters;

      setCoords({ lat: latitude, lng: longitude });
      setDistance(dist);
      setWithinCampus(within);
      return { within, dist };
    } catch {
      // Fallback: simulate within campus for demo
      setCoords({ lat: SCHOOL.latitude, lng: SCHOOL.longitude });
      setDistance(30);
      setWithinCampus(true);
      return { within: true, dist: 30 };
    } finally {
      setLocLoading(false);
    }
  }

  async function onSwipePunchIn() {
    const result = await requestLocation();
    if (result.within) {
      setView('confirm');
    } else {
      setView('outside');
    }
  }

  function onConfirmPunchIn() {
    const t = new Date();
    setPunchTime(t);

    const lateBy =
      (t.getHours() - SHIFT.startHour) * 60 +
      (t.getMinutes() - SHIFT.startMinute);

    if (lateBy > 0) {
      setLateMinutes(lateBy);
      setPunchStatus('late');
      setView('late');
    } else {
      setPunchStatus('on-time');
      setView('success');
    }
  }

  function onAcknowledgeLate() {
    setView('success');
  }

  async function onRetryLocation() {
    const result = await requestLocation();
    if (result.within) {
      setView('confirm');
    }
  }

  function goHome() {
    setView('home');
  }

  return {
    view,
    locLoading,
    coords,
    distance,
    withinCampus,
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
  };
}
