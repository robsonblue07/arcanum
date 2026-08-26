import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
import { NumberSeal } from '../../ui/NumberSeal';
import { Screen } from '../../ui/Screen';

export function DashboardScreen() {
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
        <AppText variant="kicker">Mapa pessoal</AppText>
        <AppText variant="title" style={styles.hello}>
          Olá, {firstName(profile.fullName)}
        </AppText>
        <AppText variant="body" style={styles.meta}>
          {formatDisplayDate(profile.birthDate)}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(700).delay(180)} style={styles.seals}>
        <NumberSeal caption="Destino" size="lg" value={chart.destinyNumber} />
        <NumberSeal caption="Missão" value={chart.expressionNumber} />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(650).delay(320)} style={styles.dayChip}>
        <AppText variant="caption" style={styles.dayLabel}>
          Dia pessoal
        </AppText>
        <AppText variant="number" style={styles.dayValue}>
          {personalDay}
        </AppText>
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
            <AppText variant="kicker">Visão cabalística</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              Explorar Meu Triângulo da Vida
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              Toque nos números da pirâmide e revele os arcanos que vibram no seu nome.
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                Abrir visualizador
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
            <AppText variant="kicker">Compatibilidade</AppText>
            <AppText variant="title" style={styles.heroTitle}>
              Oráculo da Aliança: Sinastria de Nomes
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              Cruze Destinos, triângulos e os 99 Arcanos Cabalísticos. Descubra se a outra firma acende o seu caminho — ou o seu bloqueio.
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                Abrir oráculo
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
              Laboratório Cabalístico
            </AppText>
            <AppText variant="title" style={styles.heroTitle}>
              Analisar e Retificar Assinatura
            </AppText>
            <AppText variant="body" style={styles.heroCopy}>
              Descubra bloqueios no Triângulo da Vida e receba firmas harmônicas com o seu Destino.
            </AppText>
            <View style={styles.heroCta}>
              <AppText variant="caption" style={styles.heroCtaText}>
                Entrar no laboratório
              </AppText>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(640)}>
        <GoldButton
          label="Recalcular nascimento"
          onPress={() => {
            clearProfile();
            router.replace('/onboarding');
          }}
          style={styles.ghost}
        />
        <GhostButton
          disabled={leaving}
          label={leaving ? 'Saindo...' : 'Sair da conta'}
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
            label={isPremium ? 'Dev: simular modo Free' : 'Dev: simular compra Pro'}
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
  synastryCard: {
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
