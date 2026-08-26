import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabase, isSupabaseConfigured } from '../../services';
import { toUserError } from '../../lib/to-user-error';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

type AuthMode = 'login' | 'signup';

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [info, setInfo] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(undefined);
    setInfo(undefined);

    if (!isSupabaseConfigured()) {
      setError(toUserError(new Error('Supabase não configurado')));
      return;
    }

    if (!email.includes('@') || password.length < 6) {
      setError('Informe um e-mail válido e uma senha com ao menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (mode === 'signup') {
        const { data, error: signError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signError) {
          throw signError;
        }
        if (data.session === null) {
          setInfo('Conta criada. Confirme o e-mail para entrar no Arcanum.');
          return;
        }
        router.replace('/');
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) {
        throw loginError;
      }
      router.replace('/');
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <AppText variant="kicker">Arcanum</AppText>
        <AppText variant="display">
          {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
        </AppText>
        <AppText variant="body" style={styles.subtitle}>
          Seu mapa e suas firmas ficam sincronizados na nuvem.
        </AppText>
      </View>

      <View style={styles.form}>
        <Field
          autoCapitalize="none"
          autoComplete="email"
          error={error}
          keyboardType="email-address"
          label="E-mail"
          onChangeText={(value) => {
            setEmail(value);
            setError(undefined);
          }}
          placeholder="voce@email.com"
          value={email}
        />
        <Field
          autoCapitalize="none"
          autoComplete="password"
          label="Senha"
          onChangeText={(value) => {
            setPassword(value);
            setError(undefined);
          }}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
        />
        {info !== undefined ? (
          <AppText variant="body" style={styles.info}>
            {info}
          </AppText>
        ) : null}
      </View>

      <View style={styles.cta}>
        <GoldButton
          label={mode === 'login' ? 'Entrar' : 'Cadastrar'}
          loading={loading}
          onPress={() => {
            void onSubmit();
          }}
        />
        <Pressable
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(undefined);
            setInfo(undefined);
          }}
          style={styles.switch}
        >
          <AppText variant="body" style={styles.switchText}>
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </AppText>
        </Pressable>
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
  subtitle: { maxWidth: 340 },
  form: { gap: 18 },
  info: { color: '#9ED4B8' },
  cta: { marginTop: 'auto', paddingTop: 32 },
  switch: { alignItems: 'center', paddingVertical: 16 },
  switchText: { textAlign: 'center' },
});
