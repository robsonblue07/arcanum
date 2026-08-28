import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { hapticLight, hapticSuccess, hapticWarning } from '../lib/haptics';
import { colors, fonts, radii } from '../theme';
import { GoldenShimmer } from './GoldenShimmer';

export type ButtonHaptic = 'light' | 'success' | 'warning' | 'none';
export type ButtonLoader = 'shimmer' | 'spinner';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  variant?: 'primary' | 'secondary' | undefined;
  haptic?: ButtonHaptic | undefined;
  loader?: ButtonLoader | undefined;
}

export function GoldButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
  haptic = 'light',
  loader = 'shimmer',
}: GoldButtonProps) {
  const dimmed = disabled || loading;
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={dimmed}
      onPress={() => {
        if (haptic === 'warning') {
          hapticWarning();
        } else if (haptic === 'success') {
          hapticSuccess();
        } else if (haptic === 'light') {
          hapticLight();
        }
        onPress();
      }}
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
          loader === 'spinner' ? (
            <ActivityIndicator color={colors.goldSoft} />
          ) : (
            <GoldenShimmer height={18} style={styles.shimmerCompact} />
          )
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
            loader === 'spinner' ? (
              <ActivityIndicator color={colors.void} />
            ) : (
              <GoldenShimmer height={18} style={styles.shimmerOnGold} />
            )
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
  shimmerCompact: {
    maxWidth: 120,
  },
  shimmerOnGold: {
    backgroundColor: 'rgba(7, 4, 15, 0.18)',
    maxWidth: 132,
  },
  label: {
    color: colors.void,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
    flexWrap: 'wrap',
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
