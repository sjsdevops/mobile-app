import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';

// ─── CircleIconBtn ─────────────────────────────────────────────────────────────

export function CircleIconBtn({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: ReactNode;
}) {
  return (
    <TouchableOpacity
      style={hStyles.btn}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {children}
    </TouchableOpacity>
  );
}

// ─── ScreenHeader ─────────────────────────────────────────────────────────────

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional element rendered on the right; if omitted a spacer keeps the title centred */
  rightElement?: ReactNode;
  showDivider?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  showDivider = true,
}: ScreenHeaderProps) {
  return (
    <>
      <View style={hStyles.row}>
        <CircleIconBtn onPress={onBack}>
          <ArrowLeft color={colors.neutral[800]} size={18} variant="Linear" />
        </CircleIconBtn>

        <View style={hStyles.center}>
          <Text style={hStyles.title}>{title}</Text>
          {subtitle ? <Text style={hStyles.subtitle}>{subtitle}</Text> : null}
        </View>

        {rightElement ? (
          rightElement
        ) : (
          <View style={hStyles.btn} />
        )}
      </View>

      {showDivider && <View style={hStyles.divider} />}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const hStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.surface.light,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 16,
  },
});
