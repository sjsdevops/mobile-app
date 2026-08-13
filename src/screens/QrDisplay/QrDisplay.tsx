import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useQrDisplayVM } from './QrDisplay.vm';

export function QrDisplayScreen() {
  const vm = useQrDisplayVM();

  const genTime = vm.generatedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Attendance QR</Text>
        <Text style={styles.subtitle}>Scan to mark your attendance</Text>

        <View style={styles.qrCard} {...vm.panResponder.panHandlers}>
          <QRCode
            value={vm.qrPayload}
            size={240}
            color={colors.neutral[1000]}
            backgroundColor={colors.neutral[100]}
            ecl="M"
          />
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{genTime}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Refreshes in</Text>
            <Text style={[styles.metaValue, styles.countdownValue]}>
              {vm.countdown}s
            </Text>
          </View>
        </View>

        <Modal
          visible={vm.settingsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => vm.setSettingsOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>QR Refresh Time</Text>
              <Text style={styles.modalSubtitle}>
                The QR regenerates every selected interval.
              </Text>
              {vm.refreshOptions.map((opt) => {
                const active = opt.value === vm.refreshSeconds;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => vm.selectRefresh(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => vm.setSettingsOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 4,
    marginBottom: 24,
  },
  qrCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[1000],
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  metaCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: colors.neutral[1000],
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  metaDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  metaLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  countdownValue: {
    color: colors.primary[300],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 10,
  },
  optionRowActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary.alpha,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
  },
  optionTextActive: {
    color: colors.primary[300],
  },
  modalClose: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary[300],
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[100],
  },
});
