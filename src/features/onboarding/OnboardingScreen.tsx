import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { extractLetters } from '../../domain/numerology';
import { useProfileStore } from '../../store/profile-store';
import { brazilianDateToIso, maskBrazilianDate } from '../../lib/dates';
import { colors } from '../../theme';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

export function OnboardingScreen() {
  const router = useRouter();
  const setProfile = useProfileStore((state) => state.setProfile);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  const onSubmit = () => {
    const trimmed = fullName.trim();
    const iso = brazilianDateToIso(birthDate);
    const letters = extractLetters(trimmed);
    const nextNameError =
      letters.length < 2 ? 'Informe o nome completo de registro.' : undefined;
    const nextDateError = iso === null ? 'Use o formato DD/MM/AAAA.' : undefined;

    setNameError(nextNameError);
    setDateError(nextDateError);
    if (nextNameError !== undefined || nextDateError !== undefined || iso === null) {
      return;
    }

    setProfile({ fullName: trimmed, birthDate: iso });
    router.replace('/(tabs)/dashboard');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Arcanum</Text>
        <Text style={styles.title}>A geometria{'\n'}do seu destino</Text>
        <Text style={styles.subtitle}>
          Pitágoras revela quem você é. A Cabala harmoniza como o mundo lê o seu nome.
        </Text>
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
          error={dateError}
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
        <GoldButton label="Descobrir Meu Destino" onPress={onSubmit} />
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
  kicker: {
    color: colors.gold,
    fontSize: 13,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ivory,
    fontSize: 40,
    fontWeight: '300',
    letterSpacing: 0.4,
    lineHeight: 46,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  form: { gap: 18 },
  cta: { marginTop: 'auto', paddingTop: 32 },
});
