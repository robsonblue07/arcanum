import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  calculateSynastry,
  extractLetters,
  type AffinitySeal,
  type DestinyHarmonyKind,
  type SynastryResult,
} from '../../domain/numerology';
import { brazilianDateToIso, formatDisplayDate, maskBrazilianDate } from '../../lib/dates';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';
import { CrossedTriangles } from './CrossedTriangles';

export function SynastryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const isPremium = useIsPremium();

  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [result, setResult] = useState<SynastryResult | null>(null);

  if (profile === null) {
    return <Redirect href="/" />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  const onReveal = () => {
    const trimmed = partnerName.trim();
    const iso = brazilianDateToIso(partnerDate);
    const letters = extractLetters(trimmed);
    const nextNameError =
      letters.length < 2 ? t('synastry.nameError') : undefined;
    const nextDateError = iso === null ? t('synastry.dateError') : undefined;

    setNameError(nextNameError);
    setDateError(nextDateError);
    if (nextNameError !== undefined || nextDateError !== undefined || iso === null) {
      setResult(null);
      return;
    }

    setResult(
      calculateSynastry(
        { name: profile.fullName, birthDate: profile.birthDate },
        { name: trimmed, birthDate: iso },
      ),
    );
  };

  const locked = result !== null && !isPremium;

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">{t('synastry.kicker')}</AppText>
      <AppText variant="display" style={styles.title}>
        {t('synastry.title')}
      </AppText>
      <AppText variant="body" style={styles.lead}>
        {t('synastry.lead')}
      </AppText>

      <View style={styles.youCard}>
        <AppText variant="caption">{t('synastry.yourSignature')}</AppText>
        <AppText variant="signature" style={styles.youName}>
          {profile.fullName}
        </AppText>
        <AppText variant="body" style={styles.youMeta}>
          {formatDisplayDate(profile.birthDate)}
        </AppText>
      </View>

      <View style={styles.form}>
        <Field
          autoCapitalize="words"
          error={nameError}
          label={t('synastry.partnerName')}
          onChangeText={(value) => {
            setPartnerName(value);
            setNameError(undefined);
          }}
          placeholder={t('synastry.partnerPlaceholder')}
          value={partnerName}
        />
        <Field
          error={dateError}
          keyboardType="number-pad"
          label={t('synastry.birth')}
          onChangeText={(value) => {
            setPartnerDate(maskBrazilianDate(value));
            setDateError(undefined);
          }}
          placeholder={t('synastry.datePlaceholder')}
          value={partnerDate}
        />
      </View>

      <GoldButton label={t('synastry.reveal')} onPress={onReveal} style={styles.reveal} />

      {result !== null ? (
        <ResultPanel
          locked={locked}
          onUnlock={() => {
            router.push('/paywall');
          }}
          result={result}
        />
      ) : null}
    </Screen>
  );
}

