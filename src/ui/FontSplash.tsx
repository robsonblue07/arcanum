import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function FontSplash() {
  return (
    <LinearGradient colors={[colors.void, colors.ink, colors.plum]} style={styles.fill}>
      <View style={styles.seal}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner} />
        </View>
      </View>
      <Text style={styles.wordmark}>ARCANUM</Text>
      <View style={styles.rule} />
      <Text style={styles.tagline}>A geometria do destino</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  seal: {
    marginBottom: 28,
  },
  ringOuter: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  ringInner: {
    backgroundColor: colors.goldDim,
    borderColor: colors.goldSoft,
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    width: 52,
  },
  wordmark: {
    color: colors.goldSoft,
    fontFamily: 'Georgia',
    fontSize: 28,
    letterSpacing: 10,
  },
  rule: {
    backgroundColor: colors.gold,
    height: 1,
    marginVertical: 16,
    opacity: 0.7,
    width: 72,
  },
  tagline: {
    color: colors.mist,
    fontFamily: 'Georgia',
    fontSize: 14,
    letterSpacing: 1.4,
  },
});
