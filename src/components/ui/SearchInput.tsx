import { StyleSheet, TextInput, View } from 'react-native';
import { SearchNormal1 } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search...',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={sStyles.container}>
      <SearchNormal1 color={colors.neutral[400]} size={16} variant="Linear" />
      <TextInput
        style={sStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
      />
    </View>
  );
}

const sStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[800],
    padding: 0,
  },
});
