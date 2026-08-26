import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme';

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle> | undefined;
  disabled?: boolean | undefined;
}

export function GhostButton({ label, onPress, style, disabled = false }: GhostButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        style,
        pressed && styles.pressed,
        disabled && styles.dimmed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 22,
  },
  label: {
    color: colors.goldSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.8 },
  dimmed: { opacity: 0.55 },
});
