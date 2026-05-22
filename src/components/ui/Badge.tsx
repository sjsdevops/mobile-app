import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export type BadgeVariant = 'green' | 'blue' | 'gray';

const VARIANTS: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: 'rgba(31,193,107,0.15)', text: colors.green[200] },
  blue:  { bg: colors.primary[50] ?? 'rgba(20,79,204,0.10)', text: colors.primary[300] },
  gray:  { bg: colors.neutral[200],    text: colors.neutral[600] },
};

export function Badge({
  label,
  variant = 'green',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const v = VARIANTS[variant];
  return (
    <View style={[bStyles.pill, { backgroundColor: v.bg }]}>
      <Text style={[bStyles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
