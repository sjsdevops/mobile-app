import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar1 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';

interface Props {
    value: string; // YYYY-MM-DD or empty
    onChange: (dateStr: string) => void;
    placeholder?: string;
}

export function DatePickerField({ value, onChange, placeholder = 'Select date' }: Props) {
    const [show, setShow] = useState(false);

    const dateObj = value ? new Date(value) : new Date();

    const displayText = value
        ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : placeholder;

    const handleChange = (_event: any, selectedDate?: Date) => {
        setShow(Platform.OS === 'ios'); // iOS keeps picker open
        if (selectedDate) {
            const y = selectedDate.getFullYear();
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedDate.getDate()).padStart(2, '0');
            onChange(`${y}-${m}-${d}`);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={() => setShow(true)}>
                <Text style={[styles.text, !value && styles.placeholder]}>{displayText}</Text>
                <Calendar1 size={18} color={colors.neutral[500]} variant="Linear" />
            </Pressable>

            {show && (
                <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                />
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
});
