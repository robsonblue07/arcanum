import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { buildKabbalisticTriangle, findNegativeSequences } from '../../domain/numerology';
import { useProfileStore } from '../../store/profile-store';
import { colors, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { Screen } from '../../ui/Screen';
import { InteractiveTriangle } from './InteractiveTriangle';

export function LifeTriangleScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);

  const analysis = useMemo(() => {
    if (profile === null) {
      return null;
    }
    const triangle = buildKabbalisticTriangle(profile.fullName);
    const sequences = findNegativeSequences(triangle);
    return { triangle, sequences };
  }, [profile]);

  if (profile === null || analysis === null) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
          <Ionicons color={colors.goldSoft} name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText variant="kicker">Visão cabalística</AppText>
          <AppText variant="title" style={styles.title}>
            Triângulo da Vida
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            {profile.fullName}
          </AppText>
        </View>
      </View>

      <View style={styles.apexRow}>
        <AppText variant="caption">Ápice</AppText>
        <AppText variant="number" style={styles.apex}>
          {analysis.triangle.apex}
        </AppText>
      </View>

      <AppText variant="body" style={styles.hint}>
        Toque em qualquer número da pirâmide para revelar o arcano, o arquétipo e a vibração no
        nome.
      </AppText>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, styles.swatchGold]} />
          <AppText variant="caption" style={styles.legendText}>
            Arcano
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, styles.swatchBlocked]} />
          <AppText variant="caption" style={styles.legendText}>
            Bloqueio
          </AppText>
        </View>
      </View>

      <InteractiveTriangle
        density="comfortable"
        sequences={analysis.sequences}
        showBaseLetters
        triangle={analysis.triangle}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  close: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: { flex: 1 },
  title: { marginTop: 6 },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
  },
  apexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 10,
  },
  apex: { fontSize: 28 },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    height: 14,
    width: 14,
  },
  swatchGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  swatchBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  legendText: {
    letterSpacing: 1,
    textTransform: 'none',
  },
});
