import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface NumberSealProps {
  value: number;
  caption: string;
  size?: 'md' | 'lg';
}

export function NumberSeal({ value, caption, size = 'md' }: NumberSealProps) {
  const dimension = size === 'lg' ? 128 : 92;
  const fontSize = size === 'lg' ? 52 : 36;

  return (
    <View style={styles.wrap}>
      <View style={[styles.ring, { height: dimension, width: dimension }]}>
        <View style={styles.inner}>
          <Text style={[styles.value, { fontSize }]}>{value}</Text>
        </View>
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  ring: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    shadowColor: colors.neon,
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  inner: {
    alignItems: 'center',
    backgroundColor: colors.plum,
    borderColor: colors.goldDim,
    borderRadius: 999,
    borderWidth: 1,
    height: '82%',
    justifyContent: 'center',
    width: '82%',
  },
  value: {
    color: colors.goldSoft,
    fontWeight: '600',
  },
  caption: {
    color: colors.mist,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
