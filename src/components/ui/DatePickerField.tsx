import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar1 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';

interface Props {
  value: string; // YYYY-MM-DD or empty
  onChange: (dateStr: string) => void;
  placeholder?: string;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePickerField({ value, onChange, placeholder = 'Select date' }: Props) {
  const [show, setShow] = useState(false);
  // On iOS we hold a pending value until the user taps Done
  const [pendingDate, setPendingDate] = useState<Date>(value ? new Date(value) : new Date());

  const dateObj = value ? new Date(value) : new Date();

  const displayText = value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : placeholder;

  function openPicker() {
    // Reset pending to current value each time picker opens
    setPendingDate(value ? new Date(value) : new Date());
    setShow(true);
  }

  // ── Android: single onChange fires on confirm, dismiss on cancel ──
  function handleAndroidChange(_event: any, selectedDate?: Date) {
    setShow(false);
    if (selectedDate) {
      onChange(toDateString(selectedDate));
    }
  }

  // ── iOS spinner: update pendingDate on every scroll but don't commit yet ──
  function handleIOSScroll(_event: any, selectedDate?: Date) {
    if (selectedDate) {
      setPendingDate(selectedDate);
    }
  }

  function handleIOSDone() {
    setShow(false);
    onChange(toDateString(pendingDate));
  }

  function handleIOSCancel() {
    setShow(false);
    // discard pendingDate — original value unchanged
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={openPicker}>
        <Text style={[styles.text, !value && styles.placeholder]}>{displayText}</Text>
        <Calendar1 size={18} color={colors.neutral[500]} variant="Linear" />
      </Pressable>

      {/* ── Android: inline picker (no modal needed) ── */}
      {Platform.OS !== 'ios' && show && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* ── iOS: modal with spinner + Cancel / Done ── */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <Pressable style={styles.backdrop} onPress={handleIOSCancel} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={handleIOSCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleIOSDone} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={pendingDate}
              mode="date"
              display="spinner"
              onChange={handleIOSScroll}
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
  },
  text: { fontSize: 14, color: colors.neutral[900], flex: 1 },
  placeholder: { color: colors.neutral[400] },

  // iOS modal sheet
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.neutral[100],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  cancelText: {
    fontSize: 16,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  doneText: {
    fontSize: 16,
    color: colors.primary[300],
    fontWeight: '700',
  },
  iosPicker: {
    width: '100%',
  },
});
