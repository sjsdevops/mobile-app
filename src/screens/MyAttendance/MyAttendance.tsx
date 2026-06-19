import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker } from 'react-native-maps';
import {
  ArrowLeft,
  Calendar1,
  FingerScan,
  Location,
  LocationCross,
  LocationTick,
  Refresh2,
  Scan,
  TickCircle,
} from 'iconsax-react-nativejs';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { SCHOOL, useMyAttendanceVM } from './MyAttendance.vm';

const { width: SCREEN_W } = Dimensions.get('window');
const THUMB_SIZE = 48;
const SWIPE_H = THUMB_SIZE + 12;
const ORANGE = '#F97316';

// ─── Swipe-to-Punch Button ────────────────────────────────────────────────────

function SwipePunchButton({
  onComplete,
  disabled = false,
  label = 'Swipe to Punch In',
}: {
  onComplete: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const TRACK_W = SCREEN_W - 48;
  const TRAVEL = TRACK_W - THUMB_SIZE - 12;
  const translateX = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  // Always keep a ref to the latest onComplete so the PanResponder
  // (created once via useRef) never calls a stale closure.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Reset the swipe thumb whenever the label changes (punch-in → punch-out)
  const prevLabel = useRef(label);
  useEffect(() => {
    if (prevLabel.current !== label) {
      prevLabel.current = label;
      done.current = false;
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [label, translateX]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (_, { dx }) => {
        translateX.setValue(Math.max(0, Math.min(dx, TRAVEL)));
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx >= TRAVEL * 0.8) {
          Animated.timing(translateX, {
            toValue: TRAVEL, duration: 120, useNativeDriver: true,
          }).start(() => {
            if (!done.current) {
              done.current = true;
              onCompleteRef.current();
            }
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const textOpacity = translateX.interpolate({
    inputRange: [0, TRAVEL * 0.4], outputRange: [1, 0], extrapolate: 'clamp',
  });

  return (
    <View style={[styles.swipeTrack, { width: TRACK_W, height: SWIPE_H, borderRadius: SWIPE_H / 2 }]}>
      <Animated.Text style={[styles.swipeText, { opacity: textOpacity }]}>
        {label}
      </Animated.Text>
      <Animated.View
        {...pan.panHandlers}
        style={[styles.swipeThumb, { transform: [{ translateX }] }]}
      >
        <Text style={styles.swipeArrow}>{'→'}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Shared mini-header ───────────────────────────────────────────────────────

function MiniHeader({ title, onBack, light = false }: { title: string; onBack: () => void; light?: boolean }) {
  return (
    <View style={[styles.miniHeader, light && styles.miniHeaderLight]}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ArrowLeft color={light ? '#fff' : colors.neutral[800]} size={20} variant="Linear" />
      </TouchableOpacity>
      <Text style={[styles.miniHeaderTitle, light && styles.miniHeaderTitleLight]}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>
  );
}

// ─── View: Home ───────────────────────────────────────────────────────────────

function HomeView({
  vm,
  onBack,
}: {
  vm: ReturnType<typeof useMyAttendanceVM>;
  onBack: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      {/* ── White header ── */}
      <View style={[styles.homeHeader, styles.homeHeaderSpace]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.homeHeaderTitle}>Attendance</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/attendance-history')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Calendar1 color={colors.neutral[800]} size={18} variant="Linear" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      {/* ── Orange greeting card ── */}
      <View style={styles.greetCard}>
        <View style={styles.greetCardDecor} />
        <Text style={styles.greetName}>Good Morning, {vm.employeeName || 'User'}</Text>
        <Text style={styles.greetDate}>{vm.dateStr}</Text>
      </View>

      {/* ── Absent Warning ── */}
      {vm.isMarkedAbsent && (
        <View style={styles.absentWarningCard}>
          <View style={styles.absentWarningIcon}>
            <Text style={styles.absentWarningIconText}>⚠️</Text>
          </View>
          <View style={styles.absentWarningContent}>
            <Text style={styles.absentWarningTitle}>Marked as Absent</Text>
            <Text style={styles.absentWarningText}>
              Your attendance has been marked as absent for today. Please contact HR team for assistance.
            </Text>
          </View>
        </View>
      )}

      {/* ── Large clock ── */}
      <Text style={styles.greetClock}>{vm.clockStr}</Text>

      {/* ── Finger scan icon ── */}
      <View style={styles.greetIconCircle}>
        <FingerScan color={ORANGE} size={32} variant="Bold" />
      </View>

      {/* ── Status ── */}
      <Text style={styles.statusTitle}>{vm.statusTitle}</Text>
      <Text style={styles.statusSubtitle}>{vm.statusSubtitle}</Text>

      {/* ── Shift times ── */}
      <View style={styles.shiftRow}>
        <View style={styles.shiftItem}>
          <Text style={styles.shiftLabel}>Shift</Text>
          <Text style={styles.shiftValue}>{vm.SHIFT?.display ?? 'Not set'}</Text>
        </View>
      </View>

      <View style={styles.flex} />

      {/* ── Swipe button ── */}
      <View style={styles.swipeSection}>
        {vm.isMarkedAbsent ? (
          <View style={[styles.swipeTrack, { width: SCREEN_W - 48, height: SWIPE_H, borderRadius: SWIPE_H / 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[300] }]}>
            <Text style={styles.swipeText}>Contact HR to Mark Attendance</Text>
          </View>
        ) : vm.locLoading ? (
          <View style={[styles.swipeTrack, { width: SCREEN_W - 48, height: SWIPE_H, borderRadius: SWIPE_H / 2, justifyContent: 'center', flexDirection: 'row', gap: 10, alignItems: 'center' }]}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.swipeText}>Getting location…</Text>
          </View>
        ) : vm.todayCheckOut ? (
          <View style={[styles.swipeTrack, { width: SCREEN_W - 48, height: SWIPE_H, borderRadius: SWIPE_H / 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.green[200] }]}>
            <Text style={styles.swipeText}>✓ Attendance Complete</Text>
          </View>
        ) : (
          <SwipePunchButton onComplete={vm.onSwipePunchIn} label={vm.swipeLabel} />
        )}
      </View>
      <View style={{ height: 32 }} />
    </View>
  );
}

// ─── View: Outside Campus ────────────────────────────────────────────────────

function OutsideCampusView({ vm }: { vm: ReturnType<typeof useMyAttendanceVM> }) {
  return (
    <View style={[styles.flex, styles.centeredView]}>
      <View style={styles.outsideIconCircle}>
        <LocationCross color={colors.secondary[300]} size={44} variant="Bold" />
      </View>
      <Text style={styles.viewTitle}>Outside Campus</Text>
      <Text style={styles.viewSubtitle}>{vm.outsideMessage || 'Your location could not be verified within the school campus area.'}</Text>

      <View style={styles.flex} />

      <View style={styles.outsideBtnGroup}>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.flex]}
          onPress={vm.onRetryLocation}
          activeOpacity={0.85}
          disabled={vm.locLoading}
        >
          {vm.locLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Refresh2 color="#fff" size={18} variant="Bold" />}
          <Text style={styles.primaryBtnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={vm.goHome}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── View: Late Entry ─────────────────────────────────────────────────────────

function LateEntryView({ vm }: { vm: ReturnType<typeof useMyAttendanceVM> }) {
  return (
    <View style={[styles.flex, styles.centeredView]}>
      {/* Illustration */}
      <Text style={styles.emoji}>😮{'\n'}🕐</Text>
      <Text style={styles.viewTitle}>Late Entry Detected!</Text>
      <Text style={styles.viewSubtitle}>
        You are arriving later than your scheduled shift start time.
      </Text>

      {/* Summary card */}
      <View style={styles.infoCard}>
        <InfoRow label="Reporting Time" value={vm.SHIFT?.display ?? '-'} />
        <View style={styles.infoCardDivider} />
        <InfoRow
          label="Punch Time"
          value={vm.punchTime ? vm.fmtTime(vm.punchTime) : '--:-- AM'}
        />
        <View style={styles.infoCardDivider} />
        <InfoRow
          label="Late By"
          value={`${vm.lateMinutes} min${vm.lateMinutes !== 1 ? 's' : ''}`}
          valueColor={colors.secondary[300]}
        />
      </View>

      <View style={styles.flex} />

      <TouchableOpacity
        style={[styles.primaryBtn, { marginHorizontal: 24, marginBottom: 32 }]}
        onPress={vm.onAcknowledgeLate}
        activeOpacity={0.85}
      >
        <Scan color="#fff" size={18} variant="Bold" />
        <Text style={styles.primaryBtnText}>Acknowledge & Punch In</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── View: Success ────────────────────────────────────────────────────────────

function SuccessView({
  vm,
  onGoToDashboard,
}: {
  vm: ReturnType<typeof useMyAttendanceVM>;
  onGoToDashboard: () => void;
}) {
  return (
    <View style={[styles.flex, styles.centeredView]}>
      {/* Illustration: Calendar with tick badge */}
      <View style={styles.successIconWrap}>
        <Calendar1 color={colors.primary[300]} size={72} variant="Bold" />
        <View style={styles.successBadge}>
          <TickCircle color={colors.green[200]} size={28} variant="Bold" />
        </View>
      </View>

      <Text style={styles.viewTitle}>Punch In Successful!</Text>
      <Text style={styles.viewSubtitle}>Your attendance has been recorded successfully.</Text>

      {/* Summary card */}
      <View style={styles.infoCard}>
        <InfoRow
          label="Date"
          value={vm.punchTime
            ? vm.punchTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        />
        <View style={styles.infoCardDivider} />
        <InfoRow
          label="Punch Time"
          value={vm.punchTime ? vm.fmtTime(vm.punchTime) : '—'}
        />
        <View style={styles.infoCardDivider} />
        <InfoRow
          label="Status"
          value={vm.punchStatus === 'late' ? 'Late' : 'On Time'}
          valueColor={vm.punchStatus === 'late' ? colors.secondary[300] : colors.green[200]}
        />
      </View>

      <View style={styles.flex} />

      <TouchableOpacity
        style={[styles.primaryBtn, styles.fullWidthBtn]}
        onPress={onGoToDashboard}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── InfoRow helper ───────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function MyAttendanceScreen() {
  const router = useRouter();
  const vm = useMyAttendanceVM();

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      {vm.view === 'home' && (
        <HomeView vm={vm} onBack={() => router.back()} />
      )}
      {vm.view === 'late' && (
        <LateEntryView vm={vm} />
      )}
      {vm.view === 'outside' && (
        <OutsideCampusView vm={vm} />
      )}
      {vm.view === 'success' && (
        <SuccessView vm={vm} onGoToDashboard={() => router.replace('/(tabs)')} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  flex: { flex: 1 },

  // ── Home screen header ──
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface.light,
    gap: 12,
  },
  homeHeaderSpace: {
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },

  // ── Mini header (used by map view) ──
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface.light,
  },
  miniHeaderLight: { backgroundColor: 'transparent' },
  miniHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  miniHeaderTitleLight: { color: '#fff' },

  // ── Greeting card ──
  greetCard: {
    backgroundColor: ORANGE,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  greetCardDecor: {
    position: 'absolute',
    right: -28,
    top: -28,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  greetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  greetDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },

  // ── Absent Warning Card ──
  absentWarningCard: {
    backgroundColor: '#FEF3F2',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  absentWarningIcon: {
    marginRight: 12,
  },
  absentWarningIconText: {
    fontSize: 24,
  },
  absentWarningContent: {
    flex: 1,
  },
  absentWarningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary[300],
    marginBottom: 4,
  },
  absentWarningText: {
    fontSize: 13,
    color: '#B42318',
    lineHeight: 18,
  },

  // ── Clock (below card) ──
  greetClock: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -1,
    marginTop: 24,
  },

  // ── Finger scan icon circle ──
  greetIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },

  // ── Status ──
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginTop: 16,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // ── Shift ──
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 64,
    marginTop: 24,
  },
  shiftItem: { alignItems: 'center' },
  shiftLabel: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  shiftValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginTop: 4,
  },

  // ── Swipe ──
  swipeSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  swipeTrack: {
    backgroundColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  swipeThumb: {
    position: 'absolute',
    left: 6,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary[300],
    lineHeight: 26,
  },

  // ── Map / Confirm ──
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  mapHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  mapBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapHeaderTitle: { flex: 1 },
  mapCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  mapStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mapStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.green[200],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginBottom: 12,
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  mapInfoLabel: {
    fontSize: 13,
    color: colors.neutral[500],
    flex: 1,
  },
  mapInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
    maxWidth: 180,
    textAlign: 'right',
  },

  // ── Centred content views ──
  centeredView: {
    alignItems: 'center',
    paddingTop: 32,
  },

  // ── Emoji illustration ──
  emoji: {
    fontSize: 52,
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 16,
  },

  // ── View titles ──
  viewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  viewSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 24,
  },

  // ── Info card (late / outside / success) ──
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: SCREEN_W - 48,
  },
  infoCardDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },

  // ── Outside campus specific ──
  outsideIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary.alpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  outsideBtnGroup: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  ghostBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary[300],
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[300],
  },

  // ── Success illustration ──
  successIconWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 16,
  },

  // ── Primary button ──
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[300],
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 16,
  },
  fullWidthBtn: {
    marginHorizontal: 24,
    marginBottom: 32,
    width: SCREEN_W - 48,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
