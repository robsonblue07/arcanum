import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { calculatePythagoreanChart } from '../../domain/numerology';
import { formatDisplayDate } from '../../lib/dates';
import { calculatePersonalDay } from '../../lib/personal-day';
import { toUserError } from '../../lib/to-user-error';
import { signOutCurrentUser } from '../../services';
import { setPremiumUnlocked, useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';
import { GoldButton } from '../../ui/GoldButton';
import { LanguageSwitcher } from '../../ui/LanguageSwitcher';
import { NumberSeal } from '../../ui/NumberSeal';
import { Screen } from '../../ui/Screen';

export function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const clearProfile = useProfileStore((state) => state.clearProfile);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | undefined>();
  const isPremium = useIsPremium();
  const [simulating, setSimulating] = useState(false);

  if (profile === null) {
    return <Redirect href="/" />;
  }

  const chart = calculatePythagoreanChart(profile.fullName, profile.birthDate);
  const personalDay = calculatePersonalDay(profile.birthDate);

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(800).delay(40)} style={styles.intro}>
        <View style={styles.introHeader}>
          <AppText variant="kicker">{t('dashboard.kicker')}</AppText>
          <LanguageSwitcher />
        </View>
        <AppText variant="title" style={styles.hello}>
          {t('dashboard.hello', { name: firstName(profile.fullName) })}
        </AppText>
        <AppText variant="body" style={styles.meta}>
          {formatDisplayDate(profile.birthDate)}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(180)} style={styles.seals}>
        <NumberSeal caption={t('common.destiny')} size="lg" value={chart.destinyNumber} />
        <NumberSeal caption={t('common.mission')} value={chart.expressionNumber} />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(650).delay(320)} style={styles.dayChip}>
        <AppText variant="caption" style={styles.dayLabel}>
          {t('common.personalDay')}
        </AppText>
        <AppText variant="number" style={styles.dayValue}>
          {personalDay}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(360)}>
        <Pressable
          onPress={() => router.push('/oracle' as Href)}
          style={({ pressed }) => [styles.heroCard, styles.oracleCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#2A2410', '#12081F']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker">{t('dashboard.oracleKicker')}</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.oracleTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.oracleCopy', { day: personalDay })}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.oracleCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(420)}>
        <Pressable
          onPress={() => router.push('/triangle')}
          style={({ pressed }) => [styles.heroCard, styles.triangleCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#3A2A08', '#160E28']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker">{t('dashboard.triangleKicker')}</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.triangleTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.triangleCopy')}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.triangleCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(520)}>
        <Pressable
          onPress={() => router.push('/synastry' as Href)}
          style={({ pressed }) => [styles.heroCard, styles.synastryCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#3A1A28', '#12081F']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker">{t('dashboard.synastryKicker')}</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.synastryTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.synastryCopy')}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.synastryCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(580)}>
        <Pressable
          onPress={() => router.push('/ai-report' as Href)}
          style={({ pressed }) => [styles.heroCard, styles.grimoireCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#3A2A08', '#12081F']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker">{t('dashboard.grimoireKicker')}</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.grimoireTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.grimoireCopy')}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.grimoireCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(600)}>
        <Pressable
          onPress={() => router.push('/forge' as Href)}
          style={({ pressed }) => [styles.heroCard, styles.forgeCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#3A2808', '#12081F']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker">{t('dashboard.forgeKicker')}</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.forgeTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.forgeCopy')}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.forgeCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(620)}>
        <Pressable
          onPress={() => router.push('/(tabs)/signature-lab')}
          style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#2A1652', '#12081F']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroInner}
          >
            <AppText variant="kicker" style={styles.heroKicker}>
              {t('dashboard.labKicker')}
            </AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {t('dashboard.labTitle')}
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              {t('dashboard.labCopy')}
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                {t('dashboard.labCta')}
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(640)}>
        <GoldButton
          label={t('dashboard.recalculate')}
          onPress={() => {
            clearProfile();
            router.replace('/onboarding');
          }}
          style={styles.ghost}
        />
        <GhostButton
          disabled={leaving}
          label={leaving ? t('dashboard.signingOut') : t('dashboard.signOut')}
          onPress={() => {
            void (async () => {
              setLeaveError(undefined);
              setLeaving(true);
              try {
                await signOutCurrentUser();
                router.replace('/');
              } catch (caught) {
                setLeaveError(toUserError(caught));
                setLeaving(false);
              }
            })();
          }}
          style={styles.logout}
        />
        {__DEV__ ? (
          <GhostButton
            disabled={simulating}
            label={isPremium ? t('dashboard.devFree') : t('dashboard.devPro')}
            onPress={() => {
              void (async () => {
                setSimulating(true);
                setLeaveError(undefined);
                try {
                  await setPremiumUnlocked(!isPremium);
                } catch (caught) {
                  setLeaveError(toUserError(caught));
                } finally {
                  setSimulating(false);
                }
              })();
            }}
            style={styles.devToggle}
          />
        ) : null}
        {leaveError !== undefined ? (
          <AppText variant="body" style={styles.leaveError}>
            {leaveError}
          </AppText>
        ) : null}
      </Animated.View>
    </Screen>
  );
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

const styles = StyleSheet.create({
  intro: { marginBottom: 8 },
  introHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hello: {
    marginTop: 8,
  },
  meta: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 15,
  },
  seals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  dayChip: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.goldDim,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  dayLabel: {
    letterSpacing: 1.6,
  },
  dayValue: {
    fontSize: 18,
    fontFamily: fonts.bodyBold,
  },
  heroCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderColor: colors.line,
    borderWidth: 1,
  },
  triangleCard: {
    marginBottom: 14,
    borderColor: colors.gold,
  },
  oracleCard: {
    marginBottom: 14,
    borderColor: colors.gold,
  },
  synastryCard: {
    marginBottom: 14,
    borderColor: colors.goldSoft,
  },
  grimoireCard: {
    marginBottom: 14,
    borderColor: colors.gold,
  },
  forgeCard: {
    marginBottom: 14,
    borderColor: colors.goldSoft,
  },
  heroInner: {
    padding: 22,
    gap: 10,
  },
  heroKicker: {
    color: colors.neon,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroCta: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroCtaText: {
    color: colors.goldSoft,
    letterSpacing: 1,
  },
  pressed: { opacity: 0.92 },
  ghost: { marginTop: 22, opacity: 0.72 },
  logout: { marginTop: 12 },
  devToggle: { marginTop: 12, opacity: 0.55 },
  leaveError: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});
