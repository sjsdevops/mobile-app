import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, PanResponder } from 'react-native';
import {
  QR_SECRET_KEY,
  QR_REFRESH_OPTIONS,
  encodeQrPayload,
} from '../../services/qrAttendance';

function epochSeconds() {
  return Math.floor(Date.now() / 1000);
}

type Point = { x: number; y: number };

function isRectangle(points: Point[]): boolean {
  if (points.length < 20) return false;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 80 || height < 80) return false;

  const start = points[0];
  const end = points[points.length - 1];
  if (
    Math.hypot(end.x - start.x, end.y - start.y) >
    Math.max(width, height) * 0.35
  ) {
    return false;
  }

  const tolerance = Math.max(12, Math.min(width, height) * 0.12);
  let nearCount = 0;
  for (const p of points) {
    const dx = Math.min(Math.abs(p.x - minX), Math.abs(p.x - maxX));
    const dy = Math.min(Math.abs(p.y - minY), Math.abs(p.y - maxY));
    if (Math.min(dx, dy) <= tolerance) nearCount++;
  }
  if (nearCount / points.length < 0.85) return false;

  const cornerTol = Math.max(16, Math.min(width, height) * 0.18);
  const corners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
  const covered = corners.filter((c) =>
    points.some((p) => Math.hypot(p.x - c.x, p.y - c.y) <= cornerTol)
  ).length;
  if (covered < 4) return false;

  return true;
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

  // Hidden developer gesture: draw a closed rectangle around the QR code to
  // open the refresh-time settings.
  const drawPoints = useRef<Point[]>([]);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          drawPoints.current = [];
        },
        onPanResponderMove: (_evt, gestureState) => {
          drawPoints.current.push({
            x: gestureState.moveX,
            y: gestureState.moveY,
          });
        },
        onPanResponderRelease: () => {
          if (isRectangle(drawPoints.current)) {
            setSettingsOpen(true);
          }
        },
      }),
    []
  );

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
    panResponder,
  };
}
