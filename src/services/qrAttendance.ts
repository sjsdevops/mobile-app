import { Alert } from 'react-native';

// ─── QR Attendance shared logic ───────────────────────────────────────────────
// The QR display (kiosk) screen encodes a JSON payload holding a generated
// timestamp and a secret key. The employee scanner decodes it, verifies the
// secret, checks the timestamp is still fresh, then punches in / out with
// `attendance_type: "QR"` (location validation is skipped on the server).

export const QR_SECRET_KEY = 'SJS-ATTENDANCE-QR-SECRET-2026';
export const QR_PAYLOAD_PREFIX = 'SJSQR';
export const DEFAULT_QR_REFRESH_SECONDS = 60;

export const QR_REFRESH_OPTIONS = [
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '5 minutes', value: 300 },
] as const;

export interface QrPayload {
  /** epoch milliseconds when the QR was generated */
  t: number;
  /** secret key shared with the scanner */
  s: string;
  /** validity window in seconds */
  exp: number;
}

export function encodeQrPayload(payload: QrPayload): string {
  return `${QR_PAYLOAD_PREFIX}:${JSON.stringify(payload)}`;
}

export function decodeQrPayload(raw: string): QrPayload | null {
  try {
    if (!raw.startsWith(`${QR_PAYLOAD_PREFIX}:`)) return null;
    const json = raw.slice(QR_PAYLOAD_PREFIX.length + 1);
    const parsed = JSON.parse(json) as QrPayload;
    if (typeof parsed?.t !== 'number' || typeof parsed?.s !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export type QrValidation =
  | { ok: true; payload: QrPayload }
  | { ok: false; reason: 'invalid' | 'expired' | 'wrong-secret' };

export function validateQrPayload(raw: string): QrValidation {
  const payload = decodeQrPayload(raw);
  if (!payload) return { ok: false, reason: 'invalid' };
  if (payload.s !== QR_SECRET_KEY) return { ok: false, reason: 'wrong-secret' };
  const ageMs = Date.now() - payload.t;
  // Allow a small clock-skew buffer so a freshly generated QR is never rejected.
  if (ageMs < -5000 || ageMs > payload.exp * 1000) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, payload };
}

/** Human friendly error message for a failed QR validation. */
export function qrValidationMessage(reason: 'invalid' | 'expired' | 'wrong-secret'): string {
  switch (reason) {
    case 'invalid':
      return 'Invalid QR code. Please scan a valid attendance QR.';
    case 'wrong-secret':
      return 'QR code not recognized. Please scan the official attendance QR.';
    case 'expired':
      return 'QR code has expired. Please scan a fresh QR from the display.';
  }
}

/** Cross-platform alert helper used by both the scanner and display screens. */
export function showQrError(reason: 'invalid' | 'expired' | 'wrong-secret') {
  Alert.alert('Scan Failed', qrValidationMessage(reason), [{ text: 'OK' }]);
}
