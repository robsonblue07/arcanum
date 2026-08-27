import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  buildKabbalisticTriangle,
  findNegativeSequences,
  generateOptimizedSignatures,
  type NegativeSequence,
  type SignatureCandidate,
} from '../../domain/numerology';
import { InteractiveTriangle } from '../chart';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { useTrainingStore } from '../../store/training-store';
import { colors, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

export function SignatureLabScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);

  const analysis = useMemo(() => {
    if (profile === null) {
      return null;
    }
    const triangle = buildKabbalisticTriangle(profile.fullName);
    const sequences = findNegativeSequences(triangle);
    const optimized = generateOptimizedSignatures(profile.fullName, profile.birthDate);
    return { triangle, sequences, optimized };
  }, [profile]);

  if (profile === null || analysis === null) {
    return <Redirect href="/" />;
  }

  const blocked = analysis.sequences.length > 0;

  return (
    <Screen>
      <AppText variant="kicker">Laboratório de Assinaturas</AppText>
      <AppText variant="title" style={styles.title}>
        Triângulo da Vida
      </AppText>
      <AppText variant="body" style={styles.subtitle}>
        {profile.fullName}
      </AppText>

      {blocked ? (
        <View style={styles.alert}>
          <AppText variant="kicker" style={styles.alertKicker}>
            Atenção
          </AppText>
          <AppText variant="title" style={styles.alertTitle}>
            Bloqueio Energético Detectado
          </AppText>
          <AppText variant="body" style={styles.alertCopy}>
            {formatBlockSummary(analysis.sequences)} no triângulo da sua firma atual.
          </AppText>
        </View>
      ) : (
        <View style={[styles.alert, styles.alertOk]}>
          <AppText variant="title" style={styles.okTitle}>
            Assinatura em harmonia
          </AppText>
          <AppText variant="body" style={styles.alertCopy}>
            Nenhuma sequência de 3 dígitos iguais foi encontrada.
          </AppText>
        </View>
      )}

      <View style={styles.apexRow}>
        <AppText variant="caption" style={styles.apexLabel}>
          Ápice
        </AppText>
        <AppText variant="number" style={styles.apexValue}>
          {analysis.triangle.apex}
        </AppText>
      </View>

      <AppText variant="body" style={styles.touchHint}>
        Toque em um número para abrir o arcano.
      </AppText>
      <InteractiveTriangle sequences={analysis.sequences} triangle={analysis.triangle} />

      <Pressable
        onPress={() => router.push('/report')}
        style={({ pressed }) => [styles.reportCard, pressed && styles.reportPressed]}
      >
        <LinearGradient
          colors={['#3A1420', '#1A1230', '#2A2208']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.reportInner}
        >
          <AppText variant="kicker" style={styles.reportKicker}>
            Diagnóstico
          </AppText>
          <AppText variant="title" style={styles.reportTitle}>
            Ver Relatório: Sua Assinatura Atual vs. Destino
          </AppText>
          <AppText variant="body" style={styles.reportCopy}>
            O bloqueio de um lado. A firma retificada do outro. Veja o que muda no seu traço.
          </AppText>
        </LinearGradient>
      </Pressable>

      <AppText variant="kicker" style={styles.section}>
        Assinaturas otimizadas
      </AppText>
      {analysis.optimized.recommendations.length === 0 ? (
        <SignatureCard candidate={analysis.optimized.original} index={0} />
      ) : (
        analysis.optimized.recommendations.map((candidate, index) => (
          <SignatureCard candidate={candidate} index={index} key={candidate.signature} />
        ))
      )}
    </Screen>
  );
}

function formatBlockSummary(sequences: readonly NegativeSequence[]): string {
  const unique = [...new Set(sequences.map((item) => String(item.digit).repeat(item.length)))];
  if (unique.length === 1) {
    return `Sequência ${unique[0]}`;
  }
  return `Sequências ${unique.join(', ')}`;
}

function SignatureCard({
  candidate,
  index,
}: {
  candidate: SignatureCandidate;
  index: number;
}) {
  const router = useRouter();
  const startTraining = useTrainingStore((state) => state.startTraining);
  const isPremium = useIsPremium();
  const clean = candidate.negativeSequences.length === 0;
  const locked = !isPremium && clean;

  return (
    <Animated.View entering={FadeInDown.delay(140 + index * 120).duration(520)}>
      <View style={styles.card}>
        <View style={styles.signatureRow}>
          <AppText
            variant="signature"
            style={[styles.signatureText, locked ? styles.signatureLocked : null]}
          >
            {candidate.signature}
          </AppText>
          {locked ? (
            <View pointerEvents="none" style={styles.lockBadge}>
              <Ionicons color={colors.goldSoft} name="lock-closed" size={16} />
            </View>
          ) : null}
        </View>
        <View style={styles.badges}>
          <Badge
            ok={clean}
            text={clean ? 'Livre de bloqueios' : `${candidate.negativeSequences.length} bloqueio(s)`}
          />
          <Badge
            ok={candidate.isHarmonicWithDestiny}
            text={
              candidate.isHarmonicWithDestiny
                ? `Ápice ${candidate.triangle.apex} harmônico`
                : `Ápice ${candidate.triangle.apex}`
            }
          />
        </View>
        {locked ? (
          <GoldButton
            label="Desbloquear Minha Nova Assinatura Próspera"
            haptic="warning"
            onPress={() => {
              router.push('/paywall');
            }}
          />
        ) : (
          <GoldButton
            label="Treinar esta Assinatura"
            onPress={() => {
              startTraining(candidate.signature);
              router.push('/train');
            }}
          />
        )}
      </View>
    </Animated.View>
  );
}

function Badge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeWarn]}>
      <AppText
        variant="caption"
        style={[styles.badgeText, ok ? styles.badgeTextOk : styles.badgeTextWarn]}
      >
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 20,
    marginTop: 4,
  },
  alert: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
    gap: 6,
  },
  alertOk: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  alertKicker: {
    color: colors.danger,
    letterSpacing: 2,
  },
  alertTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  okTitle: {
    color: colors.success,
    fontSize: 22,
    lineHeight: 28,
  },
  alertCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  apexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  apexLabel: {
    letterSpacing: 2,
  },
  apexValue: {
    fontSize: 28,
  },
  touchHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  reportCard: {
    borderColor: colors.gold,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 8,
    overflow: 'hidden',
  },
  reportPressed: { opacity: 0.92 },
  reportInner: {
    gap: 8,
    padding: 20,
  },
  reportKicker: {
    color: colors.danger,
    letterSpacing: 2,
  },
  reportTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  reportCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    color: colors.goldSoft,
    marginBottom: 14,
  },
  card: {
    backgroundColor: 'rgba(14, 8, 28, 0.65)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 16,
  },
  signatureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  signatureText: {
    flex: 1,
  },
  signatureLocked: {
    opacity: 0.32,
    ...(Platform.OS === 'web' ? { filter: 'blur(6px)' } : { letterSpacing: 2 }),
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeOk: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  badgeWarn: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  badgeText: { fontSize: 11, letterSpacing: 0.4, textTransform: 'none' },
  badgeTextOk: { color: colors.success },
  badgeTextWarn: { color: colors.danger },
});
