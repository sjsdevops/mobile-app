import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export function StatCard({
  value,
  label,
  valueColor,
}: {
  value: string | number;
  label: string;
  valueColor?: string;
}) {
  return (
    <View style={sStyles.card}>
      <Text style={[sStyles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
      <Text style={sStyles.label}>{label}</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: colors.neutral[500],
  },
});
