import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  generateOptimizedSignatures,
  selectRectifiedSignature,
} from '../../domain/numerology';
import { captureViewPng, sharePng } from '../../lib/share-png';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { useTrainingStore } from '../../store/training-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';
import { CriticalTriangle } from './CriticalTriangle';
import { blockageImpactLine, reliefLine, sequenceCodes } from './report-copy';

export function SignatureReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const startTraining = useTrainingStore((state) => state.startTraining);
  const isPremium = useIsPremium();
  const captureRef = useRef<View>(null);
  const captureSize = useRef({ width: 0, height: 0 });
  const [sharing, setSharing] = useState(false);
  const [hint, setHint] = useState<string | undefined>();

  const report = useMemo(() => {
    if (profile === null) {
      return null;
    }
    const optimized = generateOptimizedSignatures(profile.fullName, profile.birthDate);
    const rectified = selectRectifiedSignature(optimized);
    return { original: optimized.original, rectified };
  }, [profile]);

  if (profile === null || report === null) {
    return <Redirect href="/(tabs)/signature-lab" />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/signature-lab');
  };

  const onShare = async () => {
    setSharing(true);
    setHint(undefined);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const uri = await captureViewPng(captureRef, 'arcanum-diagnostico', captureSize.current);
      await sharePng(uri, t('report.shareDialog'));
    } catch (caught) {
      setHint(caught instanceof Error ? caught.message : t('report.shareError'));
    } finally {
      setSharing(false);
    }
  };

  const { original, rectified } = report;
  const originalCodes = sequenceCodes(original.negativeSequences);
  const sameSignature = original.signature === rectified.signature;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
          <Ionicons color={colors.goldSoft} name="close" size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText variant="kicker">{t('report.kicker')}</AppText>
          <AppText variant="title" style={styles.headerTitle}>
            {t('report.title')}
          </AppText>
        </View>
      </View>

      <View
        collapsable={false}
        onLayout={(event) => {
          captureSize.current = event.nativeEvent.layout;
        }}
        ref={captureRef}
        style={styles.capture}
      >
        <LinearGradient colors={[colors.void, colors.ink, '#16081F']} style={styles.captureInner}>
          <AppText variant="kicker" style={styles.brand}>
            Arcanum
          </AppText>
          <AppText variant="caption" style={styles.brandSub}>
            {t('report.brandSub')}
          </AppText>

          <View style={styles.problem}>
            <AppText variant="kicker" style={styles.problemKicker}>
              {t('report.problem')}
            </AppText>
            <AppText variant="signature" style={styles.problemName}>
              {original.signature}
            </AppText>
            <View style={styles.metaRow}>
              <MetaChip danger label={t('report.apex', { value: original.triangle.apex })} />
              {originalCodes.length > 0 ? (
                originalCodes.map((code) => <MetaChip danger key={code} label={code} />)
              ) : (
                <MetaChip danger={false} label={t('report.noSequence')} />
              )}
            </View>
            <CriticalTriangle
              sequences={original.negativeSequences}
              tone="danger"
              triangle={original.triangle}
            />
            <AppText variant="body" style={styles.impact}>
              {blockageImpactLine(original.negativeSequences, t)}
            </AppText>
          </View>

          <View style={styles.versus}>
            <View style={styles.versusLine} />
            <AppText variant="caption" style={styles.versusLabel}>
              vs
            </AppText>
            <View style={styles.versusLine} />
          </View>

          <View style={styles.solution}>
            <AppText variant="kicker">{t('report.solution')}</AppText>
            <AppText variant="signature" style={styles.solutionName}>
              {rectified.signature}
            </AppText>
            <View style={styles.metaRow}>
              <MetaChip
                danger={false}
                label={
                  rectified.isHarmonicWithDestiny
                    ? t('report.apexHarmonic', { value: rectified.triangle.apex })
                    : t('report.apex', { value: rectified.triangle.apex })
                }
              />
              <MetaChip danger={false} label={t('report.destinyChip', { value: rectified.destinyNumber })} />
              {rectified.negativeSequences.length === 0 ? (
                <MetaChip danger={false} label={t('report.freeOfBlockages')} />
              ) : null}
            </View>
            <CriticalTriangle
              sequences={rectified.negativeSequences}
              tone="gold"
              triangle={rectified.triangle}
            />
            <AppText variant="body" style={styles.relief}>
              {sameSignature ? t('report.alreadyAligned') : reliefLine(rectified, t)}
            </AppText>
          </View>

          <AppText variant="caption" style={styles.watermark}>
            {t('report.watermark')}
          </AppText>
        </LinearGradient>
      </View>

      {hint !== undefined ? (
        <AppText variant="body" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}

      <GoldButton
        label={t('report.share')}
        loading={sharing}
        onPress={() => {
          void onShare();
        }}
        style={styles.share}
      />
      {sameSignature ? null : (
        <GhostButton
          label={t('report.train')}
          onPress={() => {
            if (!isPremium) {
              router.push('/paywall');
              return;
            }
            startTraining(rectified.signature);
            router.push('/train');
          }}
          style={styles.train}
        />
      )}
    </Screen>
  );
}

function MetaChip({ label, danger }: { label: string; danger: boolean }) {
  return (
    <View style={[styles.chip, danger ? styles.chipDanger : styles.chipGold]}>
      <AppText variant="caption" style={[styles.chipText, danger ? styles.chipTextDanger : null]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginTop: 4,
  },
  capture: {
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  captureInner: {
    gap: 14,
    padding: 20,
  },
  brand: {
    textAlign: 'center',
  },
  brandSub: {
    letterSpacing: 2,
    marginTop: -8,
    textAlign: 'center',
  },
  problem: {
    backgroundColor: 'rgba(232, 160, 180, 0.08)',
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  problemKicker: {
    color: colors.danger,
  },
  problemName: {
    color: colors.ivory,
    fontSize: 26,
  },
  solution: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: colors.gold,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  solutionName: {
    color: colors.goldSoft,
    fontSize: 26,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipDanger: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  chipGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  chipText: {
    color: colors.goldSoft,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'none',
  },
  chipTextDanger: {
    color: colors.danger,
  },
  impact: {
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  relief: {
    color: colors.ivory,
    fontSize: 15,
    lineHeight: 22,
  },
  versus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  versusLine: {
    backgroundColor: colors.line,
    flex: 1,
    height: 1,
  },
  versusLabel: {
    color: colors.gold,
    letterSpacing: 3,
  },
  watermark: {
    letterSpacing: 2,
    textAlign: 'center',
  },
  hint: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 12,
  },
  share: {
    marginTop: 18,
  },
  train: {
    marginTop: 12,
  },
});