function ResultPanel({
  result,
  locked,
  onUnlock,
}: {
  result: SynastryResult;
  locked: boolean;
  onUnlock: () => void;
}) {
  const { t } = useTranslation();
  const givenA = result.personA.normalizedName.split(/\s+/)[0] ?? result.personA.name;
  const givenB = result.personB.normalizedName.split(/\s+/)[0] ?? result.personB.name;

  return (
    <View style={styles.result}>
      <AppText variant="kicker">{t('synastry.affinity')}</AppText>
      <AppText variant="number" style={styles.score}>
        {result.affinityScore}%
      </AppText>
      <AppText variant="caption" style={styles.harmony}>
        {t('synastry.destinies', { kind: harmonyLabel(result.destinyHarmony.kind, t) })}
      </AppText>

      <View style={styles.seals}>
        {(locked ? result.seals.slice(0, 1) : result.seals).map((seal) => (
          <SealChip key={seal} seal={seal} />
        ))}
      </View>

      <View>
        <View pointerEvents={locked ? 'none' : 'auto'} style={locked ? styles.lockedInner : null}>
          <CrossedTriangles
            left={{
              label: givenA,
              sequences: result.personA.negativeSequences,
              triangle: result.personA.triangle,
            }}
            right={{
              label: givenB,
              sequences: result.personB.negativeSequences,
              triangle: result.personB.triangle,
            }}
          />

          <AppText variant="body" style={styles.synthesis}>
            {result.synthesis}
          </AppText>

          {result.sharedArcana.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">{t('synastry.sharedArcana')}</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.sharedArcana
                  .map((item) => `${item.arcanaId} · ${item.namePt}`)
                  .join('  ·  ')}
              </AppText>
            </View>
          ) : (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">{t('synastry.sharedArcana')}</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {t('synastry.noSharedArcana')}
              </AppText>
            </View>
          )}

          {result.crossedBlockages.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">{t('synastry.crossedBlockages')}</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.crossedBlockages
                  .map((item) => {
                    const from = item.from === 'A' ? givenA : givenB;
                    const onto = item.onto === 'A' ? givenA : givenB;
                    return t('synastry.crossedBlockageLine', {
                      from,
                      digit: item.digit,
                      onto,
                    });
                  })
                  .join('. ')}
                .
              </AppText>
            </View>
          ) : (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">{t('synastry.crossedBlockages')}</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {t('synastry.noCrossedBlockages')}
              </AppText>
            </View>
          )}

          {result.crossedArcana.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">{t('synastry.crossedArcana')}</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.crossedArcana
                  .map((item) => `${item.arcanaId} · ${item.namePt}`)
                  .join('  ·  ')}
              </AppText>
            </View>
          ) : null}
        </View>

        {locked ? (
          <View style={styles.lockFooter}>
            <Ionicons color={colors.goldSoft} name="lock-closed" size={22} />
            <AppText variant="body" style={styles.lockCopy}>
              {t('synastry.lockCopy')}
            </AppText>
            <GoldButton label={t('synastry.lockCta')} onPress={onUnlock} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SealChip({ seal }: { seal: AffinitySeal }) {
  const { t } = useTranslation();
  return (
    <View style={styles.seal}>
      <AppText variant="caption" style={styles.sealText}>
        {t(sealKey(seal))}
      </AppText>
    </View>
  );
}

function sealKey(seal: AffinitySeal): string {
  if (seal === 'Aliança de Ouro no Amor') {
    return 'synastry.seals.goldAlliance';
  }
  if (seal === 'Sociedade Próspera') {
    return 'synastry.seals.prosperousSociety';
  }
  return 'synastry.seals.karmicAdjustment';
}

function harmonyLabel(kind: DestinyHarmonyKind, t: TFunction): string {
  if (kind === 'harmonic') {
    return t('synastry.harmonic');
  }
  if (kind === 'challenging') {
    return t('synastry.challenging');
  }
  return t('synastry.neutral');
}

const styles = StyleSheet.create({
  close: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginBottom: 18,
    width: 40,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    marginTop: 8,
  },
  lead: {
    marginTop: 12,
    marginBottom: 22,
  },
  youCard: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
    marginBottom: 18,
    padding: 16,
  },
  youName: {
    fontSize: 22,
  },
  youMeta: {
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  reveal: {
    marginTop: 22,
  },
  result: {
    borderColor: colors.gold,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
  },
  score: {
    fontFamily: fonts.displayBold,
    fontSize: 64,
    lineHeight: 72,
    marginTop: 8,
  },
  harmony: {
    color: colors.goldSoft,
    marginBottom: 16,
  },
  seals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  seal: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sealText: {
    color: colors.goldSoft,
    letterSpacing: 1,
  },
  lockedInner: {
    opacity: 0.28,
    ...(Platform.OS === 'web' ? { filter: 'blur(7px)' } : null),
  },
  lockFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 4, 15, 0.72)',
    borderColor: colors.gold,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 14,
    marginTop: 16,
    padding: 16,
  },
  lockCopy: {
    color: colors.ivory,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  synthesis: {
    color: colors.ivory,
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 12,
  },
  arcanaBlock: {
    gap: 6,
    marginTop: 16,
  },
  arcanaLine: {
    fontSize: 15,
    lineHeight: 22,
  },
});
