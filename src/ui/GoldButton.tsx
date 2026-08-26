import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  style?: StyleProp<ViewStyle> | undefined;
}

export function GoldButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: GoldButtonProps) {
  const dimmed = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={dimmed}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed, dimmed && styles.dimmed]}
    >
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
  gradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  label: {
    color: colors.void,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  dimmed: { shadowOpacity: 0 },
});
