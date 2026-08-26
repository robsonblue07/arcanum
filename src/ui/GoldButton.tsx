import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '../theme';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  variant?: 'primary' | 'secondary' | undefined;
}

export function GoldButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
}: GoldButtonProps) {
  const dimmed = disabled || loading;
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={dimmed}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        secondary && styles.wrapSecondary,
        style,
        pressed && styles.pressed,
        dimmed && styles.dimmed,
      ]}
    >
      {secondary ? (
        loading ? (
          <ActivityIndicator color={colors.goldSoft} />
        ) : (
          <Text style={styles.labelSecondary}>{label}</Text>
        )
      ) : (
        <LinearGradient
          colors={dimmed ? ['#6B5A28', '#4A3E1C'] : [colors.goldSoft, colors.gold, '#B68B1A']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.md,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  wrapSecondary: {
    alignItems: 'center',
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderWidth: 1,
    elevation: 0,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 22,
    shadowOpacity: 0,
  },
  gradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    color: colors.void,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  labelSecondary: {
    color: colors.goldSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  dimmed: { shadowOpacity: 0 },
});
