import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Scan, TickCircle } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { useQrScannerVM, type QrPunchMode } from './QrScanner.vm';

export function QrScannerScreen({ mode }: { mode: QrPunchMode }) {
  const vm = useQrScannerVM(mode);

  const isCheckOut = mode === 'punch-out';
  const title = isCheckOut ? 'Scan to Punch Out' : 'Scan to Punch In';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color={colors.neutral[800]} size={20} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {vm.success ? (
        <View style={styles.centered}>
          <View style={styles.successIconWrap}>
            <Scan color={colors.primary[300]} size={64} variant="Bold" />
            <View style={styles.successBadge}>
              <TickCircle color={colors.green[200]} size={26} variant="Bold" />
            </View>
          </View>
          <Text style={styles.viewTitle}>
            {isCheckOut ? 'Punch Out Successful!' : 'Punch In Successful!'}
          </Text>
          <Text style={styles.viewSubtitle}>
            {isCheckOut
              ? 'Your QR punch out has been recorded.'
              : 'Your QR punch in has been recorded.'}
          </Text>

          {/* Punch times summary */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{vm.fmtDate(vm.punchInTime || vm.punchOutTime)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Punch In</Text>
              <Text style={styles.infoValue}>{vm.fmtTime(vm.punchInTime)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Punch Out</Text>
              <Text style={styles.infoValue}>{vm.fmtTime(vm.punchOutTime)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={vm.onDone}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : vm.permissionDenied || (vm.permission && !vm.permission.granted) ? (
        <View style={styles.centered}>
          <Scan color={colors.neutral[400]} size={64} variant="Bold" />
          <Text style={styles.viewTitle}>Camera Permission Required</Text>
          <Text style={styles.viewSubtitle}>
            Allow camera access to scan the attendance QR code.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={vm.askCameraPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={vm.scanned || vm.submitting ? undefined : vm.onBarcodeScanned}
            />
            <View style={styles.scanFrame} pointerEvents="none">
              <Scan color="#fff" size={36} variant="Bold" />
            </View>
            {vm.submitting && (
              <View style={styles.overlay} pointerEvents="none">
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.overlayText}>Recording…</Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Point your camera at the attendance QR</Text>
            <Text style={styles.footerText}>
              The QR is displayed on the attendance kiosk. It refreshes every few seconds.
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface.light,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.neutral[1000],
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
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
    lineHeight: 20,
    marginBottom: 24,
  },
  infoCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: colors.neutral[1000],
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoDivider: {
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
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary[300],
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
