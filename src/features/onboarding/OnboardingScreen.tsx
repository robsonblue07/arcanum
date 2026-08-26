import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calculatePythagoreanChart, extractLetters } from '../../domain/numerology';
import { brazilianDateToIso, maskBrazilianDate } from '../../lib/dates';
import { isSupabaseConfigured, upsertProfile } from '../../services';
import { toUserError } from '../../lib/to-user-error';
import { useAuthStore } from '../../store/auth-store';
import { useProfileStore } from '../../store/profile-store';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

export function OnboardingScreen() {
  const router = useRouter();
  const setProfile = useProfileStore((state) => state.setProfile);
  const userId = useAuthStore((state) => state.session?.user.id);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [saveError, setSaveError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const trimmed = fullName.trim();
    const iso = brazilianDateToIso(birthDate);
    const letters = extractLetters(trimmed);
    const nextNameError =
      letters.length < 2 ? 'Informe o nome completo de registro.' : undefined;
    const nextDateError = iso === null ? 'Use o formato DD/MM/AAAA.' : undefined;

    setNameError(nextNameError);
    setDateError(nextDateError);
    setSaveError(undefined);
    if (nextNameError !== undefined || nextDateError !== undefined || iso === null) {
      return;
    }

    const chart = calculatePythagoreanChart(trimmed, iso);

    const previousPremium = useProfileStore.getState().profile?.isPremium === true;
    const localProfile = { fullName: trimmed, birthDate: iso, isPremium: previousPremium };

    if (userId !== undefined && isSupabaseConfigured()) {
      setLoading(true);
      try {
        await upsertProfile({
          id: userId,
          nome_completo: trimmed,
          data_nascimento: iso,
          destino: chart.destinyNumber,
          expressao: chart.expressionNumber,
        });
        setProfile(localProfile);
      } catch (caught) {
        setSaveError(toUserError(caught));
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      setProfile(localProfile);
    }

    router.replace('/(tabs)/dashboard');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <AppText variant="kicker">Arcanum</AppText>
        <AppText variant="display">A geometria{'\n'}do seu destino</AppText>
        <AppText variant="body" style={styles.subtitle}>
          Pitágoras revela quem você é. A Cabala harmoniza como o mundo lê o seu nome.
        </AppText>
      </View>

      <View style={styles.form}>
        <Field
          autoCapitalize="words"
          error={nameError}
          label="Nome Completo de Registro"
          onChangeText={(value) => {
            setFullName(value);
            setNameError(undefined);
          }}
          placeholder="Como consta na certidão"
          value={fullName}
        />
        <Field
          error={dateError ?? saveError}
          keyboardType="number-pad"
          label="Data de Nascimento"
          onChangeText={(value) => {
            setBirthDate(maskBrazilianDate(value));
            setDateError(undefined);
          }}
          placeholder="DD/MM/AAAA"
          value={birthDate}
        />
      </View>

      <View style={styles.cta}>
        <GoldButton
          label="Descobrir Meu Destino"
          loading={loading}
          onPress={() => {
            void onSubmit();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 28,
    marginBottom: 36,
    gap: 14,
  },
  subtitle: {
    maxWidth: 340,
  },
  form: { gap: 18 },
  cta: { marginTop: 'auto', paddingTop: 32 },
});
