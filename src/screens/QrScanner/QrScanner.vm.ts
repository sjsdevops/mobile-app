import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  validateQrPayload,
  showQrError,
} from '../../services/qrAttendance';
import {
  markEmployeeSelfAttendance,
  getEmployeeAttendanceHistory,
  type MarkEmployeeSelfResponse,
} from '../../services/attendanceService';

export type QrPunchMode = 'punch-in' | 'punch-out';

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

export function useQrScannerVM(mode: QrPunchMode) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [permission, requestPermission] = useCameraPermissions();
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<MarkEmployeeSelfResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Punch times to display on the confirmation screen.
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  // Allow one scan at a time; reset after a failed scan.
  const cooldown = useRef(false);

  async function askCameraPermission() {
    const res = await requestPermission();
    if (!res.granted) setPermissionDenied(true);
    return res.granted;
  }

  // Re-arm scanning whenever mode changes.
  useEffect(() => {
    setScanned(false);
    cooldown.current = false;
  }, [mode]);

  const onBarcodeScanned = useCallback(
    async (result: { data: string }) => {
      if (scanned || submitting || cooldown.current) return;
      cooldown.current = true;

      const validation = validateQrPayload(result.data);
      if (!validation.ok) {
        setScanned(true);
        showQrError(validation.reason);
        // Let the user retry with a fresh scan.
        setTimeout(() => {
          setScanned(false);
          cooldown.current = false;
        }, 1500);
        return;
      }

      if (!userId) {
        setError('No signed-in user found. Please log in again.');
        cooldown.current = false;
        return;
      }

      setScanned(true);
      setSubmitting(true);
      setError(null);

      const t = new Date();
      try {
        const payload =
          mode === 'punch-in'
            ? {
                date: getTodayISO(),
                is_present: true,
                is_absent: false,
                check_in: toLocalISO(t),
                attendance_type: 'QR' as const,
                created_by: userId,
                modified_by: userId,
              }
            : {
                date: getTodayISO(),
                is_present: true,
                is_absent: false,
                check_out: toLocalISO(t),
                attendance_type: 'QR' as const,
                created_by: userId,
                modified_by: userId,
              };

        const result = await markEmployeeSelfAttendance(payload);
        setSuccess(result);

        if (mode === 'punch-in') {
          setPunchInTime(t);
          setPunchOutTime(null);
        } else {
          setPunchOutTime(t);
          // Pull today's check-in so the confirmation can show both times.
          try {
            const history = await getEmployeeAttendanceHistory(userId);
            const today = getTodayISO();
            const todayRecord = (history?.records ?? []).find((r) => r.date === today);
            if (todayRecord?.check_in) {
              setPunchInTime(new Date(todayRecord.check_in));
            }
          } catch {
            // Non-fatal — confirmation still shows the punch-out time.
          }
        }
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Failed to mark attendance via QR.';
        setError(msg);
        Alert.alert('Punch Failed', msg, [
          { text: 'Try Again', onPress: () => { setScanned(false); cooldown.current = false; } },
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
        ]);
      } finally {
        setSubmitting(false);
        cooldown.current = false;
      }
    },
    [mode, scanned, submitting, userId, router],
  );

  function onDone() {
    router.replace('/my-attendance');
  }

  function onClose() {
    router.back();
  }

  function fmtTime(d: Date | null): string {
    if (!d) return '--:--';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function fmtDate(d: Date | null): string {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return {
    mode,
    scanned,
    submitting,
    success,
    error,
    permission,
    permissionDenied,
    askCameraPermission,
    onBarcodeScanned,
    onDone,
    onClose,
    punchInTime,
    punchOutTime,
    fmtTime,
    fmtDate,
  };
}

export type QrScannerVM = ReturnType<typeof useQrScannerVM>;
