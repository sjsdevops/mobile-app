import { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';

export type DropdownOption = { id: string; label: string };

interface Props {
    label: string;
    value: string;
    options: DropdownOption[];
    onSelect: (id: string) => void;
}

export function ModalDropdown({ label, value, options, onSelect }: Props) {
    const [visible, setVisible] = useState(false);
    const selectedLabel = options.find((o) => o.id === value)?.label || label;

    return (
        <>
            <Pressable style={styles.button} onPress={() => setVisible(true)}>
                <Text style={[styles.buttonText, !value && styles.placeholder]}>{selectedLabel}</Text>
                <ArrowDown2 size={16} color={colors.neutral[500]} />
            </Pressable>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, value === item.id && styles.optionActive]}
                                    onPress={() => { onSelect(item.id); setVisible(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.optionText, value === item.id && styles.optionTextActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            style={styles.list}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
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
        marginBottom: 12,
    },
    buttonText: { fontSize: 14, color: colors.neutral[900], flex: 1 },
    placeholder: { color: colors.neutral[400] },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '60%',
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.neutral[900],
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    list: { paddingHorizontal: 12 },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 4,
    },
    optionActive: { backgroundColor: colors.primary.alpha ?? 'rgba(20,79,204,0.08)' },
    optionText: { fontSize: 15, color: colors.neutral[800] },
    optionTextActive: { fontWeight: '700', color: colors.primary[300] },
});
