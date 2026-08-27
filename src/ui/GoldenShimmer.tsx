import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radii } from '../theme';

const GOLD_DIM = 'rgba(212, 175, 55, 0.15)';
const GOLD_LIT = 'rgba(212, 175, 55, 0.35)';

interface GoldenShimmerProps {
  height?: number | undefined;
  style?: StyleProp<ViewStyle> | undefined;
}

export function GoldenShimmer({ height = 56, style }: GoldenShimmerProps) {
  const progress = useSharedValue(0);
  const width = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [progress]);

  const gleam = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-width.value, width.value]),
      },
    ],
  }));

  return (
    <View
      onLayout={(event) => {
        width.value = event.nativeEvent.layout.width;
      }}
      style={[styles.track, { height }, style]}
    >
      <Animated.View style={[styles.beam, gleam]}>
        <LinearGradient
          colors={[GOLD_DIM, GOLD_LIT, GOLD_DIM]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function GoldenShimmerStack({
  count = 3,
  itemHeight = 88,
}: {
  count?: number | undefined;
  itemHeight?: number | undefined;
}) {
  return (
    <View style={styles.stack}>
      {Array.from({ length: count }, (_, index) => (
        <GoldenShimmer height={itemHeight} key={`shimmer-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: GOLD_DIM,
    borderRadius: radii.md,
    overflow: 'hidden',
    width: '100%',
  },
  beam: {
    ...StyleSheet.absoluteFill,
    width: '55%',
  },
  stack: {
    gap: 12,
    width: '100%',
  },
});
