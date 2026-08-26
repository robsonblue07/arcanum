import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { calculatePythagoreanChart } from '../../domain/numerology';
import { calculatePersonalDay } from '../../lib/personal-day';
import { formatDisplayDate } from '../../lib/dates';
import { useProfileStore } from '../../store/profile-store';
import { colors, radii } from '../../theme';
import { GoldButton } from '../../ui/GoldButton';
import { NumberSeal } from '../../ui/NumberSeal';
import { Screen } from '../../ui/Screen';

export function DashboardScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const clearProfile = useProfileStore((state) => state.clearProfile);

  if (profile === null) {
    return null;
  }

  const chart = calculatePythagoreanChart(profile.fullName, profile.birthDate);
  const personalDay = calculatePersonalDay(profile.birthDate);

  return (
    <Screen>
      <Text style={styles.kicker}>Mapa pessoal</Text>
      <Text style={styles.hello}>Olá, {firstName(profile.fullName)}</Text>
      <Text style={styles.meta}>{formatDisplayDate(profile.birthDate)}</Text>

      <View style={styles.seals}>
        <NumberSeal caption="Destino" size="lg" value={chart.destinyNumber} />
        <NumberSeal caption="Missão" value={chart.expressionNumber} />
      </View>

      <View style={styles.dayChip}>
        <Text style={styles.dayLabel}>Dia pessoal</Text>
        <Text style={styles.dayValue}>{personalDay}</Text>
      </View>

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
          <Text style={styles.heroKicker}>Laboratório Cabalístico</Text>
          <Text style={styles.heroTitle}>Analisar e Retificar Assinatura</Text>
          <Text style={styles.heroCopy}>
            Descubra bloqueios no Triângulo da Vida e receba firmas harmônicas com o seu Destino.
          </Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Entrar no laboratório</Text>
          </View>
        </LinearGradient>
      </Pressable>

      <GoldButton
        label="Recalcular nascimento"
        onPress={() => {
          clearProfile();
          router.replace('/');
        }}
        style={styles.ghost}
      />
    </Screen>
  );
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  hello: {
    color: colors.ivory,
    fontSize: 32,
    fontWeight: '300',
    marginTop: 8,
  },
  meta: {
    color: colors.mist,
    marginTop: 4,
    marginBottom: 28,
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
    color: colors.mist,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  dayValue: {
    color: colors.goldSoft,
    fontSize: 18,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderColor: colors.line,
    borderWidth: 1,
  },
  heroInner: {
    padding: 22,
    gap: 10,
  },
  heroKicker: {
    color: colors.neon,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ivory,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  heroCopy: {
    color: colors.mist,
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
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.92 },
  ghost: { marginTop: 22, opacity: 0.72 },
});
