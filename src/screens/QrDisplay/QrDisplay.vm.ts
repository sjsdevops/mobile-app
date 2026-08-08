import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import {
  QR_SECRET_KEY,
  QR_REFRESH_OPTIONS,
  encodeQrPayload,
} from '../../services/qrAttendance';

function epochSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function useQrDisplayVM() {
  // Default refresh interval (seconds). User can change it in the in-screen settings.
  const [refreshSeconds, setRefreshSeconds] = useState(60);
  // The wall-clock time the QR was generated (displayed alongside the QR).
  const [generatedAt, setGeneratedAt] = useState<Date>(new Date());
  // Seconds remaining until the QR regenerates.
  const [countdown, setCountdown] = useState(refreshSeconds);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const lastGeneration = useRef(epochSeconds());

  // Block hardware back so the kiosk screen can't be left accidentally.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Countdown ticker → regenerate when it hits zero.
  useEffect(() => {
    const id = setInterval(() => {
      const now = epochSeconds();
      const elapsed = now - lastGeneration.current;
      if (elapsed >= refreshSeconds) {
        lastGeneration.current = now;
        setGeneratedAt(new Date());
        setCountdown(refreshSeconds);
      } else {
        setCountdown(refreshSeconds - elapsed);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [refreshSeconds]);

  // Stable payload regenerated only when `generatedAt` changes.
  const qrPayload = encodeQrPayload({
    t: generatedAt.getTime(),
    s: QR_SECRET_KEY,
    exp: refreshSeconds,
  });

  function selectRefresh(seconds: number) {
    lastGeneration.current = epochSeconds();
    setGeneratedAt(new Date());
    setCountdown(seconds);
    setRefreshSeconds(seconds);
    setSettingsOpen(false);
  }

  return {
    qrPayload,
    generatedAt,
    countdown,
    refreshSeconds,
    refreshOptions: QR_REFRESH_OPTIONS,
    settingsOpen,
    setSettingsOpen,
    selectRefresh,
  };
}
