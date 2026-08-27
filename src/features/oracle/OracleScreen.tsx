import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { readDailyOracle } from '../../domain/numerology';
import { formatLongLocalizedDate } from '../../lib/dates';
import { getActiveLanguage } from '../../lib/i18n';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GoldButton } from '../../ui/GoldButton';
import { NumberSeal } from '../../ui/NumberSeal';
import { Screen } from '../../ui/Screen';

export function OracleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const isPremium = useIsPremium();

  if (profile === null) {
    return <Redirect href="/" />;
  }

  const reading = readDailyOracle(profile.birthDate);
  const locked = !isPremium;

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">{t('oracle.kicker')}</AppText>
      <AppText variant="display" style={styles.title}>
        {t('oracle.title')}
      </AppText>
      <AppText variant="body" style={styles.date}>
        {formatLongLocalizedDate(reading.cycles.calendarDate.iso, getActiveLanguage())}
      </AppText>

      <View style={styles.sealWrap}>
        <NumberSeal caption={t('common.personalDay')} size="lg" value={reading.entry.day} />
      </View>

      <AppText variant="kicker" style={styles.entryKicker}>
        {reading.entry.kicker}
      </AppText>
      <AppText variant="title" style={styles.entryTitle}>
        {reading.entry.title}
      </AppText>
      <AppText variant="body" style={styles.summary}>
        {reading.entry.summary}
      </AppText>

      <View pointerEvents={locked ? 'none' : 'auto'} style={locked ? styles.lockedInner : null}>
        <View style={styles.detailCard}>
          <AppText variant="caption">{t('oracle.counsel')}</AppText>
          <AppText variant="body" style={styles.counsel}>
            {reading.entry.counsel}
          </AppText>
        </View>
        <View style={[styles.detailCard, styles.avoidCard]}>
          <AppText variant="caption">{t('oracle.avoid')}</AppText>
          <AppText variant="body" style={styles.counsel}>
            {reading.entry.avoid}
          </AppText>
        </View>
        <AppText variant="caption" style={styles.cycleMeta}>
          {t('oracle.cycleMeta', {
            year: reading.cycles.personalYear,
            month: reading.cycles.personalMonth,
          })}
        </AppText>
      </View>

      {locked ? (
        <View style={styles.lockFooter}>
          <Ionicons color={colors.goldSoft} name="lock-closed" size={22} />
          <AppText variant="body" style={styles.lockCopy}>
            {t('oracle.lockCopy')}
          </AppText>
          <GoldButton
            label={t('oracle.lockCta')}
            haptic="warning"
            onPress={() => {
              router.push('/paywall');
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
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
  date: {
    marginTop: 10,
    marginBottom: 8,
  },
  sealWrap: {
    alignItems: 'center',
    marginVertical: 22,
  },
  entryKicker: {
    marginBottom: 6,
  },
  entryTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  summary: {
    color: colors.ivory,
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 12,
    marginBottom: 22,
  },
  detailCard: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
    padding: 18,
  },
  avoidCard: {
    borderColor: colors.danger,
  },
  counsel: {
    color: colors.ivory,
    fontSize: 16,
    lineHeight: 26,
  },
  cycleMeta: {
    marginTop: 4,
    textAlign: 'center',
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
});
